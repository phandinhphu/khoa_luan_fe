import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const ClientLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="shrink-0">
                         <h1 className="text-xl font-bold text-indigo-600">Thư viện số</h1>
                    </div>
                    {/* Navigation placeholder */}
                    <nav className="flex items-center space-x-4">
                        <a href="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Home</a>
                        <a href="/about" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">About</a>
                        
                        {user ? (
                            <button 
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium"
                            >
                                Logout
                            </button>
                        ) : (
                            <a href="/login" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md font-medium">Login</a>
                        )}
                    </nav>
                </div>
            </header>
            <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
                    &copy; 2026 MyApp. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
