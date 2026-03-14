import * as httpRequest from '@/utils/httpRequest';

const getErrorMessage = (error, fallbackMessage) => {
    if (error.response && error.response.data?.message) {
        return error.response.data.message;
    }

    return fallbackMessage;
};

export const getDashboardOverview = async (days = 30) => {
    try {
        const response = await httpRequest.get('/dashboard/overview', {
            params: { days },
        });

        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Có lỗi xảy ra khi tải tổng quan hệ thống.'));
    }
};

export const getDashboardTimeline = async (days = 30) => {
    try {
        const response = await httpRequest.get('/dashboard/timeline', {
            params: { days },
        });

        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Có lỗi xảy ra khi tải biểu đồ tăng trưởng.'));
    }
};

export const getTopDocuments = async (days = 30, limit = 5) => {
    try {
        const response = await httpRequest.get('/dashboard/top-documents', {
            params: { days, limit },
        });

        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Có lỗi xảy ra khi tải danh sách tài liệu nổi bật.'));
    }
};

export const getRecentActivities = async (limit = 10) => {
    try {
        const response = await httpRequest.get('/dashboard/recent-activities', {
            params: { limit },
        });

        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, 'Có lỗi xảy ra khi tải hoạt động gần đây.'));
    }
};