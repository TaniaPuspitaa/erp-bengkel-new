
export enum Role {
    Admin = 'Admin',
    Cashier = 'Kasir',
    Mechanic = 'Mekanik',
}

export interface User {
    id: number;
    name: string;
    username: string;
    role: Role;
}

export enum ServiceStatus {
    Queue = 'Antrian',
    Process = 'Proses',
    Done = 'Selesai',
}

export enum PaymentStatus {
    Unpaid = 'Belum Lunas',
    Paid = 'Lunas',
}

export interface OrderPart {
    partId: number;
    quantity: number;
    unitPrice: number;
}

export interface ServiceOrder {
    id: number;
    customer: { id: number; name: string; vehicle: string; };
    complaint: string;
    mechanicId: number;
    date: string;
    status: ServiceStatus;
    partsUsed: OrderPart[];
    serviceFee: number;
    totalCost: number;
    paymentStatus: PaymentStatus;
}

export interface Part {
    id: number;
    name: string;
    category: string;
    stock: number;
    buyPrice: number;
    sellPrice: number;
    unit: string;
}

export interface Purchase {
    date: string;
    partId: number;
    quantity: number;
    buyPrice: number;
}

export interface Supplier {
    id: number;
    name: string;
    contact: string;
    address: string;
    status: 'Aktif' | 'Nonaktif';
    purchaseHistory: Purchase[];
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
    email?: string;
    vehicles: { plateNumber: string, model: string }[];
}

export interface Employee {
    id: number;
    name: string;
    role: Role;
    phone: string;
    status: 'Aktif' | 'Nonaktif';
    specialization?: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    status: 'Aktif' | 'Nonaktif';
}

export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    method: string;
    date: string;
}
