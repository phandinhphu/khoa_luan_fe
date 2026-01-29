import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import {
    useAllDocumentsAdmin,
    useUploadDocument,
    useUpdateDocument,
    useDeleteDocument,
} from '../../../hooks/useDocument';
import {
    getCopyrightStatusOptions,
    getCopyrightStatusLabel,
    isValidFileType,
    COPYRIGHT_STATUS,
} from '../../../utils/documentConstants';
import { toast } from 'react-toastify';
import './DocumentManagement.css';

const DocumentManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // React Query hooks
    const { data: documentsData, isLoading } = useAllDocumentsAdmin(currentPage, pageSize);
    const uploadDocumentMutation = useUploadDocument();
    const updateDocumentMutation = useUpdateDocument();
    const deleteDocumentMutation = useDeleteDocument();

    // Extract data from response
    const documents = documentsData?.data?.documents || [];
    const total = documentsData?.total || 0;
    const totalPages = documentsData?.totalPages || 1;

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Form states
    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        total_copies: 3,
        copyright_status: COPYRIGHT_STATUS.UNKNOWN,
        file: null,
    });
    const [editFormData, setEditFormData] = useState({
        title: '',
        total_copies: 3,
        copyright_status: COPYRIGHT_STATUS.UNKNOWN,
    });
    const [errors, setErrors] = useState({});

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Open upload modal
    const handleOpenUpload = () => {
        setUploadFormData({
            title: '',
            total_copies: 3,
            copyright_status: COPYRIGHT_STATUS.UNKNOWN,
            file: null,
        });
        setErrors({});
        setIsUploadModalOpen(true);
    };

    // Open edit modal
    const handleEdit = (document) => {
        setSelectedDocument(document);
        setEditFormData({
            title: document.title || '',
            total_copies: document.total_copies || 3,
            copyright_status: document.copyright_status || COPYRIGHT_STATUS.UNKNOWN,
        });
        setErrors({});
        setIsEditModalOpen(true);
    };

    // Open delete modal
    const handleDelete = (document) => {
        setSelectedDocument(document);
        setIsDeleteModalOpen(true);
    };

    // Handle upload form input change
    const handleUploadInputChange = (e) => {
        const { name, value } = e.target;
        setUploadFormData({ ...uploadFormData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle edit form input change
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!isValidFileType(file)) {
                setErrors({ ...errors, file: 'Chỉ chấp nhận file PDF hoặc DOCX' });
                return;
            }
            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setErrors({ ...errors, file: 'Kích thước file không được vượt quá 50MB' });
                return;
            }
            setUploadFormData({ ...uploadFormData, file });
            if (errors.file) {
                setErrors({ ...errors, file: '' });
            }
        }
    };

    // Validate upload form
    const validateUploadForm = () => {
        const newErrors = {};
        if (!uploadFormData.title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        }
        if (!uploadFormData.file) {
            newErrors.file = 'Vui lòng chọn file tài liệu';
        }
        if (uploadFormData.total_copies < 1) {
            newErrors.total_copies = 'Số lượng bản sao phải lớn hơn 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate edit form
    const validateEditForm = () => {
        const newErrors = {};
        if (!editFormData.title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        }
        if (editFormData.total_copies < 1) {
            newErrors.total_copies = 'Số lượng bản sao phải lớn hơn 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit upload form
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!validateUploadForm()) return;

        try {
            await uploadDocumentMutation.mutateAsync(uploadFormData);
            toast.success('Tải lên tài liệu thành công');
            setIsUploadModalOpen(false);
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tải lên tài liệu');
        }
    };

    // Submit edit form
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateEditForm()) return;

        try {
            await updateDocumentMutation.mutateAsync({
                documentId: selectedDocument._id,
                documentData: editFormData,
            });
            toast.success('Cập nhật tài liệu thành công');
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật tài liệu');
        }
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await deleteDocumentMutation.mutateAsync(selectedDocument._id);
            toast.success('Xóa tài liệu thành công');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi xóa tài liệu');
        }
    };

    // Define table columns
    const columns = [
        { key: 'title', label: 'Tiêu đề' },
        {
            key: 'file_type',
            label: 'Loại file',
            render: (doc) => (
                <span className="file-type-badge">{doc.file_type?.toUpperCase() || 'N/A'}</span>
            ),
        },
        {
            key: 'total_pages',
            label: 'Số trang',
            render: (doc) => doc.total_pages || 0,
        },
        {
            key: 'total_copies',
            label: 'Số bản sao',
            render: (doc) => doc.total_copies || 0,
        },
        {
            key: 'copyright_status',
            label: 'Tình trạng bản quyền',
            render: (doc) => (
                <span className="copyright-badge">{getCopyrightStatusLabel(doc.copyright_status)}</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            render: (doc) =>
                doc.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') : 'N/A',
        },
    ];

    // Filter documents based on search term
    const filteredDocuments = documents.filter((doc) =>
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="document-management">
            <div className="page-header">
                <div className="header-content">
                    <div className="title-section">
                        <FileText className="icon" size={32} />
                        <div>
                            <h1 className="title">Quản lý tài liệu</h1>
                            <p className="subtitle">Quản lý tài liệu trong thư viện</p>
                        </div>
                    </div>
                    <button onClick={handleOpenUpload} className="btn-primary">
                        <Upload size={20} />
                        Tải lên tài liệu
                    </button>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="toolbar">
                    <div className="search-box">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="stats">
                        <span className="stat-item">
                            Tổng số: <strong>{total}</strong> tài liệu
                        </span>
                    </div>
                </div>

                {isLoading && <div className="loading">Đang tải...</div>}

                {!isLoading && (
                    <>
                        <DataTable
                            columns={columns}
                            data={filteredDocuments}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />

                        {totalPages > 1 && (
                            <div className="pagination-wrapper">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Upload Document Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="Tải lên tài liệu mới"
                size="md"
            >
                <form onSubmit={handleUploadSubmit} className="document-form">
                    <div className="form-group">
                        <label className="form-label">
                            Tiêu đề <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={uploadFormData.title}
                            onChange={handleUploadInputChange}
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            placeholder="Nhập tiêu đề tài liệu"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            File tài liệu <span className="required">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className={`file-input ${errors.file ? 'error' : ''}`}
                        />
                        <p className="file-hint">Chỉ chấp nhận file PDF hoặc DOCX, tối đa 50MB</p>
                        {uploadFormData.file && (
                            <p className="file-selected">File đã chọn: {uploadFormData.file.name}</p>
                        )}
                        {errors.file && <span className="error-message">{errors.file}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Số lượng bản sao <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="total_copies"
                                value={uploadFormData.total_copies}
                                onChange={handleUploadInputChange}
                                min="1"
                                className={`form-input ${errors.total_copies ? 'error' : ''}`}
                            />
                            {errors.total_copies && (
                                <span className="error-message">{errors.total_copies}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Tình trạng bản quyền <span className="required">*</span>
                            </label>
                            <select
                                name="copyright_status"
                                value={uploadFormData.copyright_status}
                                onChange={handleUploadInputChange}
                                className="form-input"
                            >
                                {getCopyrightStatusOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(false)}
                            className="btn-secondary"
                            disabled={uploadDocumentMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={uploadDocumentMutation.isPending}
                        >
                            {uploadDocumentMutation.isPending ? 'Đang tải lên...' : 'Tải lên'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Document Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Chỉnh sửa tài liệu"
                size="md"
            >
                <form onSubmit={handleEditSubmit} className="document-form">
                    <div className="form-group">
                        <label className="form-label">
                            Tiêu đề <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditInputChange}
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            placeholder="Nhập tiêu đề tài liệu"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Số lượng bản sao <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="total_copies"
                                value={editFormData.total_copies}
                                onChange={handleEditInputChange}
                                min="1"
                                className={`form-input ${errors.total_copies ? 'error' : ''}`}
                            />
                            {errors.total_copies && (
                                <span className="error-message">{errors.total_copies}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Tình trạng bản quyền <span className="required">*</span>
                            </label>
                            <select
                                name="copyright_status"
                                value={editFormData.copyright_status}
                                onChange={handleEditInputChange}
                                className="form-input"
                            >
                                {getCopyrightStatusOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="btn-secondary"
                            disabled={updateDocumentMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={updateDocumentMutation.isPending}
                        >
                            {updateDocumentMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa"
                size="sm"
            >
                <div className="delete-confirmation">
                    <p className="confirmation-text">
                        Bạn có chắc chắn muốn xóa tài liệu{' '}
                        <strong>{selectedDocument?.title}</strong> không?
                    </p>
                    <p className="warning-text">Hành động này không thể hoàn tác!</p>
                    <div className="form-actions">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="btn-secondary"
                            disabled={deleteDocumentMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="btn-danger"
                            disabled={deleteDocumentMutation.isPending}
                        >
                            {deleteDocumentMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentManagement;
