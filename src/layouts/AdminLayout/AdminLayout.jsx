import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpenText,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareMore,
    ShieldCheck,
    User,
    Users,
    X,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const newValue = !prev;
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
            return newValue;
        });
    };

    const menuItems = useMemo(
        () => [
            { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', hint: 'Tổng quan hệ thống' },
            { path: '/admin/documents', icon: BookOpenText, label: 'Tài liệu', hint: 'Kho tài nguyên số' },
            { path: '/admin/users', icon: Users, label: 'Người dùng', hint: 'Tài khoản và phân quyền' },
            { path: '/admin/forum', icon: MessageSquareMore, label: 'Diễn đàn', hint: 'Bài viết và kiểm duyệt' },
        ],
        []
    );

    const pageTitle = useMemo(() => {
        const currentItem = menuItems.find((item) => item.path === location.pathname);
        return currentItem?.label || 'Admin';
    }, [location.pathname, menuItems]);

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="admin-layout-shell">
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    className="admin-layout-backdrop"
                    aria-label="Đóng menu"
                    onClick={closeMobileSidebar}
                />
            )}

            <aside
                className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${
                    isMobileSidebarOpen ? 'mobile-open' : ''
                }`}
            >
                <div className="admin-sidebar-head">
                    <div className="admin-brand-mark">
                        <ShieldCheck size={18} />
                    </div>
                    {!isCollapsed && (
                        <div className="admin-brand-copy">
                            <strong>Library Admin</strong>
                            <span>Điều phối hệ thống</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="admin-collapse-btn desktop-only"
                        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={closeMobileSidebar}
                        className="admin-collapse-btn mobile-only"
                        title="Đóng menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="admin-sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileSidebar}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className="admin-nav-icon">
                                <Icon size={18} />
                            </span>
                            {!isCollapsed && (
                                <span className="admin-nav-copy">
                                    <strong>{item.label}</strong>
                                    <small>{item.hint}</small>
                                </span>
                            )}
                        </NavLink>
                    )})}
                </nav>

                <div className="admin-sidebar-foot">
                    <button type="button" className="admin-profile-card" onClick={() => navigate('/profile')}>
                        <span className="admin-profile-avatar">
                            {(user?.name || 'A').slice(0, 1).toUpperCase()}
                        </span>
                        {!isCollapsed && (
                            <span className="admin-profile-copy">
                                <strong>{user?.name || 'Quản trị viên'}</strong>
                                <small>{user?.email || 'Tài khoản quản trị'}</small>
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            <div className="admin-layout-main">
                <header className="admin-layout-header">
                    <div className="admin-header-title-group">
                        <button
                            type="button"
                            className="admin-mobile-menu-btn"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            aria-label="Mở menu"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <span className="admin-header-eyebrow">Khu vực quản trị</span>
                            <h2>{pageTitle}</h2>
                        </div>
                    </div>

                    <div className="admin-header-actions">
                        <button type="button" className="admin-header-link" onClick={() => navigate('/profile')}>
                            <User size={16} />
                            Hồ sơ
                        </button>
                        <button type="button" className="admin-header-link danger" onClick={handleLogout}>
                            <LogOut size={16} />
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <main className="admin-layout-content">
                    <div className="admin-layout-panel">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
