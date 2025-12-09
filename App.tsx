
import React, { useState, createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { Home, ClipboardList, Wrench, Package, Users, UserCog, CreditCard, BarChart, Settings, LogOut, Car, User, Bell, Star, WalletCards } from 'lucide-react';
import { User as UserType, Role, ServiceOrder, Part, Supplier, Customer, Employee, Payment, PaymentMethod } from './types';
import { MOCK_USERS, MOCK_ORDERS, MOCK_PARTS, MOCK_SUPPLIERS, MOCK_CUSTOMERS, MOCK_EMPLOYEES, MOCK_PAYMENTS, MOCK_PAYMENT_METHODS } from './data/mockData';

// Views
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import ServiceOrders from './views/ServiceOrders';
import Inventory from './views/Inventory';
import Suppliers from './views/Suppliers';
import Customers from './views/Customers';
import Employees from './views/Employees';
import Reports from './views/Reports';
import SystemSettings from './views/SystemSettings';
import PaymentsView from './views/PaymentsView';
import PaymentMethods from './views/PaymentMethods';

// App Context for global state
interface AppContextType {
    currentUser: UserType | null;
    logout: () => void;
    
    orders: ServiceOrder[];
    parts: Part[];
    suppliers: Supplier[];
    customers: Customer[];
    employees: Employee[];
    payments: Payment[];
    paymentMethods: PaymentMethod[];

    // CRUD operations
    addOrder: (order: Omit<ServiceOrder, 'id'>) => void;
    updateOrder: (order: ServiceOrder) => void;
    deleteOrder: (id: number) => void;

    addPart: (part: Omit<Part, 'id'>) => void;
    updatePart: (part: Part) => void;
    deletePart: (id: number) => void;

    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (id: number) => void;

    addCustomer: (customer: Omit<Customer, 'id'>) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: number) => void;

    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    updateEmployee: (employee: Employee) => void;
    deleteEmployee: (id: number) => void;
    
    addPayment: (payment: Omit<Payment, 'id'>) => void;

    addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    updatePaymentMethod: (method: PaymentMethod) => void;
    deletePaymentMethod: (id: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

// Custom hook for persistence
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (error) {
            console.error(`Error loading state for key ${key}`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving state for key ${key}`, error);
        }
    }, [key, value]);

    return [value, setValue];
}

// Main App Component
const App: React.FC = () => {
    // Persist current user session
    const [currentUser, setCurrentUser] = useStickyState<UserType | null>(null, 'erp_currentUser');
    
    // Persist active view to stay on the same page after refresh
    const [activeView, setActiveView] = useStickyState<string>('Dashboard', 'erp_activeView');

    // State management for all data with Persistence
    const [orders, setOrders] = useStickyState<ServiceOrder[]>(MOCK_ORDERS, 'erp_orders');
    const [parts, setParts] = useStickyState<Part[]>(MOCK_PARTS, 'erp_parts');
    const [suppliers, setSuppliers] = useStickyState<Supplier[]>(MOCK_SUPPLIERS, 'erp_suppliers');
    const [customers, setCustomers] = useStickyState<Customer[]>(MOCK_CUSTOMERS, 'erp_customers');
    const [employees, setEmployees] = useStickyState<Employee[]>(MOCK_EMPLOYEES, 'erp_employees');
    const [payments, setPayments] = useStickyState<Payment[]>(MOCK_PAYMENTS, 'erp_payments');
    const [paymentMethods, setPaymentMethods] = useStickyState<PaymentMethod[]>(MOCK_PAYMENT_METHODS, 'erp_paymentMethods');

    // CRUD Implementations
    const addOrder = useCallback((order: Omit<ServiceOrder, 'id'>) => {
        const newOrder = { ...order, id: Date.now() };
        setOrders(prev => [...prev, newOrder]);
    }, [setOrders]);
    
    const updateOrder = useCallback((updatedOrder: ServiceOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }, [setOrders]);
    
    const deleteOrder = useCallback((id: number) => setOrders(prev => prev.filter(o => o.id !== id)), [setOrders]);

    const addPart = useCallback((part: Omit<Part, 'id'>) => setParts(prev => [...prev, { ...part, id: Date.now() }]), [setParts]);
    const updatePart = useCallback((updatedPart: Part) => setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p)), [setParts]);
    const deletePart = useCallback((id: number) => setParts(prev => prev.filter(p => p.id !== id)), [setParts]);

    const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => setSuppliers(prev => [...prev, { ...supplier, id: Date.now() }]), [setSuppliers]);
    const updateSupplier = useCallback((updatedSupplier: Supplier) => setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)), [setSuppliers]);
    const deleteSupplier = useCallback((id: number) => setSuppliers(prev => prev.filter(s => s.id !== id)), [setSuppliers]);

    const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => setCustomers(prev => [...prev, { ...customer, id: Date.now() }]), [setCustomers]);
    const updateCustomer = useCallback((updatedCustomer: Customer) => setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)), [setCustomers]);
    const deleteCustomer = useCallback((id: number) => setCustomers(prev => prev.filter(c => c.id !== id)), [setCustomers]);

    const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => setEmployees(prev => [...prev, { ...employee, id: Date.now() }]), [setEmployees]);
    const updateEmployee = useCallback((updatedEmployee: Employee) => setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)), [setEmployees]);
    const deleteEmployee = useCallback((id: number) => setEmployees(prev => prev.filter(e => e.id !== id)), [setEmployees]);
    
    const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
        const newPayment = { ...payment, id: Date.now() };
        setPayments(prev => [...prev, newPayment]);
        
        // Update order payment status
        const orderToUpdate = orders.find(o => o.id === payment.orderId);
        if (orderToUpdate) {
            updateOrder({ ...orderToUpdate, paymentStatus: 'Lunas' });
        }
    }, [orders, updateOrder, setPayments]);

    const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id'>) => setPaymentMethods(prev => [...prev, { ...method, id: Date.now() }]), [setPaymentMethods]);
    const updatePaymentMethod = useCallback((updatedMethod: PaymentMethod) => setPaymentMethods(prev => prev.map(m => m.id === updatedMethod.id ? updatedMethod : m)), [setPaymentMethods]);
    const deletePaymentMethod = useCallback((id: number) => setPaymentMethods(prev => prev.filter(m => m.id !== id)), [setPaymentMethods]);

    const handleLogin = (user: UserType) => {
        setCurrentUser(user);
        setActiveView('Dashboard');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveView('Dashboard');
    };

    const contextValue = useMemo(() => ({
        currentUser,
        logout: handleLogout,
        orders, parts, suppliers, customers, employees, payments, paymentMethods,
        addOrder, updateOrder, deleteOrder,
        addPart, updatePart, deletePart,
        addSupplier, updateSupplier, deleteSupplier,
        addCustomer, updateCustomer, deleteCustomer,
        addEmployee, updateEmployee, deleteEmployee,
        addPayment,
        addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    }), [currentUser, orders, parts, suppliers, customers, employees, payments, paymentMethods, addOrder, updateOrder, deleteOrder, addPart, updatePart, deletePart, addSupplier, updateSupplier, deleteSupplier, addCustomer, updateCustomer, deleteCustomer, addEmployee, updateEmployee, deleteEmployee, addPayment, addPaymentMethod, updatePaymentMethod, deletePaymentMethod]);

    if (!currentUser) {
        return <Login onLogin={handleLogin} users={MOCK_USERS} />;
    }

    const navigationItems = [
        { name: 'Dashboard', icon: Home, roles: [Role.Admin, Role.Cashier, Role.Mechanic] },
        { name: 'Order Servis', icon: ClipboardList, roles: [Role.Admin, Role.Cashier, Role.Mechanic] },
        { name: 'Suku Cadang', icon: Wrench, roles: [Role.Admin, Role.Mechanic] },
        { name: 'Supplier & Pembelian', icon: Package, roles: [Role.Admin] },
        { name: 'Pelanggan', icon: Users, roles: [Role.Admin, Role.Cashier] },
        { name: 'Karyawan', icon: UserCog, roles: [Role.Admin] },
        { name: 'Spesialisasi Mekanik', icon: Star, roles: [Role.Admin], isSubItem: true },
        { name: 'Riwayat Pembayaran', icon: CreditCard, roles: [Role.Admin, Role.Cashier] },
        { name: 'Metode Pembayaran', icon: WalletCards, roles: [Role.Admin, Role.Cashier] },
        { name: 'Laporan', icon: BarChart, roles: [Role.Admin] },
        { name: 'Pengaturan Sistem', icon: Settings, roles: [Role.Admin] },
    ];

    const availableNavItems = navigationItems.filter(item => item.roles.includes(currentUser.role));

    const renderView = () => {
        switch (activeView) {
            case 'Dashboard': return <Dashboard />;
            case 'Order Servis': return <ServiceOrders />;
            case 'Suku Cadang': return <Inventory />;
            case 'Supplier & Pembelian': return <Suppliers />;
            case 'Pelanggan': return <Customers />;
            case 'Karyawan': return <Employees />;
            case 'Spesialisasi Mekanik': return <Employees />;
            case 'Riwayat Pembayaran': return <PaymentsView />;
            case 'Metode Pembayaran': return <PaymentMethods />;
            case 'Laporan': return <Reports />;
            case 'Pengaturan Sistem': return <SystemSettings />;
            default: return <Dashboard />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="flex h-screen bg-secondary">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-primary text-white flex flex-col">
                    <div className="h-16 flex items-center justify-center px-4 border-b border-blue-800">
                        <Car className="h-8 w-8 text-accent" />
                        <h1 className="text-xl font-bold ml-2">Bengkel ERP</h1>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {availableNavItems.map(item => (
                            <button
                                key={item.name}
                                onClick={() => setActiveView(item.name)}
                                className={`w-full flex items-center text-sm font-medium rounded-md transition-colors duration-200 ${ item.isSubItem ? 'pl-11 pr-4 py-2' : 'px-4 py-2.5' } ${activeView === item.name ? 'bg-accent text-white' : 'hover:bg-blue-700'}`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </aside>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
                        <h2 className="text-2xl font-semibold text-gray-800">{activeView}</h2>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                                <Bell className="h-6 w-6" />
                            </button>
                            <div className="flex items-center">
                                <User className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 p-1" />
                                <div className="ml-3 text-right">
                                    <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors">
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-6">
                        {renderView()}
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default App;
