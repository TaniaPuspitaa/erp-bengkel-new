
import { User, Role, ServiceOrder, ServiceStatus, PaymentStatus, Part, Supplier, Customer, Employee, Payment, PaymentMethod } from '../types';

export const MOCK_USERS: User[] = [
    { id: 1, name: 'Admin Utama', username: 'admin', role: Role.Admin },
    { id: 2, name: 'Budi Kasir', username: 'kasir', role: Role.Cashier },
    { id: 3, name: 'Charlie Mekanik', username: 'mekanik', role: Role.Mechanic },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 1, name: 'Andi Setiawan', phone: '081234567890', address: 'Jl. Merdeka 1', email: 'andi@email.com', vehicles: [{plateNumber: 'B 1234 ABC', model: 'Toyota Avanza'}] },
    { id: 2, name: 'Siti Aminah', phone: '081234567891', address: 'Jl. Sudirman 2', vehicles: [{plateNumber: 'D 5678 DEF', model: 'Honda Brio'}] },
];

export const MOCK_EMPLOYEES: Employee[] = [
    { id: 1, name: 'Admin Utama', role: Role.Admin, phone: '08111', status: 'Aktif' },
    { id: 2, name: 'Budi Kasir', role: Role.Cashier, phone: '08222', status: 'Aktif' },
    { id: 3, name: 'Charlie Mekanik', role: Role.Mechanic, phone: '08333', status: 'Aktif', specialization: 'Mesin & Transmisi' },
    { id: 4, name: 'Doni Mekanik', role: Role.Mechanic, phone: '08444', status: 'Aktif', specialization: 'Kelistrikan & AC' },
];


export const MOCK_PARTS: Part[] = [
    { id: 1, name: 'Oli Mesin Super', category: 'Oli', stock: 50, buyPrice: 75000, sellPrice: 100000, unit: 'Liter' },
    { id: 2, name: 'Filter Oli DX', category: 'Filter', stock: 100, buyPrice: 20000, sellPrice: 30000, unit: 'Pcs' },
    { id: 3, name: 'Kampas Rem Depan', category: 'Rem', stock: 4, buyPrice: 150000, sellPrice: 200000, unit: 'Set' },
    { id: 4, name: 'Busi Iridium', category: 'Pengapian', stock: 80, buyPrice: 25000, sellPrice: 40000, unit: 'Pcs' },
];

export const MOCK_ORDERS: ServiceOrder[] = [
    { 
        id: 1, 
        customer: { id: 1, name: 'Andi Setiawan', vehicle: 'B 1234 ABC' },
        complaint: 'Ganti oli dan cek rem', 
        mechanicId: 3, 
        date: '2023-10-27', 
        status: ServiceStatus.Done, 
        partsUsed: [{ partId: 1, quantity: 4, unitPrice: 100000 }, { partId: 2, quantity: 1, unitPrice: 30000 }], 
        serviceFee: 150000, 
        totalCost: 580000, 
        paymentStatus: PaymentStatus.Paid 
    },
    { 
        id: 2, 
        customer: { id: 2, name: 'Siti Aminah', vehicle: 'D 5678 DEF' },
        complaint: 'Mesin brebet saat RPM rendah', 
        mechanicId: 4, 
        date: '2023-10-28', 
        status: ServiceStatus.Process, 
        partsUsed: [], 
        serviceFee: 200000, 
        totalCost: 200000, 
        paymentStatus: PaymentStatus.Unpaid 
    },
    { 
        id: 3, 
        customer: { id: 1, name: 'Andi Setiawan', vehicle: 'B 1234 ABC' },
        complaint: 'AC tidak dingin', 
        mechanicId: 3, 
        date: '2023-10-29', 
        status: ServiceStatus.Queue, 
        partsUsed: [], 
        serviceFee: 0, 
        totalCost: 0, 
        paymentStatus: PaymentStatus.Unpaid 
    },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 1, name: 'PT Suku Cadang Jaya', contact: '021-555-1234', address: 'Jakarta', status: 'Aktif', purchaseHistory: [] },
    { id: 2, name: 'CV Oli Mantap', contact: '022-555-5678', address: 'Bandung', status: 'Aktif', purchaseHistory: [] },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    { id: 1, name: 'Cash', status: 'Aktif' },
    { id: 2, name: 'Transfer', status: 'Aktif' },
    { id: 3, name: 'E-Wallet', status: 'Aktif' },
    { id: 4, name: 'Kartu Kredit', status: 'Nonaktif' },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 1, orderId: 1, amount: 580000, method: 'Cash', date: '2023-10-27' }
];
