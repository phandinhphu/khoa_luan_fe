import { useState } from 'react';
import { MessageSquare, Eye, Check, X, Trash2 } from 'lucide-react';
import { 
    usePendingPosts, 
    useApprovedPosts, 
    useRejectedPosts,
    useApprovePost, 
    useRejectPost, 
    useDeletePostAdmin 
} from '@/hooks/useForum';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
import './ForumManagement.css';

const ForumManagement = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Modals state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // React Query hooks - fetch based on active tab
    const { data: pendingData, isLoading: loadingPending } = usePendingPosts(
        currentPage, 
        pageSize
    );
    const { data: approvedData, isLoading: loadingApproved } = useApprovedPosts(
        currentPage, 
        pageSize
    );
    const { data: rejectedData, isLoading: loadingRejected } = useRejectedPosts(
        currentPage, 
        pageSize
    );

    const approveMutation = useApprovePost();
    const rejectMutation = useRejectPost();
    const deleteMutation = useDeletePostAdmin();

    // Get data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'pending':
                return { data: pendingData, isLoading: loadingPending };
            case 'approved':
                return { data: approvedData, isLoading: loadingApproved };
            case 'rejected':
                return { data: rejectedData, isLoading: loadingRejected };
            default:
                return { data: pendingData, isLoading: loadingPending };
        }
    };

    const { data: postsData, isLoading } = getCurrentData();
    
    // Extract data
    const posts = postsData?.data || [];
    const pagination = postsData?.pagination || {};

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when changing tabs
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page + 1);
    };

    // View post detail
    const handleView = (post) => {
        setSelectedPost(post);
        setIsViewModalOpen(true);
    };

    // Approve post
    const handleApprove = (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) {
            approveMutation.mutate(postId);
        }
    };

    // Open reject modal
    const handleOpenReject = (post) => {
        setSelectedPost(post);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    // Reject post
    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        rejectMutation.mutate(
            { postId: selectedPost._id, reason: rejectReason },
            {
                onSuccess: () => {
                    setIsRejectModalOpen(false);
                    setRejectReason('');
                    setSelectedPost(null);
                }
            }
        );
    };

    // Open delete modal
    const handleOpenDelete = (post) => {
        setSelectedPost(post);
        setIsDeleteModalOpen(true);
    };

    // Delete post
    const handleDelete = () => {
        deleteMutation.mutate(selectedPost._id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedPost(null);
            }
        });
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
            <div className="forum-management">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="forum-management">
            <div className="page-header">
                <div className="header-content">
                    <MessageSquare className="header-icon" />
                    <div>
                        <h1>Quản lý bài viết diễn đàn</h1>
                        <p>Duyệt và quản lý các bài viết</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => handleTabChange('pending')}
                >
                    Chờ duyệt
                    {pendingData?.pagination?.total > 0 && (
                        <span className="badge">{pendingData.pagination.total}</span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('approved')}
                >
                    Đã duyệt
                    {approvedData?.pagination?.total > 0 && (
                        <span className="badge">{approvedData.pagination.total}</span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => handleTabChange('rejected')}
                >
                    Đã từ chối
                    {rejectedData?.pagination?.total > 0 && (
                        <span className="badge">{rejectedData.pagination.total}</span>
                    )}
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="empty-state">
                    <MessageSquare size={48} className="empty-icon" />
                    <p>
                        {activeTab === 'pending' && 'Không có bài viết nào đang chờ duyệt'}
                        {activeTab === 'approved' && 'Không có bài viết nào đã được duyệt'}
                        {activeTab === 'rejected' && 'Không có bài viết nào bị từ chối'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="posts-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Tác giả</th>
                                    <th>Ngày tạo</th>
                                    <th>Tài liệu</th>
                                    {activeTab === 'rejected' && <th>Lý do từ chối</th>}
                                    <th className="actions-column">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post._id}>
                                        <td>
                                            <div className="post-title-cell">
                                                <strong>{post.title}</strong>
                                                <p className="post-excerpt">
                                                    {post.content.length > 100
                                                        ? `${post.content.substring(0, 100)}...`
                                                        : post.content}
                                                </p>
                                            </div>
                                        </td>
                                        <td>{post.user_id?.name || 'N/A'}</td>
                                        <td>{formatDate(post.created_at)}</td>
                                        <td>
                                            {post.document_id ? (
                                                <span className="document-badge">
                                                    📄 {post.document_id.title}
                                                </span>
                                            ) : (
                                                <span className="text-muted">Không có</span>
                                            )}
                                        </td>
                                        {activeTab === 'rejected' && (
                                            <td>
                                                <span className="reject-reason-cell">
                                                    {post.reject_reason || 'Không có lý do'}
                                                </span>
                                            </td>
                                        )}
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-view"
                                                    onClick={() => handleView(post)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                
                                                {/* Show Approve/Reject buttons only for pending posts */}
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-icon btn-approve"
                                                            onClick={() => handleApprove(post._id)}
                                                            disabled={approveMutation.isPending}
                                                            title="Duyệt"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-reject"
                                                            onClick={() => handleOpenReject(post)}
                                                            disabled={rejectMutation.isPending}
                                                            title="Từ chối"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleOpenDelete(post)}
                                                    disabled={deleteMutation.isPending}
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={currentPage - 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            {/* View Post Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Chi tiết bài viết"
            >
                {selectedPost && (
                    <div className="post-detail-modal">
                        <div className="modal-section">
                            <h3>{selectedPost.title}</h3>
                            <div className="post-meta">
                                <span>👤 {selectedPost.user_id?.name || 'Ẩn danh'}</span>
                                <span>📅 {formatDate(selectedPost.created_at)}</span>
                            </div>
                        </div>

                        <div className="modal-section">
                            <h4>Nội dung:</h4>
                            <p className="post-content">{selectedPost.content}</p>
                        </div>

                        {selectedPost.document_id && (
                            <div className="modal-section">
                                <h4>Tài liệu liên quan:</h4>
                                <div className="document-info">
                                    📄 {selectedPost.document_id.title}
                                </div>
                            </div>
                        )}

                        {/* Show reject reason for rejected posts */}
                        {activeTab === 'rejected' && selectedPost.reject_reason && (
                            <div className="modal-section">
                                <h4>Lý do từ chối:</h4>
                                <div className="reject-reason-box">
                                    {selectedPost.reject_reason}
                                </div>
                            </div>
                        )}

                        {/* Show review info for approved/rejected posts */}
                        {(activeTab === 'approved' || activeTab === 'rejected') && (
                            <div className="modal-section">
                                <h4>Thông tin duyệt:</h4>
                                <div className="review-info">
                                    <p>Người duyệt: {selectedPost.reviewed_by?.name || 'N/A'}</p>
                                    <p>Thời gian: {selectedPost.reviewed_at ? formatDate(selectedPost.reviewed_at) : 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {/* Only show approve/reject actions for pending posts */}
                        {activeTab === 'pending' && (
                            <div className="modal-actions">
                                <button
                                    className="btn btn-approve"
                                    onClick={() => {
                                        handleApprove(selectedPost._id);
                                        setIsViewModalOpen(false);
                                    }}
                                    disabled={approveMutation.isPending}
                                >
                                    <Check size={16} />
                                    Duyệt bài viết
                                </button>
                                <button
                                    className="btn btn-reject"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleOpenReject(selectedPost);
                                    }}
                                >
                                    <X size={16} />
                                    Từ chối
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Từ chối bài viết"
            >
                {selectedPost && (
                    <div className="reject-modal">
                        <p>
                            Bạn đang từ chối bài viết: <strong>{selectedPost.title}</strong>
                        </p>
                        <div className="form-group">
                            <label htmlFor="rejectReason">
                                Lý do từ chối <span className="required">*</span>
                            </label>
                            <textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối bài viết..."
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsRejectModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={rejectMutation.isPending}
                            >
                                {rejectMutation.isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa"
            >
                {selectedPost && (
                    <div className="delete-modal">
                        <p>
                            Bạn có chắc chắn muốn xóa bài viết:{' '}
                            <strong>{selectedPost.title}</strong>?
                        </p>
                        <p className="warning-text">
                            Hành động này không thể hoàn tác!
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ForumManagement;
