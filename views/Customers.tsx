import React, { useState } from 'react';
import { useAppContext } from '../App';
import { PlusCircle, Edit, Trash2, X, FileDown } from 'lucide-react';
import { Customer } from '../types';

const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const header = Object.keys(data[0]);
    const csvRows = [
      header.join(','), 
      ...data.map(row =>
        header
          .map(fieldName => {
            let value = row[fieldName];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`; 
            }
            return value;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const Customers: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formState, setFormState] = useState<Omit<Customer, 'id'>>({
        name: '',
        phone: '',
        address: '',
        email: '',
        vehicles: [{ plateNumber: '', model: '' }],
    });

    const handleExport = () => {
        const dataToExport = customers.map(c => ({
            'ID': c.id,
            'Nama': c.name,
            'Telepon': c.phone,
            'Alamat': c.address,
            'Email': c.email || '',
            'Kendaraan': c.vehicles.map(v => `${v.model} (${v.plateNumber})`).join('; ')
        }));
        exportToCSV(dataToExport, 'daftar_pelanggan');
    };

    const handleOpenAddModal = () => {
        setFormState({
            name: '', phone: '', address: '', email: '', vehicles: [{ plateNumber: '', model: '' }],
        });
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormState(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const vehicles = [...formState.vehicles];
        vehicles[0] = { ...vehicles[0], [name]: value };
        setFormState(prev => ({ ...prev, vehicles }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.name || !formState.phone || !formState.vehicles[0].plateNumber) {
            alert("Nama, Telepon, dan Plat Nomor wajib diisi.");
            return;
        }

        if (editingCustomer) {
            updateCustomer({ ...editingCustomer, ...formState });
        } else {
            addCustomer(formState);
        }
        handleCloseModal();
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
            deleteCustomer(id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manajemen Pelanggan</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleExport}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <FileDown className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Tambah Pelanggan
                    </button>
                </div>
            </div>
            <div className="mb-4">
                 <input type="text" placeholder="Cari pelanggan berdasarkan nama atau plat nomor..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">Telepon</th>
                            <th className="px-6 py-3">Alamat</th>
                            <th className="px-6 py-3">Kendaraan</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                             <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                <td className="px-6 py-4">{customer.phone}</td>
                                <td className="px-6 py-4">{customer.address}</td>
                                <td className="px-6 py-4">
                                    {customer.vehicles.map(v => `${v.model} (${v.plateNumber})`).join(', ')}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleOpenEditModal(customer)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* Add/Edit Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h3>
                             <button onClick={handleCloseModal}><X className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" name="name" placeholder="Nama" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required/>
                            <input type="text" name="phone" placeholder="Telepon" value={formState.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required/>
                            <input type="text" name="address" placeholder="Alamat" value={formState.address} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md"/>
                            <input type="email" name="email" placeholder="Email (Opsional)" value={formState.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md"/>
                            <fieldset className="border p-4 rounded-md">
                                <legend className="px-2 font-medium">Kendaraan</legend>
                                <div className="flex gap-4">
                                    <input type="text" name="plateNumber" placeholder="Plat Nomor" value={formState.vehicles[0].plateNumber} onChange={handleVehicleChange} className="w-full px-3 py-2 border rounded-md" required/>
                                    <input type="text" name="model" placeholder="Model Kendaraan" value={formState.vehicles[0].model} onChange={handleVehicleChange} className="w-full px-3 py-2 border rounded-md" required/>
                                </div>
                            </fieldset>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
