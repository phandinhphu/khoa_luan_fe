import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { previewDocument } from '@/services/document.service';
import { useDocumentById, useBorrowDocument, useReturnDocument } from '@/hooks/useDocument';
import useAuth from '@/hooks/useAuth';
import { xorDecode } from '@/utils/function';
import { toast } from 'react-toastify';

const DocumentDetail = () => {
    const { id } = useParams();
    const canvasRef = useRef(null);
    const { data: documentData, isLoading: isDocumentLoading, isFetching } = useDocumentById(id);
    const borrowMutation = useBorrowDocument(id);
    const returnMutation = useReturnDocument(id);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const document = documentData?.data?.document || null;
    const hasAccess = documentData?.data?.hasAccess || false;

    useEffect(() => {
        if (!id || isDocumentLoading || isFetching) return;

        let cancelled = false;

        const loadPreview = async () => {
            try {
                const arrayBuffer = await previewDocument(id);

                if (cancelled) return;

                // Giải mã XOR nếu có
                const uint8Array = new Uint8Array(arrayBuffer);
                const decodedArray = xorDecode(uint8Array, 23);

                const blob = new Blob([new Uint8Array(decodedArray)]);
                const img = new Image();

                img.src = URL.createObjectURL(blob);

                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    URL.revokeObjectURL(img.src);
                };
            } catch (err) {
                console.error('Không load được preview', err);
            } finally {
                setLoading(false);
            }
        };

        loadPreview();

        return () => {
            cancelled = true;
        };
    }, [id, isDocumentLoading, isFetching]);

    const handleRead = () => {
        if (user == null) {
            toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
            return;
        }
        
        if (!hasAccess) {
            toast.error('Bạn cần mượn tài liệu trước khi đọc');
            return;
        }
        
        // Chuyển đến trang đọc tài liệu
        window.location.href = `/documents/${id}/read`;
    };

    const handleBorrow = () => {
        // TODO: Implement borrow functionality
        console.log('Mượn tài liệu');
        if (user == null) {
            toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
            return;
        }

        borrowMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success('Mượn tài liệu thành công');
            },
            onError: (error) => {
                toast.error(`Mượn tài liệu thất bại: ${error.message}`);
            },
        });
    };

    const handleReturn = () => {
        // TODO: Implement return functionality
        console.log('Trả tài liệu');
        if (user == null) {
            toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
            return;
        }

        returnMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success('Trả tài liệu thành công');   
            },
            onError: (error) => {
                toast.error(`Trả tài liệu thất bại: ${error.message}`);
            },
        });
    };

    if (isDocumentLoading || !document) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (isFetching) {
        return <div className="flex justify-center items-center min-h-screen">Cập nhật dữ liệu...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Preview */}
                <div className="flex justify-center items-start">
                    <div className="w-full max-w-md">
                        <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-lg shadow-lg">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-400">Đang tải preview...</div>
                                </div>
                            ) : (
                                <canvas
                                    ref={canvasRef}
                                    draggable={false}
                                    className="w-full h-full object-contain select-none pointer-events-none"
                                />
                            )}
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-500">Preview của tài liệu</div>
                    </div>
                </div>

                {/* Right side - Content */}
                <div className="flex flex-col">
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{document.title}</h1>

                    {/* Read button */}
                    <button
                        onClick={handleRead}
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-semibold
                            py-3
                            px-6
                            rounded-lg
                            transition
                            duration-200
                            mb-4
                        "
                    >
                        Đọc
                    </button>

                    {/* Divider */}
                    <hr className="border-gray-300 mb-4" />

                    {/* Borrow and Return buttons row */}
                    <div className="flex gap-4">
                        {hasAccess ? (
                            <button
                                onClick={handleReturn}
                                className="
                                flex-1
                                bg-orange-600
                                hover:bg-orange-700
                                text-white
                                font-semibold
                                py-3
                                px-6
                                rounded-lg
                                transition
                                duration-200
                            "
                            >
                                Trả
                            </button>
                        ) : (
                            <button
                                onClick={handleBorrow}
                                className="
                                flex-1
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                font-semibold
                                py-3
                                px-6
                                rounded-lg
                                transition
                                duration-200
                            "
                            >
                                Mượn
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;
