
import React from 'react';
import { RefreshCw, Trash2, Save, RotateCcw } from 'lucide-react';

const SystemSettings: React.FC = () => {
    const handleResetData = () => {
        if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data aplikasi? Semua data transaksi, pelanggan, dan stok akan kembali ke data awal (mock data). Aksi ini tidak dapat dibatalkan.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <SettingsIcon className="w-6 h-6 mr-2" />
                    Pengaturan Umum
                </h2>
                <p className="text-gray-600 mb-6">
                    Halaman ini digunakan untuk mengelola konfigurasi sistem ERP Bengkel.
                </p>

                <div className="space-y-6">
                     <div className="border-b pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profil Bengkel</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Bengkel</label>
                                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" value="Bengkel Mobil Maju Jaya" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" value="Jl. Otomotif No. 123, Jakarta" disabled />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" value="(021) 555-1234" disabled />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" value="admin@bengkelmaju.com" disabled />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">* Hubungi developer untuk mengubah informasi profil bengkel.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <RotateCcw className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Reset Data Aplikasi</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            Tindakan ini akan menghapus semua data yang tersimpan di browser (Local Storage) dan mengembalikan aplikasi ke kondisi awal (Mock Data). Gunakan ini jika Anda ingin memulai ulang demo.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={handleResetData}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Reset Data ke Default
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default SystemSettings;
