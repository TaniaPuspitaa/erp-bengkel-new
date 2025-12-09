import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../App';
import { PlusCircle, Edit, Trash2, X, ShoppingCart, Sparkles, Loader2, CreditCard, FileDown } from 'lucide-react';
import { ServiceOrder, ServiceStatus, PaymentStatus, Role, Part, OrderPart, PaymentMethod as PaymentMethodType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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

const ServiceOrders: React.FC = () => {
    const { orders, customers, employees, parts, addOrder, updateOrder, deleteOrder, addPayment, currentUser, payments: allPayments, paymentMethods } = useAppContext();
    
    // State for Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // State for Forms
    const [newOrder, setNewOrder] = useState<Omit<ServiceOrder, 'id' | 'totalCost'>>({
        customer: { id: 0, name: '', vehicle: '' },
        complaint: '',
        mechanicId: 0,
        date: new Date().toISOString().split('T')[0],
        status: ServiceStatus.Queue,
        partsUsed: [],
        serviceFee: 0,
        paymentStatus: PaymentStatus.Unpaid,
    });
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [partToAdd, setPartToAdd] = useState({ partId: '', quantity: 1 });
    
    // AI Recommendation State
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);


    // Memoization
    const mechanics = useMemo(() => employees.filter(e => e.role === Role.Mechanic), [employees]);
    const activePaymentMethods = useMemo(() => paymentMethods.filter(pm => pm.status === 'Aktif'), [paymentMethods]);

    useEffect(() => {
        if (activePaymentMethods.length > 0 && !paymentMethod) {
            setPaymentMethod(activePaymentMethods[0].name);
        }
    }, [activePaymentMethods, paymentMethod]);
    
    const handleExport = () => {
        const dataToExport = orders.map(order => ({
            'ID_Order': order.id,
            'Pelanggan': order.customer.name,
            'Kendaraan': order.customer.vehicle,
            'Keluhan': order.complaint,
            'Mekanik': employees.find(e => e.id === order.mechanicId)?.name || 'N/A',
            'Tanggal': order.date,
            'Status': order.status,
            'Total_Biaya': order.totalCost,
            'Status_Pembayaran': order.paymentStatus
        }));
        exportToCSV(dataToExport, 'daftar_order_servis');
    };

    // Handlers for Add Modal
    const handleAddModalOpen = () => {
        setNewOrder({
            customer: { id: 0, name: '', vehicle: '' },
            complaint: '',
            mechanicId: 0,
            date: new Date().toISOString().split('T')[0],
            status: ServiceStatus.Queue,
            partsUsed: [],
            serviceFee: 0,
            paymentStatus: PaymentStatus.Unpaid,
        });
        setIsAddModalOpen(true);
    };

    const handleNewOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "customerId") {
            const selectedCustomer = customers.find(c => c.id === parseInt(value));
            if (selectedCustomer) {
                setNewOrder(prev => ({ ...prev, customer: { id: selectedCustomer.id, name: selectedCustomer.name, vehicle: selectedCustomer.vehicles[0]?.plateNumber || '' }}));
            }
        } else if (name === "mechanicId") {
             setNewOrder(prev => ({ ...prev, mechanicId: parseInt(value) }));
        } else {
            setNewOrder(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const plateNumber = e.target.value;
        setNewOrder(prev => ({...prev, customer: {...prev.customer, vehicle: plateNumber}}));
    };

    const handleNewOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrder.customer.id && newOrder.mechanicId && newOrder.complaint) {
            addOrder({ ...newOrder, totalCost: 0 });
            setIsAddModalOpen(false);
        } else {
            alert("Harap lengkapi semua field yang wajib diisi.");
        }
    };
    
    // Handlers for Edit Modal
    const handleEditOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingOrder) return;
        const { name, value } = e.target;
        const isNumber = ['serviceFee', 'mechanicId'].includes(name);
        setEditingOrder(prev => prev ? { ...prev, [name]: isNumber ? Number(value) : value } : null);
    };

    const handleAddPartToOrder = () => {
        if (!editingOrder || !partToAdd.partId || partToAdd.quantity <= 0) return;
        
        const partInfo = parts.find(p => p.id === Number(partToAdd.partId));
        if (!partInfo) return;

        // Check if part already exists in order
        const existingPartIndex = editingOrder.partsUsed.findIndex(p => p.partId === partInfo.id);

        if (existingPartIndex > -1) {
            // Update quantity
            const updatedPartsUsed = [...editingOrder.partsUsed];
            updatedPartsUsed[existingPartIndex].quantity += partToAdd.quantity;
            setEditingOrder({ ...editingOrder, partsUsed: updatedPartsUsed });
        } else {
            // Add new part
            const newPart: OrderPart = {
                partId: partInfo.id,
                quantity: partToAdd.quantity,
                unitPrice: partInfo.sellPrice,
            };
            setEditingOrder({ ...editingOrder, partsUsed: [...editingOrder.partsUsed, newPart] });
        }
        setPartToAdd({ partId: '', quantity: 1 });
    };

    const handleRemovePartFromOrder = (partId: number) => {
        if (!editingOrder) return;
        const updatedParts = editingOrder.partsUsed.filter(p => p.partId !== partId);
        setEditingOrder({ ...editingOrder, partsUsed: updatedParts });
    };

    const handleUpdateOrderSubmit = () => {
        if (!editingOrder) return;
        const totalPartsCost = editingOrder.partsUsed.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
        const totalCost = totalPartsCost + editingOrder.serviceFee;
        updateOrder({ ...editingOrder, totalCost });
        setEditingOrder(null);
    };

    // Handlers for Payment Modal
    const openPaymentModal = () => {
        setRecommendation(null);
        setAiError(null);
        setIsPaymentModalOpen(true);
    };

    const handleProcessPayment = () => {
        if (!editingOrder) return;
        const totalPartsCost = editingOrder.partsUsed.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
        const totalCost = totalPartsCost + editingOrder.serviceFee;
        
        addPayment({
            orderId: editingOrder.id,
            amount: totalCost,
            method: paymentMethod,
            date: new Date().toISOString().split('T')[0]
        });
        
        // Ensure order data is updated before closing
        updateOrder({ ...editingOrder, totalCost, paymentStatus: PaymentStatus.Paid });

        setIsPaymentModalOpen(false);
        setEditingOrder(null);
    };
    
    const handleDeleteOrder = (id: number) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus order ini? Aksi ini tidak dapat dibatalkan.')) {
            deleteOrder(id);
        }
    };
    
    // Gemini AI Recommendation Function
    const getPaymentRecommendation = async () => {
        if (!editingOrder) return;
        
        setIsRecommending(true);
        setRecommendation(null);
        setAiError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const customerId = editingOrder.customer.id;
            const customerOrders = orders.filter(o => o.customer.id === customerId && o.id !== editingOrder.id);
            const customerPayments = allPayments.filter(p => customerOrders.some(o => o.id === p.orderId));
            
            let paymentHistory = "Tidak ada riwayat pembayaran sebelumnya.";
            if (customerPayments.length > 0) {
                paymentHistory = customerPayments
                    .map(p => `- ${p.date}: ${p.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} via ${p.method}`)
                    .join('\n');
            }
            
            const activeMethodNames = activePaymentMethods.map(m => m.name);
            const prompt = `
                Analisis data pelanggan bengkel mobil berikut:
                - Nama Pelanggan: ${editingOrder.customer.name}
                - Total Tagihan Saat Ini: ${totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                - Riwayat Pembayaran:
                ${paymentHistory}

                Berdasarkan analisis ini, rekomendasikan satu metode pembayaran yang paling sesuai dari pilihan berikut: ${activeMethodNames.join(', ')}. Berikan juga alasan singkat yang ramah dan membantu untuk rekomendasi Anda dalam Bahasa Indonesia.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            recommendedMethod: {
                                type: Type.STRING,
                                enum: activeMethodNames,
                            },
                            reason: {
                                type: Type.STRING,
                            }
                        },
                        required: ['recommendedMethod', 'reason']
                    }
                }
            });

            const resultText = response.text.trim();
            const resultJson = JSON.parse(resultText);

            if (resultJson.recommendedMethod && activeMethodNames.includes(resultJson.recommendedMethod)) {
                setPaymentMethod(resultJson.recommendedMethod);
                setRecommendation(resultJson.reason);
            } else {
                throw new Error("Rekomendasi metode pembayaran tidak valid.");
            }

        } catch (error) {
            console.error("Error getting payment recommendation:", error);
            setAiError("Maaf, terjadi kesalahan saat mendapatkan rekomendasi. Silakan coba lagi.");
        } finally {
            setIsRecommending(false);
        }
    };

    const selectedCustomerForModal = customers.find(c => c.id === newOrder.customer.id);
    const totalPartsCost = useMemo(() => {
        return editingOrder?.partsUsed.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0) ?? 0;
    }, [editingOrder?.partsUsed]);
    const totalCost = useMemo(() => {
        return totalPartsCost + (editingOrder?.serviceFee ?? 0);
    }, [totalPartsCost, editingOrder?.serviceFee]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manajemen Order Servis</h2>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={handleExport}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <FileDown className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>
                    <button 
                        onClick={handleAddModalOpen}
                        className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Tambah Order Baru
                    </button>
                </div>
            </div>
             <div className="mb-4">
                 <input type="text" placeholder="Cari order berdasarkan nama pelanggan atau keluhan..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Pelanggan</th>
                            <th className="px-6 py-3">Kendaraan</th>
                            <th className="px-6 py-3">Keluhan</th>
                            <th className="px-6 py-3">Mekanik</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Total Biaya</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                             <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{order.customer.name}</td>
                                <td className="px-6 py-4">{order.customer.vehicle}</td>
                                <td className="px-6 py-4">{order.complaint}</td>
                                <td className="px-6 py-4">{employees.find(e => e.id === order.mechanicId)?.name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === ServiceStatus.Done ? 'bg-green-100 text-green-800' :
                                        order.status === ServiceStatus.Process ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">{order.totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        {order.status === ServiceStatus.Done && order.paymentStatus === PaymentStatus.Unpaid && (
                                            <button 
                                                onClick={() => {
                                                    setEditingOrder(order);
                                                    openPaymentModal();
                                                }}
                                                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                                                title="Proses Pembayaran"
                                            >
                                                <CreditCard className="w-5 h-5"/>
                                            </button>
                                        )}
                                        <button onClick={() => setEditingOrder(order)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Edit Detail"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors" title="Hapus Order"><Trash2 className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Add Order Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6">Tambah Order Servis Baru</h3>
                        <form onSubmit={handleNewOrderSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
                                <select name="customerId" onChange={handleNewOrderChange} value={newOrder.customer.id} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required>
                                    <option value="">Pilih Pelanggan</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            
                            {selectedCustomerForModal && selectedCustomerForModal.vehicles.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kendaraan</label>
                                    <select name="vehicle" onChange={handleVehicleChange} value={newOrder.customer.vehicle} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required>
                                         {selectedCustomerForModal.vehicles.map(v => <option key={v.plateNumber} value={v.plateNumber}>{v.model} ({v.plateNumber})</option>)}
                                    </select>
                                </div>
                            )}

                             <div>
                                <label className="block text-sm font-medium text-gray-700">Keluhan</label>
                                <textarea name="complaint" value={newOrder.complaint} onChange={handleNewOrderChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Mekanik</label>
                                <select name="mechanicId" onChange={handleNewOrderChange} value={newOrder.mechanicId} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required>
                                    <option value="">Pilih Mekanik</option>
                                    {mechanics.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.specialization ? `(${m.specialization})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" name="date" value={newOrder.date} onChange={handleNewOrderChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" required />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Detail & Edit Order Servis #{editingOrder.id}</h3>
                             <button onClick={() => setEditingOrder(null)}><X className="w-6 h-6"/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6">
                            {/* Order Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Pelanggan</p>
                                    <p className="font-semibold">{editingOrder.customer.name}</p>
                                </div>
                                 <div>
                                    <p className="text-sm text-gray-500">Kendaraan</p>
                                    <p className="font-semibold">{editingOrder.customer.vehicle}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Keluhan</p>
                                    <p className="font-semibold">{editingOrder.complaint}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mekanik</label>
                                    <select name="mechanicId" value={editingOrder.mechanicId} onChange={handleEditOrderChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                        {mechanics.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} {m.specialization ? `(${m.specialization})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Order</label>
                                    <select name="status" value={editingOrder.status} onChange={handleEditOrderChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                        {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Parts & Services */}
                            <div className="p-4 border rounded-lg space-y-4">
                               <h4 className="font-semibold text-lg">Suku Cadang & Jasa</h4>
                                {/* Add Part Form */}
                                <div className="flex items-end gap-2 p-2 bg-gray-50 rounded-md">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium">Suku Cadang</label>
                                        <select value={partToAdd.partId} onChange={e => setPartToAdd({...partToAdd, partId: e.target.value})} className="w-full mt-1 p-2 border rounded-md">
                                            <option value="">Pilih Suku Cadang</option>
                                            {parts.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Jumlah</label>
                                        <input type="number" min="1" value={partToAdd.quantity} onChange={e => setPartToAdd({...partToAdd, quantity: Number(e.target.value)})} className="w-24 mt-1 p-2 border rounded-md" />
                                    </div>
                                    <button onClick={handleAddPartToOrder} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tambah</button>
                                </div>

                                {/* Parts Used Table */}
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Nama Part</th>
                                            <th className="text-center py-2">Jumlah</th>
                                            <th className="text-right py-2">Harga Satuan</th>
                                            <th className="text-right py-2">Subtotal</th>
                                            <th className="text-center py-2">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editingOrder.partsUsed.map(partUsed => {
                                            const partInfo = parts.find(p => p.id === partUsed.partId);
                                            return (
                                                <tr key={partUsed.partId} className="border-b">
                                                    <td className="py-2">{partInfo?.name ?? 'N/A'}</td>
                                                    <td className="py-2 text-center">{partUsed.quantity}</td>
                                                    <td className="py-2 text-right">{partUsed.unitPrice.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}</td>
                                                    <td className="py-2 text-right">{(partUsed.quantity * partUsed.unitPrice).toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}</td>
                                                    <td className="py-2 text-center"><button onClick={() => handleRemovePartFromOrder(partUsed.partId)} className="text-red-500 hover:text-red-700">Hapus</button></td>
                                                </tr>
                                            )
                                        })}
                                        {editingOrder.partsUsed.length === 0 && (
                                            <tr><td colSpan={5} className="text-center py-4 text-gray-500">Belum ada suku cadang ditambahkan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                
                                {/* Service Fee */}
                                <div className="flex justify-end items-center gap-4">
                                     <label className="font-medium">Jasa Servis:</label>
                                     <input type="number" name="serviceFee" value={editingOrder.serviceFee} onChange={handleEditOrderChange} className="w-48 p-2 text-right border rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Footer & Summary */}
                        <div className="mt-auto pt-6 border-t">
                             <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-gray-500">Total Suku Cadang: {totalPartsCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                    <p className="text-gray-500">Total Jasa: {editingOrder.serviceFee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                    <p className="text-xl font-bold">Total Biaya: {totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setEditingOrder(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                    {editingOrder.status === ServiceStatus.Done && editingOrder.paymentStatus === PaymentStatus.Unpaid && (
                                        <button onClick={openPaymentModal} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                                            Proses Pembayaran
                                        </button>
                                    )}
                                    <button onClick={handleUpdateOrderSubmit} className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Simpan Perubahan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Payment Modal */}
            {isPaymentModalOpen && editingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Proses Pembayaran</h3>
                        <p className="mb-6 text-gray-600">Order #{editingOrder.id} - {editingOrder.customer.name}</p>
                        
                        <div className="bg-blue-50 p-4 rounded-lg text-center mb-6">
                            <p className="text-lg text-blue-800">Total Tagihan</p>
                            <p className="text-4xl font-bold text-blue-900">{totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                                    <button 
                                        type="button"
                                        onClick={getPaymentRecommendation}
                                        disabled={isRecommending || activePaymentMethods.length === 0}
                                        className="flex items-center text-sm text-primary hover:text-accent disabled:opacity-50 disabled:cursor-wait transition-colors"
                                    >
                                        {isRecommending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Menganalisis...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Dapatkan Rekomendasi
                                            </>
                                        )}
                                    </button>
                                </div>
                                <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                                    {activePaymentMethods.map(method => (
                                        <option key={method.id} value={method.name}>{method.name}</option>
                                    ))}
                                </select>
                                
                                {recommendation && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                        <p><span className="font-semibold">Rekomendasi AI:</span> {recommendation}</p>
                                    </div>
                                )}
                                {aiError && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                                        <p>{aiError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-8">
                             <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                             <button onClick={handleProcessPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Konfirmasi Pembayaran</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceOrders;
