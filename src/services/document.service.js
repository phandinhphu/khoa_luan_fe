import * as httpRequest from '@/utils/httpRequest';

// ============== CLIENT APIs ==============

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

// ============== ADMIN APIs ==============

/**
 * Get all documents with pagination (Admin)
 * @param {number} page
 * @param {number} size
 */
export const getAllDocumentsAdmin = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/documents', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi lấy danh sách tài liệu.');
        }
    }
};

/**
 * Upload new document (Admin)
 * @param {Object} data - { title, total_copies, copyright_status, file (File) }
 */
export const uploadDocument = async (data) => {
    try {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('total_copies', data.total_copies);
        formData.append('copyright_status', data.copyright_status);
        formData.append('file', data.file);

        const response = await httpRequest.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi tải lên tài liệu.');
        }
    }
};

/**
 * Update document (Admin)
 * @param {string} id
 * @param {Object} data - { title, total_copies, copyright_status }
 */
export const updateDocument = async (id, data) => {
    try {
        const response = await httpRequest.put(`/documents/${id}`, data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi cập nhật tài liệu.');
        }
    }
};

/**
 * Delete document (Admin)
 * @param {string} id
 */
export const deleteDocument = async (id) => {
    try {
        const response = await httpRequest.del(`/documents/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra khi xóa tài liệu.');
        }
    }
};