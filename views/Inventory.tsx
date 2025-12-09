import React, { useState } from 'react';
import { useAppContext } from '../App';
import { AlertTriangle, Edit, Trash2, PlusCircle, X, FileDown } from 'lucide-react';
import { Part } from '../types';

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

const Inventory: React.FC = () => {
    const { parts, addPart, updatePart, deletePart } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [newPart, setNewPart] = useState<Omit<Part, 'id'>>({
        name: '',
        category: '',
        stock: 0,
        buyPrice: 0,
        sellPrice: 0,
        unit: 'Pcs',
    });
    
    const handleExport = () => {
        const dataToExport = parts.map(({ id, ...rest }) => rest);
        exportToCSV(dataToExport, 'inventori_suku_cadang');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEditing: boolean = false) => {
        const { name, value } = e.target;
        const isNumber = ['stock', 'buyPrice', 'sellPrice'].includes(name);
        const processedValue = isNumber ? parseFloat(value) : value;

        if (isEditing && editingPart) {
            setEditingPart(prev => prev ? { ...prev, [name]: processedValue } : null);
        } else {
            setNewPart(prev => ({ ...prev, [name]: processedValue }));
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newPart.name && newPart.category && newPart.unit) {
            addPart(newPart);
            setIsAddModalOpen(false);
            setNewPart({ name: '', category: '', stock: 0, buyPrice: 0, sellPrice: 0, unit: 'Pcs' });
        } else {
            alert("Harap lengkapi semua field.");
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPart) {
            updatePart(editingPart);
            setEditingPart(null);
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus suku cadang ini?')) {
            deletePart(id);
        }
    };
    
    const handleOpenEditModal = (part: Part) => {
        setEditingPart({ ...part });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Inventori Suku Cadang</h2>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={handleExport}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <FileDown className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Tambah Suku Cadang
                    </button>
                </div>
            </div>
             <div className="mb-4">
                 <input type="text" placeholder="Cari suku cadang..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Part</th>
                            <th scope="col" className="px-6 py-3">Kategori</th>
                            <th scope="col" className="px-6 py-3">Stok</th>
                            <th scope="col" className="px-6 py-3">Harga Beli</th>
                            <th scope="col" className="px-6 py-3">Harga Jual</th>
                            <th scope="col" className="px-6 py-3">Satuan</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.map(part => (
                            <tr key={part.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{part.name}</td>
                                <td className="px-6 py-4">{part.category}</td>
                                <td className={`px-6 py-4 font-bold ${part.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                    <div className="flex items-center">
                                        {part.stock}
                                        {part.stock < 5 && <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{part.buyPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                <td className="px-6 py-4">{part.sellPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                <td className="px-6 py-4">{part.unit}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleOpenEditModal(part)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* Add/Edit Part Modal */}
            {(isAddModalOpen || editingPart) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">{editingPart ? 'Edit Suku Cadang' : 'Tambah Suku Cadang Baru'}</h3>
                            <button onClick={() => { setIsAddModalOpen(false); setEditingPart(null); }}><X className="w-6 h-6"/></button>
                        </div>
                        
                        <form onSubmit={editingPart ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Part</label>
                                <input type="text" name="name" value={editingPart ? editingPart.name : newPart.name} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input type="text" name="category" value={editingPart ? editingPart.category : newPart.category} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                                    <input type="number" name="stock" value={editingPart ? editingPart.stock : newPart.stock} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Satuan</label>
                                    <select name="unit" value={editingPart ? editingPart.unit : newPart.unit} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required>
                                        <option>Pcs</option>
                                        <option>Set</option>
                                        <option>Liter</option>
                                        <option>Box</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Harga Beli</label>
                                    <input type="number" name="buyPrice" value={editingPart ? editingPart.buyPrice : newPart.buyPrice} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
                                    <input type="number" name="sellPrice" value={editingPart ? editingPart.sellPrice : newPart.sellPrice} onChange={(e) => handleInputChange(e, !!editingPart)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingPart(null); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
