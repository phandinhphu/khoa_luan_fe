import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, UserCog } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import {
    useAllUsers,
    useCreateUser,
    useUpdateUser,
    useUpdateUserRole,
    useDeleteUser,
} from '../../../hooks/useUser';
import { toast } from 'react-toastify';
import './UserManagement.css';

const UserManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // React Query hooks
    const { data: usersData, isLoading, isFetching } = useAllUsers(currentPage, pageSize);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const updateRoleMutation = useUpdateUserRole();
    const deleteUserMutation = useDeleteUser();

    // Extract data from response
    const users = usersData?.data || [];
    const total = usersData?.total || 0;
    const totalPages = usersData?.totalPages || 1;

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [roleFormData, setRoleFormData] = useState({ role: 'user' });

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Open modal for creating user
    const handleCreate = () => {
        setModalMode('create');
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            avatar: null,
        });
        setAvatarPreview(null);
        setErrors({});
        setIsModalOpen(true);
    };

    // Open modal for editing user
    const handleEdit = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'user',
            avatar: null,
        });
        setAvatarPreview(user.avatar_url || null);
        setErrors({});
        setIsModalOpen(true);
    };

    // Open modal for changing role
    const handleChangeRole = (user) => {
        setSelectedUser(user);
        setRoleFormData({ role: user.role || 'user' });
        setIsRoleModalOpen(true);
    };

    // Open delete confirmation modal
    const handleDelete = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle avatar change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên không được để trống';
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (modalMode === 'create' && !formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        }
        if (modalMode === 'create' && formData.password && formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (modalMode === 'create') {
                await createUserMutation.mutateAsync(formData);
                toast.success('Tạo người dùng thành công');
            } else {
                await updateUserMutation.mutateAsync({
                    userId: selectedUser._id,
                    userData: formData,
                });
                toast.success('Cập nhật người dùng thành công');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Submit role change
    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateRoleMutation.mutateAsync({
                userId: selectedUser._id,
                role: roleFormData.role,
            });
            toast.success('Cập nhật vai trò thành công');
            setIsRoleModalOpen(false);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await deleteUserMutation.mutateAsync(selectedUser._id);
            toast.success('Xóa người dùng thành công');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'avatar_url',
            label: 'Avatar',
            render: (user) => (
                <img
                    src={user.avatar_url || 'https://via.placeholder.com/40'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
            ),
        },
        { key: 'name', label: 'Tên' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Vai trò',
            render: (user) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                >
                    {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            render: (user) =>
                user.created_at
                    ? new Date(user.created_at).toLocaleDateString('vi-VN')
                    : 'N/A',
        },
    ];

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-management">
            <div className="page-header">
                <div className="header-content">
                    <div className="title-section">
                        <Users className="icon" size={32} />
                        <div>
                            <h1 className="title">Quản lý người dùng</h1>
                            <p className="subtitle">Quản lý tài khoản người dùng trong hệ thống</p>
                        </div>
                    </div>
                    <button onClick={handleCreate} className="btn-primary">
                        <Plus size={20} />
                        Thêm người dùng
                    </button>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="toolbar">
                    <div className="search-box">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="stats">
                        <span className="stat-item">
                            Tổng số: <strong>{total}</strong> người dùng
                        </span>
                    </div>
                </div>

                {(isLoading || isFetching) && <div className="loading">Đang tải...</div>}

                {!isLoading && (
                    <>
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onChangeRole={(user) => handleChangeRole(user)}
                        />

                        {totalPages > 1 && (
                            <div className="pagination-wrapper">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create/Edit User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-grid">
                        <div className="form-group col-span-2">
                            <label className="form-label">Avatar</label>
                            <div className="avatar-upload">
                                <div className="avatar-preview">
                                    <img
                                        src={avatarPreview || 'https://via.placeholder.com/100'}
                                        alt="Avatar preview"
                                        className="preview-image"
                                    />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="file-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Tên <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="Nhập tên người dùng"
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="Nhập email"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Mật khẩu {modalMode === 'create' && <span className="required">*</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder={
                                    modalMode === 'create'
                                        ? 'Nhập mật khẩu'
                                        : 'Để trống nếu không đổi'
                                }
                            />
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Vai trò <span className="required">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="user">Người dùng</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary"
                            disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        >
                            {createUserMutation.isPending || updateUserMutation.isPending
                                ? 'Đang xử lý...'
                                : modalMode === 'create'
                                  ? 'Tạo người dùng'
                                  : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title="Thay đổi vai trò"
                size="sm"
            >
                <form onSubmit={handleRoleSubmit} className="role-form">
                    <div className="form-group">
                        <label className="form-label">Vai trò</label>
                        <select
                            value={roleFormData.role}
                            onChange={(e) => setRoleFormData({ role: e.target.value })}
                            className="form-input"
                        >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsRoleModalOpen(false)}
                            className="btn-secondary"
                            disabled={updateRoleMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={updateRoleMutation.isPending}
                        >
                            {updateRoleMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="delete-confirmation">
                    <p className="confirmation-text">
                        Bạn có chắc chắn muốn xóa người dùng{' '}
                        <strong>{selectedUser?.name}</strong> không?
                    </p>
                    <p className="warning-text">Hành động này không thể hoàn tác!</p>
                    <div className="form-actions">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="btn-secondary"
                            disabled={deleteUserMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="btn-danger"
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
