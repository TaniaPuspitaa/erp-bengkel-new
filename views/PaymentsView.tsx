import React, { useState } from 'react';
import { useAppContext } from '../App';
import { CreditCard, Printer, X, FileDown } from 'lucide-react';
import { ServiceOrder } from '../types';

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

const PaymentsView: React.FC = () => {
    const { payments, orders, parts, employees, customers } = useAppContext();
    const [invoiceOrder, setInvoiceOrder] = useState<ServiceOrder | null>(null);

    const handleExport = () => {
        const dataToExport = payments.map(p => {
            const order = orders.find(o => o.id === p.orderId);
            return {
                'ID_Pembayaran': p.id,
                'ID_Order': p.orderId,
                'Pelanggan': order?.customer.name || 'N/A',
                'Tanggal': p.date,
                'Jumlah': p.amount,
                'Metode': p.method,
            };
        });
        exportToCSV(dataToExport, 'riwayat_pembayaran');
    };

    const handleOpenInvoice = (orderId: number) => {
        const orderToPrint = orders.find(o => o.id === orderId);
        if (orderToPrint) {
            setInvoiceOrder(orderToPrint);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 2rem;
                        color: #000;
                    }
                }
            `}</style>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Riwayat Pembayaran</h2>
                 <button 
                    onClick={handleExport}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <FileDown className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Order</th>
                            <th scope="col" className="px-6 py-3">Pelanggan</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Jumlah</th>
                            <th scope="col" className="px-6 py-3">Metode</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => {
                            const order = orders.find(o => o.id === payment.orderId);
                            return (
                                <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{payment.orderId}</td>
                                    <td className="px-6 py-4">{order?.customer.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(payment.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">
                                        {payment.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleOpenInvoice(payment.orderId)}
                                            className="flex items-center mx-auto text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            disabled={!order}
                                        >
                                            <Printer className="w-4 h-4 mr-1"/> Cetak Invoice
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                         {payments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500">
                                    Belum ada data pembayaran.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invoice Modal */}
            {invoiceOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-[95vh] flex flex-col">
                         <header className="p-4 border-b flex justify-between items-center print:hidden">
                            <h2 className="text-xl font-bold">Invoice #{invoiceOrder.id}</h2>
                            <div>
                                <button onClick={handlePrint} className="px-4 py-2 mr-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <span className="flex items-center"><Printer className="w-4 h-4 mr-2"/>Cetak</span>
                                </button>
                                <button onClick={() => setInvoiceOrder(null)} className="p-2 rounded-full hover:bg-gray-200"><X className="w-6 h-6"/></button>
                            </div>
                        </header>
                        <main id="invoice-content" className="flex-1 overflow-y-auto p-8 bg-white">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-primary">Bengkel ERP</h1>
                                    <p className="text-gray-600">Jl. Otomotif No. 123, Jakarta</p>
                                    <p className="text-gray-600">Phone: (021) 555-1234</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-semibold text-gray-700">INVOICE</h2>
                                    <p className="text-gray-600"><strong>No:</strong> INV-{invoiceOrder.id}</p>
                                    <p className="text-gray-600"><strong>Tanggal:</strong> {new Date(invoiceOrder.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2 border-b pb-2 text-gray-800">Ditagihkan Kepada:</h3>
                                    <p className="font-medium text-gray-700">{invoiceOrder.customer.name}</p>
                                    <p className="text-gray-600">{customers.find(c => c.id === invoiceOrder.customer.id)?.address}</p>
                                    <p className="text-gray-600">{customers.find(c => c.id === invoiceOrder.customer.id)?.phone}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2 border-b pb-2 text-gray-800">Detail Kendaraan:</h3>
                                    <p className="text-gray-600"><strong>Plat Nomor:</strong> {invoiceOrder.customer.vehicle}</p>
                                    <p className="text-gray-600"><strong>Model:</strong> {customers.find(c => c.id === invoiceOrder.customer.id)?.vehicles.find(v => v.plateNumber === invoiceOrder.customer.vehicle)?.model || 'N/A'}</p>
                                    <p className="text-gray-600"><strong>Mekanik:</strong> {employees.find(e => e.id === invoiceOrder.mechanicId)?.name || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-2 text-gray-800">Rincian Servis:</h3>
                            <table className="w-full text-left mb-8">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-3 font-semibold">Deskripsi</th>
                                        <th className="p-3 font-semibold text-center">Jumlah</th>
                                        <th className="p-3 font-semibold text-right">Harga Satuan</th>
                                        <th className="p-3 font-semibold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {invoiceOrder.partsUsed.map(item => {
                                        const partInfo = parts.find(p => p.id === item.partId);
                                        return (
                                            <tr key={item.partId} className="border-b">
                                                <td className="p-3">{partInfo?.name || 'Suku Cadang Dihapus'}</td>
                                                <td className="p-3 text-center">{item.quantity}</td>
                                                <td className="p-3 text-right">{item.unitPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                                <td className="p-3 text-right">{(item.quantity * item.unitPrice).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="border-b">
                                        <td className="p-3">Jasa Servis</td>
                                        <td className="p-3 text-center">1</td>
                                        <td className="p-3 text-right">{invoiceOrder.serviceFee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                        <td className="p-3 text-right">{invoiceOrder.serviceFee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="flex justify-end">
                                <div className="w-full max-w-sm text-gray-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Suku Cadang</span>
                                        <span>{invoiceOrder.partsUsed.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Jasa</span>
                                        <span>{invoiceOrder.serviceFee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                                        <span>Total</span>
                                        <span>{invoiceOrder.totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-green-600">
                                        <span>Status</span>
                                        <span>{invoiceOrder.paymentStatus}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center mt-16 text-sm text-gray-500">
                                <p>Terima kasih atas kepercayaan Anda.</p>
                                <p>Harap simpan invoice ini sebagai bukti pembayaran yang sah.</p>
                            </div>
                        </main>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsView;
