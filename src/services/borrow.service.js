import * as httpRequest from '@/utils/httpRequest';

export const borrowDocument = async (document_id) => {
    try {
        const response = await httpRequest.post(`/borrows`, { document_id });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

export const returnDocument = async (documentId) => {
    try {
        const response = await httpRequest.post(`/borrows/return/${documentId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}