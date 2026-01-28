import * as httpRequest from '@/utils/httpRequest';

export const getAllDocuments = async () => {
    try {
        const response = await httpRequest.get('/documents');
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

export const getDocumentById = async (documentId) => {
    try {
        const response = await httpRequest.get(`/documents/${documentId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

export const previewDocument = async (documentId) => {
    try {
        const response = await httpRequest.default.get(`/documents/${documentId}/preview`, {
            responseType: 'arraybuffer'
        })
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

export const readDocumentByPage = async (documentId, pageNumber) => {
    try {
        const response = await httpRequest.default.get(`/documents/${documentId}/pages/${pageNumber}`, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}