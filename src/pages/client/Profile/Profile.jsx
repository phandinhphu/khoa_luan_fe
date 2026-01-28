import { useState } from 'react';
import { User, Mail, Lock, Camera, Save, Key } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import useAuth from '../../../hooks/useAuth';
import { useUpdateProfile, useChangePassword } from '../../../hooks/useUser';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    // Get user from context
    const { user, loading: authLoading } = useAuth();

    // React Query mutations
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Profile form
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [profileErrors, setProfileErrors] = useState({});

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    // Handle profile input change
    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileForm({ ...profileForm, [name]: value });
        if (profileErrors[name]) {
            setProfileErrors({ ...profileErrors, [name]: '' });
        }
    };

    // Handle avatar change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            setProfileForm({ ...profileForm, avatar: file });
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validate profile form
    const validateProfileForm = () => {
        const errors = {};
        if (!profileForm.name.trim()) {
            errors.name = 'Tên không được để trống';
        }
        if (!profileForm.email.trim()) {
            errors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
            errors.email = 'Email không hợp lệ';
        }
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit profile update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!validateProfileForm()) return;

        try {
            await updateProfileMutation.mutateAsync(profileForm);
            toast.success('Cập nhật thông tin thành công');
            setIsEditModalOpen(false);
            // User will be updated via context after refetch
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật profile');
        }
    };

    // Handle password input change
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
        if (passwordErrors[name]) {
            setPasswordErrors({ ...passwordErrors, [name]: '' });
        }
    };

    // Validate password form
    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Đổi mật khẩu thành công');
            setIsPasswordModalOpen(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        }
    };

    // Open edit modal
    const openEditModal = () => {
        setProfileForm({
            name: user?.name || '',
            email: user?.email || '',
            avatar: null,
        });
        setAvatarPreview(user?.avatar_url || null);
        setProfileErrors({});
        setIsEditModalOpen(true);
    };

    // Open password modal
    const openPasswordModal = () => {
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordErrors({});
        setIsPasswordModalOpen(true);
    };

    if (authLoading || !user) {
        return (
            <div className="profile-container">
                <div className="loading">Đang tải thông tin...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">
                    <User size={32} />
                    Thông tin cá nhân
                </h1>
                <p className="profile-subtitle">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="profile-content">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2 className="card-title">Thông tin tài khoản</h2>
                        <button onClick={openEditModal} className="btn-edit">
                            <Save size={18} />
                            Chỉnh sửa
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="avatar-section">
                            <img
                                src={user?.avatar_url || 'https://via.placeholder.com/120'}
                                alt="Avatar"
                                className="avatar-large"
                            />
                        </div>
                        <div className="info-section">
                            <div className="info-item">
                                <label className="info-label">
                                    <User size={18} />
                                    Họ và tên
                                </label>
                                <p className="info-value">{user?.name || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="info-item">
                                <label className="info-label">
                                    <Mail size={18} />
                                    Email
                                </label>
                                <p className="info-value">{user?.email || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="info-item">
                                <label className="info-label">
                                    <User size={18} />
                                    Vai trò
                                </label>
                                <p className="info-value">
                                    <span
                                        className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}
                                    >
                                        {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2 className="card-title">Bảo mật</h2>
                        <button onClick={openPasswordModal} className="btn-edit">
                            <Key size={18} />
                            Đổi mật khẩu
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="info-section">
                            <div className="info-item">
                                <label className="info-label">
                                    <Lock size={18} />
                                    Mật khẩu
                                </label>
                                <p className="info-value">••••••••</p>
                            </div>
                            <div className="security-note">
                                <p>
                                    💡 Để bảo vệ tài khoản của bạn, hãy sử dụng mật khẩu mạnh và
                                    thay đổi định kỳ.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Chỉnh sửa thông tin"
                size="md"
            >
                <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                        <label className="form-label">Ảnh đại diện</label>
                        <div className="avatar-upload-section">
                            <img
                                src={avatarPreview || 'https://via.placeholder.com/100'}
                                alt="Avatar preview"
                                className="avatar-preview"
                            />
                            <div className="upload-controls">
                                <label className="upload-btn">
                                    <Camera size={18} />
                                    Chọn ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        hidden
                                    />
                                </label>
                                <p className="upload-note">PNG, JPG tối đa 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Họ và tên <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileInputChange}
                            className={`form-input ${profileErrors.name ? 'error' : ''}`}
                            placeholder="Nhập họ và tên"
                        />
                        {profileErrors.name && (
                            <span className="error-message">{profileErrors.name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileInputChange}
                            className={`form-input ${profileErrors.email ? 'error' : ''}`}
                            placeholder="Nhập email"
                        />
                        {profileErrors.email && (
                            <span className="error-message">{profileErrors.email}</span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="btn-secondary"
                            disabled={updateProfileMutation.isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={updateProfileMutation.isLoading}
                        >
                            {updateProfileMutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Đổi mật khẩu"
                size="md"
            >
                <form onSubmit={handlePasswordSubmit} className="profile-form">
                    <div className="form-group">
                        <label className="form-label">
                            Mật khẩu hiện tại <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                            placeholder="Nhập mật khẩu hiện tại"
                        />
                        {passwordErrors.currentPassword && (
                            <span className="error-message">{passwordErrors.currentPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Mật khẩu mới <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                            placeholder="Nhập mật khẩu mới"
                        />
                        {passwordErrors.newPassword && (
                            <span className="error-message">{passwordErrors.newPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Xác nhận mật khẩu mới <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        {passwordErrors.confirmPassword && (
                            <span className="error-message">{passwordErrors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="btn-secondary"
                            disabled={changePasswordMutation.isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={changePasswordMutation.isLoading}
                        >
                            {changePasswordMutation.isLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Profile;
