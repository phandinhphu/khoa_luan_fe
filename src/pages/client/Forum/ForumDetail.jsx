import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForumPost, usePostComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useForum';
import useAuth from '@/hooks/useAuth';
import Pagination from '@/components/common/Pagination';
import './Forum.css';

const ForumDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [commentContent, setCommentContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [commentsPage, setCommentsPage] = useState(1);
    const commentsLimit = 10;

    // Fetch post detail
    const { data: postResponse, isLoading: loadingPost, error: postError } = useForumPost(postId);

    // Fetch comments
    const { data: commentsResponse, isLoading: loadingComments } = usePostComments(postId, commentsPage, commentsLimit);

    // Mutations
    const createCommentMutation = useCreateComment(postId);
    const updateCommentMutation = useUpdateComment(postId);
    const deleteCommentMutation = useDeleteComment(postId);

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!commentContent.trim()) {
            return;
        }
        createCommentMutation.mutate(commentContent, {
            onSuccess: () => {
                setCommentContent('');
            }
        });
    };

    const handleStartEdit = (comment) => {
        setEditingCommentId(comment._id);
        setEditingContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleUpdateComment = (commentId) => {
        if (!editingContent.trim()) {
            return;
        }
        updateCommentMutation.mutate({ commentId, content: editingContent }, {
            onSuccess: () => {
                setEditingCommentId(null);
                setEditingContent('');
            }
        });
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            deleteCommentMutation.mutate(commentId);
        }
    };

    const handlePageChange = (newPage) => {
        setCommentsPage(newPage + 1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loadingPost) {
        return (
            <div className="post-detail-container">
                <div className="loading">Đang tải bài viết...</div>
            </div>
        );
    }

    if (postError) {
        return (
            <div className="post-detail-container">
                <div className="error">Có lỗi xảy ra: {postError.message}</div>
                <button className="btn-back" onClick={() => navigate('/forum')}>
                    ← Quay lại
                </button>
            </div>
        );
    }

    const post = postResponse?.data;
    const comments = commentsResponse?.data || [];
    const commentsPagination = commentsResponse?.pagination || {};

    return (
        <div className="post-detail-container">
            <button className="btn-back" onClick={() => navigate('/forum')}>
                ← Quay lại danh sách
            </button>

            {/* Post Detail */}
            <div className="post-detail">
                <div className="post-detail-header">
                    <h1 className="post-detail-title">{post.title}</h1>
                    <div className="post-detail-meta">
                        <span>👤 {post.user_id?.name || 'Ẩn danh'}</span>
                        <span>📅 {formatDate(post.created_at)}</span>
                    </div>
                </div>

                <div className="post-detail-content">{post.content}</div>

                {post.document_id && (
                    <div 
                        className="post-detail-document"
                        onClick={() => navigate(`/documents/${post.document_id._id}`)}
                    >
                        <span className="document-icon">📄</span>
                        <span>Tài liệu liên quan: <strong>{post.document_id.title}</strong></span>
                    </div>
                )}
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <h2 className="comments-header">
                    Bình luận ({commentsPagination.total || 0})
                </h2>

                {/* Comment Form - Only show if user is logged in */}
                {user ? (
                    <form className="comment-form" onSubmit={handleSubmitComment}>
                        <textarea
                            placeholder="Viết bình luận của bạn..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <div className="comment-form-actions">
                            <button 
                                type="submit" 
                                className="btn-comment btn-comment-submit"
                                disabled={createCommentMutation.isPending}
                            >
                                {createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="comment-form">
                        <p style={{ textAlign: 'center', color: '#6b7280' }}>
                            Vui lòng <a href="/login" style={{ color: '#3b82f6' }}>đăng nhập</a> để bình luận
                        </p>
                    </div>
                )}

                {/* Comments List */}
                {loadingComments ? (
                    <div className="loading">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="no-posts">
                        <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    <>
                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-card">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {comment.user_id?.name || 'Ẩn danh'}
                                        </span>
                                        <span className="comment-date">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div className="comment-form">
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                            />
                                            <div className="comment-form-actions">
                                                <button
                                                    className="btn-comment btn-comment-cancel"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    className="btn-comment btn-comment-submit"
                                                    onClick={() => handleUpdateComment(comment._id)}
                                                    disabled={updateCommentMutation.isPending}
                                                >
                                                    Lưu
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="comment-content">{comment.content}</p>
                                            
                                            {user && user._id === comment.user_id?._id && (
                                                <div className="comment-actions">
                                                    <button
                                                        className="comment-action-btn"
                                                        onClick={() => handleStartEdit(comment)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="comment-action-btn"
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Pagination
                            page={commentsPage - 1}
                            totalPages={commentsPagination.totalPages}
                            totalItems={commentsPagination.total}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ForumDetail;
