import * as httpRequest from '../utils/httpRequest';

// ============== CLIENT APIs ==============

/**
 * Get current user profile
 */
export const getProfile = async () => {
    try {
        const response = await httpRequest.get('/users/profile');
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi lấy thông tin profile.');
        }
    }
};

/**
 * Update current user profile
 * @param {Object} data - { name, email, avatar (File) }
 */
export const updateProfile = async (data) => {
    try {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.email) formData.append('email', data.email);
        if (data.avatar) formData.append('avatar', data.avatar);

        const response = await httpRequest.put('/users/profile', formData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi cập nhật profile.');
        }
    }
};

/**
 * Change password
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await httpRequest.put('/users/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi đổi mật khẩu.');
        }
    }
};

// ============== ADMIN APIs ==============

/**
 * Get all users with pagination (Admin)
 * @param {number} page
 * @param {number} size
 */
export const getAllUsers = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/users', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi lấy danh sách người dùng.');
        }
    }
};

/**
 * Get user by ID (Admin)
 * @param {string} id
 */
export const getUserById = async (id) => {
    try {
        const response = await httpRequest.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi lấy thông tin người dùng.');
        }
    }
};

/**
 * Create new user (Admin)
 * @param {Object} data - { name, email, password, role, avatar (File) }
 */
export const createUser = async (data) => {
    try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('role', data.role);
        if (data.avatar) formData.append('avatar', data.avatar);

        const response = await httpRequest.post('/users', formData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi tạo người dùng.');
        }
    }
};

/**
 * Update user (Admin)
 * @param {string} id
 * @param {Object} data - { name, email, password, role, avatar (File) }
 */
export const updateUser = async (id, data) => {
    try {
        console.log('Updating user with data:', data);
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.email) formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.role) formData.append('role', data.role);
        if (data.avatar) formData.append('avatar', data.avatar);
            

        const response = await httpRequest.put(`/users/${id}`, formData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi cập nhật người dùng.');
        }
    }
};

/**
 * Update user role (Admin)
 * @param {string} id
 * @param {string} role
 */
export const updateUserRole = async (id, role) => {
    try {
        const response = await httpRequest.patch(`/users/${id}/role`, { role });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi cập nhật vai trò người dùng.');
        }
    }
};

/**
 * Delete user (Admin)
 * @param {string} id
 */
export const deleteUser = async (id) => {
    try {
        const response = await httpRequest.del(`/users/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi xóa người dùng.');
        }
    }
};
