import React, { useState } from 'react';
import { useAppContext } from '../App';
import { PlusCircle, Edit, Trash2, ShoppingBag, X, FileDown } from 'lucide-react';
import { Supplier, Purchase } from '../types';

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

const Suppliers: React.FC = () => {
    const { suppliers, parts, addSupplier, updatePart } = useAppContext();
    const [isAddSupplierModalOpen, setAddSupplierModalOpen] = useState(false);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    
    const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'purchaseHistory'>>({
        name: '', contact: '', address: '', status: 'Aktif'
    });

    const [newPurchase, setNewPurchase] = useState({
        supplierId: 0, partId: 0, quantity: 1, buyPrice: 0, date: new Date().toISOString().split('T')[0]
    });

    const handleExport = () => {
        const dataToExport = suppliers.map(s => ({
            'ID': s.id,
            'Nama': s.name,
            'Kontak': s.contact,
            'Alamat': s.address,
            'Status': s.status,
        }));
        exportToCSV(dataToExport, 'daftar_supplier');
    };

    const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSupplier(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierSubmit = (e: React.FormEvent) => {
        e.preventDefault();
         if (!newSupplier.name || !newSupplier.contact || !newSupplier.address) {
            alert("Harap lengkapi Nama, Kontak, dan Alamat.");
            return;
        }
        addSupplier({...newSupplier, purchaseHistory: []});
        setAddSupplierModalOpen(false);
        setNewSupplier({ name: '', contact: '', address: '', status: 'Aktif' });
    };

    const handlePurchaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const partToUpdate = parts.find(p => p.id === newPurchase.partId);
        if (partToUpdate) {
            const updatedPart = { ...partToUpdate, stock: partToUpdate.stock + newPurchase.quantity };
            updatePart(updatedPart);
            // Here you would also add the purchase to the supplier's history,
            // but for now we just update the stock as per the core logic.
            setPurchaseModalOpen(false);
            setNewPurchase({ supplierId: 0, partId: 0, quantity: 1, buyPrice: 0, date: new Date().toISOString().split('T')[0] });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manajemen Supplier & Pembelian</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExport}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <FileDown className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>
                    <button 
                        onClick={() => setPurchaseModalOpen(true)}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Catat Pembelian
                    </button>
                    <button 
                        onClick={() => setAddSupplierModalOpen(true)}
                        className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Tambah Supplier
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama Supplier</th>
                            <th className="px-6 py-3">Kontak</th>
                            <th className="px-6 py-3">Alamat</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(supplier => (
                            <tr key={supplier.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                                <td className="px-6 py-4">{supplier.contact}</td>
                                <td className="px-6 py-4">{supplier.address}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${supplier.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {supplier.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-blue-600 hover:text-blue-800 mr-2"><Edit className="w-5 h-5"/></button>
                                    <button className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Supplier Modal */}
            {isAddSupplierModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Tambah Supplier Baru</h3>
                            <button onClick={() => setAddSupplierModalOpen(false)}><X className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleSupplierSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Supplier</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={newSupplier.name} 
                                    onChange={handleNewSupplierChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kontak (Telepon/Email)</label>
                                <input 
                                    type="text" 
                                    name="contact" 
                                    value={newSupplier.contact} 
                                    onChange={handleNewSupplierChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={newSupplier.address} 
                                    onChange={handleNewSupplierChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select 
                                    name="status" 
                                    value={newSupplier.status} 
                                    onChange={handleNewSupplierChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setAddSupplierModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Purchase Modal */}
            {isPurchaseModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6">Catat Pembelian Baru</h3>
                        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                            {/* Form fields */}
                            <div>
                               <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                <select className="mt-1 block w-full" onChange={e => setNewPurchase({...newPurchase, supplierId: parseInt(e.target.value)})}>
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-700">Suku Cadang</label>
                                <select className="mt-1 block w-full" onChange={e => setNewPurchase({...newPurchase, partId: parseInt(e.target.value)})}>
                                    <option value="">Pilih Suku Cadang</option>
                                    {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                               <input type="number" value={newPurchase.quantity} onChange={e => setNewPurchase({...newPurchase, quantity: parseInt(e.target.value)})} className="mt-1 block w-full" />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setPurchaseModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan Pembelian</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
