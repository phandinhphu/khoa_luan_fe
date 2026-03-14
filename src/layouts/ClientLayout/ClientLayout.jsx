import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { Search } from 'lucide-react';
import './ClientLayout.css';

const ClientLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState('');

    const isHome = location.pathname === '/';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = search.trim();
        navigate(query ? `/?q=${encodeURIComponent(query)}` : '/');
    };

    return (
        <div className="cl-shell min-h-screen flex flex-col">
            <header className="cl-header">
                <div className="cl-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="cl-brand-zone">
                        <Link to="/" className="cl-brand">
                            <span className="cl-brand-dot" />
                            <span>Thu vien so</span>
                        </Link>
                        <p className="cl-brand-subtitle">Doc, muon va thao luan tai lieu hoc thuat</p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="cl-search" role="search">
                        <Search size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tim nhanh tai lieu theo tieu de..."
                            aria-label="Tim tai lieu"
                        />
                        <button type="submit">Tim</button>
                    </form>

                    <nav className="cl-nav">
                        <NavLink to="/" className={({ isActive }) => `cl-link ${isActive && isHome ? 'active' : ''}`}>
                            Trang chu
                        </NavLink>
                        <NavLink to="/forum" className={({ isActive }) => `cl-link ${isActive ? 'active' : ''}`}>
                            Dien dan
                        </NavLink>
                        {user && (
                            <NavLink to="/forum/my-posts" className={({ isActive }) => `cl-link ${isActive ? 'active' : ''}`}>
                                Bai viet cua toi
                            </NavLink>
                        )}

                        {user ? (
                            <div className="relative group">
                                    <button className="cl-user-trigger">
                                        <img
                                            src={user.avatar_url || 'https://via.placeholder.com/32'}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border border-white/40"
                                        />
                                        <span className="cl-user-name">{user.name}</span>
                                    </button>
                                    <div className="cl-user-menu absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        <Link to="/profile" className="block px-4 py-2 text-slate-700 hover:bg-slate-100">
                                            Ho so
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100"
                                        >
                                            Dang xuat
                                        </button>
                                    </div>
                                </div>
                        ) : (
                            <Link
                                to="/login"
                                className="cl-login"
                            >
                                Dang nhap
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

            <footer className="cl-footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm">
                    © 2026 Thu vien so. Nen tang tri thuc cho nguoi hoc.
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
