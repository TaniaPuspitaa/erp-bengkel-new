
import React from 'react';
import { useAppContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ServiceStatus } from '../types';

const Reports: React.FC = () => {
    const { orders, payments, parts } = useAppContext();

    // Data processing for charts
    const dailyRevenue = payments.reduce((acc, payment) => {
        const date = new Date(payment.date).toLocaleDateString('id-ID');
        acc[date] = (acc[date] || 0) + payment.amount;
        return acc;
    }, {} as Record<string, number>);

    const revenueChartData = Object.keys(dailyRevenue).map(date => ({
        name: date,
        Pendapatan: dailyRevenue[date]
    }));
    
    const serviceStatusData = [
        { name: 'Antrian', value: orders.filter(o => o.status === ServiceStatus.Queue).length },
        { name: 'Proses', value: orders.filter(o => o.status === ServiceStatus.Process).length },
        { name: 'Selesai', value: orders.filter(o => o.status === ServiceStatus.Done).length },
    ];
    
    const lowStockParts = parts.filter(p => p.stock < 10);

    const COLORS = ['#f59e0b', '#3b82f6', '#22c55e'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laporan Real-time</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-gray-700 mb-4">Grafik Pendapatan Harian</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value as number)} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value as number)} />
                            <Legend />
                            <Bar dataKey="Pendapatan" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-gray-700 mb-4">Komposisi Status Order</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={serviceStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {serviceStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Daftar Suku Cadang Stok Rendah (&lt;10)</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Part</th>
                                <th scope="col" className="px-6 py-3">Kategori</th>
                                <th scope="col" className="px-6 py-3">Stok Tersisa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockParts.length > 0 ? lowStockParts.map(part => (
                                <tr key={part.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{part.name}</td>
                                    <td className="px-6 py-4">{part.category}</td>
                                    <td className="px-6 py-4 font-bold text-red-500">{part.stock}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-500">Tidak ada suku cadang dengan stok rendah.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
