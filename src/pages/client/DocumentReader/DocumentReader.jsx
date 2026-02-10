import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readDocumentByPage } from '@/services/document.service';
import { useDocumentById } from '@/hooks/useDocument';
import { xorDecode } from '@/utils/function';
import { toast } from 'react-toastify';

const DocumentReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const { data: documentData, isLoading: isDocumentLoading } = useDocumentById(id);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [imageCache, setImageCache] = useState({});

    const document = documentData?.data?.document || null;
    const hasAccess = documentData?.data?.hasAccess || false;
    const totalPages = useMemo(() => document?.total_pages || 1, [document]);

    // Vẽ ảnh lên canvas
    const drawImageOnCanvas = useCallback((img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Tính toán kích thước để ảnh vừa với màn hình
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        
        let width = img.width;
        let height = img.height;
        
        // Scale để vừa màn hình
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio, 1);
        
        width = width * scale;
        height = height * scale;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
    }, []);

    // Kiểm tra quyền truy cập
    useEffect(() => {
        if (!isDocumentLoading && !hasAccess) {
            toast.error('Bạn cần mượn tài liệu trước khi đọc');
            navigate(`/documents/${id}`);
        }
    }, [hasAccess, isDocumentLoading, id, navigate]);

    // Load trang hiện tại
    const loadPage = useCallback(async (pageNumber) => {
        if (!id || !hasAccess) return;

        // Kiểm tra cache trước
        if (imageCache[pageNumber]) {
            drawImageOnCanvas(imageCache[pageNumber]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const arrayBuffer = await readDocumentByPage(id, pageNumber);

            // Giải mã XOR
            const uint8Array = new Uint8Array(arrayBuffer);
            const decodedArray = xorDecode(uint8Array, 23);

            const blob = new Blob([new Uint8Array(decodedArray)]);
            const img = new Image();

            img.src = URL.createObjectURL(blob);

            img.onload = () => {
                // Lưu vào cache
                setImageCache(prev => ({
                    ...prev,
                    [pageNumber]: img
                }));

                drawImageOnCanvas(img);
                setLoading(false);
                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => {
                toast.error('Không thể tải trang này');
                setLoading(false);
            };
        } catch (err) {
            console.error('Lỗi khi load trang:', err);
            toast.error('Không thể tải trang tài liệu');
            setLoading(false);
        }
    }, [id, hasAccess, imageCache, drawImageOnCanvas]);

    // Handlers
    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    const handleClose = useCallback(() => {
        navigate(`/documents/${id}`);
    }, [id, navigate]);

    // Load trang khi currentPage thay đổi
    useEffect(() => {
        if (hasAccess) {
            loadPage(currentPage);
        }
    }, [currentPage, hasAccess, loadPage]);

    // Preload trang tiếp theo
    useEffect(() => {
        if (currentPage < totalPages && hasAccess && !imageCache[currentPage + 1]) {
            // Preload trang tiếp theo
            readDocumentByPage(id, currentPage + 1)
                .then(arrayBuffer => {
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const decodedArray = xorDecode(uint8Array, 23);
                    const blob = new Blob([new Uint8Array(decodedArray)]);
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => {
                        setImageCache(prev => ({
                            ...prev,
                            [currentPage + 1]: img
                        }));
                        URL.revokeObjectURL(img.src);
                    };
                })
                .catch(() => {});
        }
    }, [currentPage, totalPages, hasAccess, imageCache, id]);

    // Xử lý phím tắt
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') {
                handlePrevPage();
            } else if (e.key === 'ArrowRight') {
                handleNextPage();
            } else if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handlePrevPage, handleNextPage, handleClose]);

    // Ngăn chặn context menu (chuột phải)
    useEffect(() => {
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        window.document.addEventListener('contextmenu', preventContextMenu);
        return () => window.document.removeEventListener('contextmenu', preventContextMenu);
    }, []);

    // Ngăn chặn copy, cut, paste, print
    useEffect(() => {
        const preventCopyPaste = (e) => {
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
                (e.ctrlKey && (e.key === 'v' || e.key === 'V'))
            ) {
                e.preventDefault();
                return false;
            }
        };

        window.addEventListener('keydown', preventCopyPaste);
        return () => window.removeEventListener('keydown', preventCopyPaste);
    }, []);

    if (isDocumentLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="text-white">Đang tải...</div>
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black flex flex-col"
            style={{ userSelect: 'none' }}
        >
            {/* Header */}
            <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        className="hover:bg-gray-700 px-3 py-2 rounded transition"
                        title="Đóng (ESC)"
                    >
                        ✕
                    </button>
                    <h1 className="text-lg font-semibold truncate max-w-md">
                        {document?.title || 'Đang đọc tài liệu'}
                    </h1>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        Trang {currentPage} / {totalPages}
                    </span>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                        <div className="text-white text-xl">Đang tải trang...</div>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain select-none pointer-events-none"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                />

                {/* Navigation buttons */}
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`
                        absolute left-4 top-1/2 -translate-y-1/2
                        bg-gray-800 bg-opacity-70 hover:bg-opacity-90
                        text-white font-bold text-2xl
                        w-12 h-12 rounded-full
                        flex items-center justify-center
                        transition duration-200
                        ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title="Trang trước (←)"
                >
                    ‹
                </button>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`
                        absolute right-4 top-1/2 -translate-y-1/2
                        bg-gray-800 bg-opacity-70 hover:bg-opacity-90
                        text-white font-bold text-2xl
                        w-12 h-12 rounded-full
                        flex items-center justify-center
                        transition duration-200
                        ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title="Trang tiếp (→)"
                >
                    ›
                </button>
            </div>

            {/* Footer - Page navigation */}
            <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-center gap-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`
                        px-4 py-2 rounded
                        ${currentPage === 1 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        }
                    `}
                >
                    ← Trang trước
                </button>
                
                <div className="flex items-center gap-2">
                    <span>{currentPage}</span>
                    <span> / {totalPages}</span>
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`
                        px-4 py-2 rounded
                        ${currentPage === totalPages 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        }
                    `}
                >
                    Trang tiếp →
                </button>
            </div>
        </div>
    );
};

export default DocumentReader;
