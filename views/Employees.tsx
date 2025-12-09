import React, { useState } from 'react';
import { useAppContext } from '../App';
import { PlusCircle, Edit, Trash2, X, FileDown } from 'lucide-react';
import { Employee, Role } from '../types';

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

const Employees: React.FC = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formState, setFormState] = useState<Omit<Employee, 'id'>>({
        name: '',
        role: Role.Mechanic,
        phone: '',
        status: 'Aktif',
        specialization: ''
    });

    const handleExport = () => {
        const dataToExport = employees.map(e => ({
            'ID': e.id,
            'Nama': e.name,
            'Role': e.role,
            'Telepon': e.phone,
            'Status': e.status,
            'Spesialisasi': e.specialization || '-',
        }));
        exportToCSV(dataToExport, 'daftar_karyawan');
    };

    const handleOpenAddModal = () => {
        setFormState({ name: '', role: Role.Mechanic, phone: '', status: 'Aktif', specialization: '' });
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormState(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const employeeData = { ...formState };
        if (employeeData.role !== Role.Mechanic) {
            employeeData.specialization = '';
        }

        if (editingEmployee) {
            updateEmployee({ ...editingEmployee, ...employeeData });
        } else {
            addEmployee(employeeData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            deleteEmployee(id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manajemen Karyawan</h2>
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
                        Tambah Karyawan
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama Karyawan</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Spesialisasi</th>
                            <th className="px-6 py-3">Telepon</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee => (
                            <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{employee.name}</td>
                                <td className="px-6 py-4">{employee.role}</td>
                                <td className="px-6 py-4">{employee.specialization || '-'}</td>
                                <td className="px-6 py-4">{employee.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleOpenEditModal(employee)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Employee Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h3>
                             <button onClick={handleCloseModal}><X className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <input type="text" name="phone" value={formState.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role" value={formState.role} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md mt-1">
                                    {Object.values(Role).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            {formState.role === Role.Mechanic && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Spesialisasi</label>
                                    <input type="text" name="specialization" placeholder="Contoh: Mesin, Kelistrikan, AC" value={formState.specialization || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md mt-1" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formState.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md mt-1">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
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

export default Employees;
