
import React, { useState } from 'react';
import { User } from '../types';
import { Car, LogIn } from 'lucide-react';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
    const [selectedUser, setSelectedUser] = useState<string>(users[0].username);
    const [error, setError] = useState<string>('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.username === selectedUser);
        if (user) {
            onLogin(user);
        } else {
            setError('User not found');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-primary rounded-full mb-4">
                        <Car className="h-10 w-10 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Bengkel ERP System</h1>
                    <p className="mt-2 text-gray-500">Silakan pilih role untuk masuk</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="user-select" className="sr-only">Pilih User</label>
                            <select
                                id="user-select"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.username}>
                                        {user.name} - ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LogIn className="h-5 w-5 text-orange-200" aria-hidden="true" />
                            </span>
                            Masuk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
