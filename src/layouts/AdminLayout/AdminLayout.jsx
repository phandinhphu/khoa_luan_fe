import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';

const AdminLayout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // Khởi tạo state từ localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newValue = !prev;
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
            return newValue;
        });
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/documents', icon: '📚', label: 'Documents' },
        { path: '/admin/users', icon: '👥', label: 'Users' },
        { path: '/admin/forum', icon: '💬', label: 'Forum' },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className={`
                ${isCollapsed ? 'w-20' : 'w-64'} 
                bg-slate-800 text-white shrink-0 hidden md:flex flex-col transition-all duration-300
            `}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                    {!isCollapsed && (
                        <span className="font-bold text-xl">Admin Panel</span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-slate-700 transition ml-auto"
                        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {menuItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition"
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="whitespace-nowrap">{item.label}</span>
                            )}
                        </a>
                    ))}
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
                    <div className="bg-white rounded-lg shadow p-6 min-h-125">
                         {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
