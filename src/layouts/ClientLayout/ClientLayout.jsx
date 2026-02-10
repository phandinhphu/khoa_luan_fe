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
                        <a href="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                            Trang chủ
                        </a>
                        <a href="/forum" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                            Diễn đàn
                        </a>
                        {user && (
                            <a href="/forum/my-posts" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                                Bài viết của tôi
                            </a>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 focus:outline-none">
                                        <img
                                            src={user.avatar_url || 'https://via.placeholder.com/32'}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="text-gray-700 font-medium">{user.name}</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            Hồ sơ
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <a
                                href="/login"
                                className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md font-medium"
                            >
                                Đăng nhập
                            </a>
                        )}
                    </nav>
                </div>
            </header>
            <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
                    &copy; 2026 MyApp. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
