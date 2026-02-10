import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForumPosts } from '@/hooks/useForum';
import Pagination from '@/components/common/Pagination';
import './Forum.css';

const ForumList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading, error } = useForumPosts(page, limit);

    const posts = response?.data || [];
    const pagination = response?.pagination || {};

    const handlePageChange = (newPage) => {
        setPage(newPage + 1); // Pagination component uses 0-index
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

    if (isLoading) {
        return (
            <div className="forum-container">
                <div className="loading">Đang tải bài viết...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="forum-container">
                <div className="error">Có lỗi xảy ra: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h1>Diễn đàn thảo luận</h1>
                <button 
                    className="btn-create-post"
                    onClick={() => navigate('/forum/create')}
                >
                    Tạo bài viết
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="no-posts">
                    <p>Chưa có bài viết nào.</p>
                </div>
            ) : (
                <>
                    <div className="posts-list">
                        {posts.map(post => (
                            <div 
                                key={post._id} 
                                className="post-card"
                                onClick={() => navigate(`/forum/posts/${post._id}`)}
                            >
                                <div className="post-header">
                                    <h3 className="post-title">{post.title}</h3>
                                    <span className="post-date">{formatDate(post.created_at)}</span>
                                </div>
                                
                                <p className="post-content-preview">
                                    {post.content.length > 200 
                                        ? `${post.content.substring(0, 200)}...` 
                                        : post.content}
                                </p>

                                <div className="post-footer">
                                    <div className="post-author">
                                        <span className="author-icon">👤</span>
                                        <span>{post.user_id?.name || 'Ẩn danh'}</span>
                                    </div>
                                    
                                    {post.document_id && (
                                        <div className="post-document">
                                            <span className="document-icon">📄</span>
                                            <span>{post.document_id.title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        page={page - 1} // Convert to 0-index
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default ForumList;
