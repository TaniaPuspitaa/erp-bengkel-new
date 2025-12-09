
import React from 'react';
import { useAppContext } from '../App';
import { DollarSign, ClipboardList, Wrench, AlertTriangle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ServiceStatus } from '../types';

const DashboardCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { orders, parts, customers, payments } = useAppContext();

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    const pendingOrders = orders.filter(o => o.status !== ServiceStatus.Done).length;
    const lowStockParts = parts.filter(p => p.stock < 5).length;
    const totalCustomers = customers.length;

    // Data for charts
    const revenueData = [
        { name: 'Minggu 1', Pendapatan: 4000000 },
        { name: 'Minggu 2', Pendapatan: 3000000 },
        { name: 'Minggu 3', Pendapatan: 5000000 },
        { name: 'Minggu 4', Pendapatan: 4500000 },
    ];
    
    const orderStatusData = [
        { name: 'Antrian', Jumlah: orders.filter(o => o.status === ServiceStatus.Queue).length, fill: '#f97316' },
        { name: 'Proses', Jumlah: orders.filter(o => o.status === ServiceStatus.Process).length, fill: '#3b82f6' },
        { name: 'Selesai', Jumlah: orders.filter(o => o.status === ServiceStatus.Done).length, fill: '#22c55e' },
    ];

    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Pendapatan" value={totalRevenue} icon={DollarSign} color="bg-green-500" />
                <DashboardCard title="Order Aktif" value={pendingOrders} icon={ClipboardList} color="bg-blue-500" />
                <DashboardCard title="Stok Menipis" value={lowStockParts} icon={AlertTriangle} color="bg-red-500" />
                <DashboardCard title="Total Pelanggan" value={totalCustomers} icon={Users} color="bg-purple-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-gray-700 mb-4">Pendapatan Bulanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value as number)} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value as number)} />
                            <Legend />
                            <Line type="monotone" dataKey="Pendapatan" stroke="#f97316" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-gray-700 mb-4">Status Order Servis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={orderStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Jumlah" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
             {/* Recent Orders Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Order Servis Terbaru</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Pelanggan</th>
                                <th scope="col" className="px-6 py-3">Kendaraan</th>
                                <th scope="col" className="px-6 py-3">Mekanik</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Total Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer.name}</td>
                                    <td className="px-6 py-4">{order.customer.vehicle}</td>
                                    <td className="px-6 py-4">{useAppContext().employees.find(e => e.id === order.mechanicId)?.name || 'N/A'}</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
