
import React, { useState } from 'react';
import { useAppContext } from '../App';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import { PaymentMethod } from '../types';

const PaymentMethods: React.FC = () => {
    const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [formState, setFormState] = useState<Omit<PaymentMethod, 'id'>>({
        name: '',
        status: 'Aktif',
    });

    const handleOpenAddModal = () => {
        setFormState({ name: '', status: 'Aktif' });
        setEditingMethod(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (method: PaymentMethod) => {
        setEditingMethod(method);
        setFormState(method);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMethod(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMethod) {
            updatePaymentMethod({ ...editingMethod, ...formState });
        } else {
            addPaymentMethod(formState);
        }
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
            deletePaymentMethod(id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manajemen Metode Pembayaran</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Tambah Metode
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama Metode</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentMethods.map(method => (
                            <tr key={method.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{method.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${method.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {method.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button onClick={() => handleOpenEditModal(method)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Edit Metode"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors" title="Hapus Metode"><Trash2 className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">{editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Baru'}</h3>
                             <button onClick={handleCloseModal}><X className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Metode</label>
                                <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                            </div>
                           
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formState.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 shadow-sm focus:outline-none focus:ring-accent focus:border-accent">
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

export default PaymentMethods;
