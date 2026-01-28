import axios from 'axios';
import { API_URL } from './constants';

const KhoaLuanRequest = axios.create({
    baseURL: `${API_URL}` || 'http://localhost:3000/api',
    withCredentials: true,
});

// Thêm token vào header của mỗi request nếu có
KhoaLuanRequest.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Xử lý lỗi toàn cục và Refresh Token
KhoaLuanRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử refresh
        if (
            error.response &&
            error.response.status === 401 &&
            error.config?.url !== '/auth/login' &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Gọi API refresh token
                // Lưu ý: Dùng instance axios mới hoặc fetch để tránh loop nếu chính refresh cũng 401
                // Ở đây giả sử endpoint refresh-token không yêu cầu accessToken cũ (đã hết hạn)
                // mà dùng cookie refreshToken (httpOnly).
                const res = await KhoaLuanRequest.post('/auth/refresh-token');

                if (res.data && res.data.accessToken) {
                    const { accessToken } = res.data;
                    // Lưu token mới
                    localStorage.setItem('accessToken', accessToken);

                    // Cập nhật header cho request cũ và request tiếp theo
                    KhoaLuanRequest.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // Gọi lại request ban đầu
                    return KhoaLuanRequest(originalRequest);
                }
            } catch (refreshError) {
                // Nếu refresh cũng lỗi (hết hạn refresh token, hoặc lỗi hệ thống)
                console.error('Refresh token failed', refreshError);
                localStorage.removeItem('accessToken');
                // Chuyển hướng về login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Nếu lỗi 403 (Forbidden)
        if (error.response && error.response.status === 403) {
            // Có thể redirect hoặc để UI tự xử lý
            // Theo yêu cầu: "lỗi refreshToken không hợp lệ hoặc hết hạn thì điều hướng sang login" - thường là 401 hoặc do logic BE trả về.
            // Nếu BE trả 403 cho trường hợp này thì redirect.
            // Tuy nhiên 403 thường là "Not Authorized" (quyền truy cập), còn 401 là "Unauthenticated".
            // Nếu làm đúng chuẩn RFC: 401 hết hạn -> refresh. Refresh fail -> Login.
            // Nếu user vào trang admin mà ko có quyền -> 403 -> Trang Forbidden (đã xử lý ở RouteGuard).
            // Nếu API trả 403 cho request data (ví dụ user thường gọi api admin):
            // window.location.href = '/403';
        }

        return Promise.reject(error);
    },
);

export const get = async (url, params = {}) => {
    const response = await KhoaLuanRequest.get(url, params);
    return response;
};

export const post = async (url, data = {}) => {
    const response = await KhoaLuanRequest.post(url, data);
    return response;
};

export const put = async (url, data = {}) => {
    const response = await KhoaLuanRequest.put(url, data);
    return response;
};

export const patch = async (url, data = {}) => {
    const response = await KhoaLuanRequest.patch(url, data);
    return response;
}

export const del = async (url) => {
    const response = await KhoaLuanRequest.delete(url);
    return response;
};

export default KhoaLuanRequest;
