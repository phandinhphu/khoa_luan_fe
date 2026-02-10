import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPosts, useDeletePost } from '@/hooks/useForum';
import Pagination from '@/components/common/Pagination';
import './Forum.css';

const MyPosts = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading, error } = useMyPosts(page, limit);
    const deleteMutation = useDeletePost();

    const handlePageChange = (newPage) => {
        setPage(newPage + 1);
    };

    const handleView = (postId) => {
        navigate(`/forum/posts/${postId}`);
    };

    const handleEdit = (postId, status) => {
        if (status === 'APPROVED') {
            return;
        }
        navigate(`/forum/edit/${postId}`);
    };

    const handleDelete = (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            deleteMutation.mutate(postId);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { label: 'Chờ duyệt', className: 'status-pending' },
            'APPROVED': { label: 'Đã duyệt', className: 'status-approved' },
            'REJECTED': { label: 'Bị từ chối', className: 'status-rejected' }
        };
        const statusInfo = statusMap[status] || statusMap['PENDING'];
        return (
            <span className={`my-post-status ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="my-posts-container">
                <div className="loading">Đang tải bài viết...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-posts-container">
                <div className="error">Có lỗi xảy ra: {error.message}</div>
            </div>
        );
    }

    const posts = response?.data || [];
    const pagination = response?.pagination || {};

    return (
        <div className="my-posts-container">
            <div className="my-posts-header">
                <h1>Bài viết của tôi</h1>
                <button 
                    className="btn-create-post"
                    onClick={() => navigate('/forum/create')}
                    style={{ marginTop: '10px' }}
                >
                    Tạo bài viết mới
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="no-posts">
                    <p>Bạn chưa có bài viết nào.</p>
                    <button 
                        className="btn-create-post"
                        onClick={() => navigate('/forum/create')}
                        style={{ marginTop: '15px' }}
                    >
                        Tạo bài viết đầu tiên
                    </button>
                </div>
            ) : (
                <>
                    <div className="posts-list">
                        {posts.map(post => (
                            <div key={post._id} className="my-post-card">
                                <div className="my-post-header">
                                    <div className="my-post-title-section">
                                        <h3 className="my-post-title">{post.title}</h3>
                                        {getStatusBadge(post.status)}
                                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                                            Đăng lúc: {formatDate(post.created_at)}
                                        </div>
                                    </div>

                                    <div className="my-post-actions">
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => handleView(post._id)}
                                        >
                                            Xem
                                        </button>
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => handleEdit(post._id, post.status)}
                                            disabled={post.status === 'APPROVED'}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn-action btn-delete"
                                            onClick={() => handleDelete(post._id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>

                                <p className="my-post-content">
                                    {post.content.length > 200 
                                        ? `${post.content.substring(0, 200)}...` 
                                        : post.content}
                                </p>

                                {post.document_id && (
                                    <div className="post-footer">
                                        <div className="post-document">
                                            <span className="document-icon">📄</span>
                                            <span>{post.document_id.title}</span>
                                        </div>
                                    </div>
                                )}

                                {post.status === 'REJECTED' && post.reject_reason && (
                                    <div className="reject-reason">
                                        <strong>Lý do từ chối:</strong>
                                        <p>{post.reject_reason}</p>
                                    </div>
                                )}

                                {post.status === 'APPROVED' && post.reviewed_at && (
                                    <div style={{ 
                                        marginTop: '10px', 
                                        fontSize: '13px', 
                                        color: '#059669',
                                        fontStyle: 'italic' 
                                    }}>
                                        Đã duyệt lúc: {formatDate(post.reviewed_at)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Pagination
                        page={page - 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default MyPosts;
