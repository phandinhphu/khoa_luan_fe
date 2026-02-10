import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreatePost, useUpdatePost, useForumPost } from '@/hooks/useForum';
import { useAllDocuments } from '@/hooks/useDocument';
import { toast } from 'react-toastify';
import './Forum.css';

const CreatePost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(postId);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        document_id: ''
    });

    // Fetch post data if editing
    const { data: postResponse, isLoading: loadingPost } = useForumPost(postId);

    // Fetch documents for dropdown
    const { data: documentsResponse } = useAllDocuments();

    // Mutations
    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();

    // Populate form when editing
    useEffect(() => {
        if (isEditMode && postResponse?.data) {
            const post = postResponse.data;
            setFormData({
                title: post.title,
                content: post.content,
                document_id: post.document_id?._id || ''
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, postResponse?.data?._id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        if (!formData.content.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        const submitData = {
            title: formData.title,
            content: formData.content,
            document_id: formData.document_id || undefined
        };

        if (isEditMode) {
            updateMutation.mutate({ postId, postData: submitData }, {
                onSuccess: () => {
                    navigate('/forum/my-posts');
                }
            });
        } else {
            createMutation.mutate(submitData, {
                onSuccess: () => {
                    navigate('/forum/my-posts');
                }
            });
        }
    };

    const handleCancel = () => {
        navigate('/forum/my-posts');
    };

    if (isEditMode && loadingPost) {
        return (
            <div className="post-form-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    const documents = documentsResponse?.data?.documents || [];
    const isPending = createMutation.isPending || updateMutation.isPending;

    // Check edit permission for existing post
    if (isEditMode && postResponse?.data) {
        const post = postResponse.data;
        if (post.status === 'APPROVED') {
            return (
                <div className="post-form-container">
                    <div className="error">
                        Không thể chỉnh sửa bài viết đã được duyệt.
                    </div>
                    <button className="btn-back" onClick={handleCancel}>
                        ← Quay lại
                    </button>
                </div>
            );
        }
    }

    return (
        <div className="post-form-container">
            <form className="post-form" onSubmit={handleSubmit}>
                <h1>{isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>

                {isEditMode && postResponse?.data?.reject_reason && (
                    <div className="reject-reason">
                        <strong>Lý do từ chối:</strong>
                        <p>{postResponse.data.reject_reason}</p>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="title">Tiêu đề <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề bài viết"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Nội dung <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Nhập nội dung bài viết"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="document_id">Tài liệu liên quan (tùy chọn)</label>
                    <select
                        id="document_id"
                        name="document_id"
                        value={formData.document_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Không chọn tài liệu --</option>
                        {documents.map(doc => (
                            <option key={doc._id} value={doc._id}>
                                {doc.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-form btn-form-cancel"
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-form btn-form-submit"
                        disabled={isPending}
                    >
                        {isPending ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Tạo bài viết')}
                    </button>
                </div>

                {!isEditMode && (
                    <p style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
                        * Bài viết của bạn sẽ được gửi đến quản trị viên để duyệt trước khi hiển thị công khai.
                    </p>
                )}
            </form>
        </div>
    );
};

export default CreatePost;
