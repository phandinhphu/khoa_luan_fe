import * as httpRequest from '@/utils/httpRequest';

// ============== PUBLIC APIs ==============

// Lấy danh sách bài viết đã được duyệt
export const getPosts = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/forum/posts', {
            params: { page, limit }
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

// Xem chi tiết bài viết
export const getPostById = async (postId) => {
    try {
        const response = await httpRequest.get(`/forum/posts/${postId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xem comments của bài viết
export const getPostComments = async (postId, page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get(`/forum/posts/${postId}/comments`, {
            params: { page, limit }
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

// ============== USER APIs ==============

// Tạo bài viết mới
export const createPost = async (postData) => {
    try {
        const response = await httpRequest.post('/forum/posts', postData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xem tất cả bài viết của mình
export const getMyPosts = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/forum/posts/me', {
            params: { page, limit }
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

// Chỉnh sửa bài viết
export const updatePost = async (postId, postData) => {
    try {
        const response = await httpRequest.put(`/forum/posts/${postId}`, postData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xóa bài viết
export const deletePost = async (postId) => {
    try {
        const response = await httpRequest.del(`/forum/posts/${postId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Thêm comment vào bài viết
export const createComment = async (postId, content) => {
    try {
        const response = await httpRequest.post(`/forum/posts/${postId}/comments`, { content });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Sửa comment
export const updateComment = async (commentId, content) => {
    try {
        const response = await httpRequest.put(`/forum/comments/${commentId}`, { content });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xóa comment
export const deleteComment = async (commentId) => {
    try {
        const response = await httpRequest.del(`/forum/comments/${commentId}`);
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

// Lấy danh sách bài viết PENDING
export const getPendingPosts = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/forum/posts/pending', {
            params: { page, limit }
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

// Lấy danh sách bài viết REJECTED
export const getRejectedPosts = async (page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/forum/posts/rejected', {
            params: { page, limit }
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

// Duyệt bài viết
export const approvePost = async (postId) => {
    try {
        const response = await httpRequest.put(`/forum/posts/${postId}/approve`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Từ chối bài viết
export const rejectPost = async (postId, reason) => {
    try {
        const response = await httpRequest.put(`/forum/posts/${postId}/reject`, { reason });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xóa bài viết (admin)
export const deletePostAdmin = async (postId) => {
    try {
        const response = await httpRequest.del(`/forum/posts/${postId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}

// Xóa comment (admin)
export const deleteCommentAdmin = async (commentId) => {
    try {
        const response = await httpRequest.del(`/forum/comments/${commentId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
}
