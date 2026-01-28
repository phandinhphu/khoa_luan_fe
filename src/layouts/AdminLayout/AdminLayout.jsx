import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const AdminLayout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-slate-700">
                    Admin Panel
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2 rounded-md hover:bg-slate-700 transition">Dashboard</a>
                    <a href="/admin/users" className="block px-4 py-2 rounded-md hover:bg-slate-700 transition">Users</a>
                    <a href="/admin/settings" className="block px-4 py-2 rounded-md hover:bg-slate-700 transition">Settings</a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Profile</button>
                        <button 
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow p-6 min-h-[500px]">
                         {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
