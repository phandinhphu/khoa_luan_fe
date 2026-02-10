import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReviewSection from '@/components/document/ReviewSection';
import { previewDocument } from '@/services/document.service';
import {
    useDocumentById,
    useBorrowDocument,
    useReturnDocument,
    useDocumentReviews,
    useCreateDocumentReview,
} from '@/hooks/useDocument';
import useAuth from '@/hooks/useAuth';
import { xorDecode } from '@/utils/function';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';

const DocumentDetail = () => {
    const { id } = useParams();
    const canvasRef = useRef(null);
    const { data: documentData, isLoading: isDocumentLoading, isFetching } = useDocumentById(id);
    const borrowMutation = useBorrowDocument(id);
    const returnMutation = useReturnDocument(id);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const document = documentData?.data?.document || null;
    const hasReview = documentData?.data?.hasReview || false;
    const hasAccess = documentData?.data?.hasAccess || false;

    // Review states
    const [reviewPage, setReviewPage] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [accumulatedReviews, setAccumulatedReviews] = useState([]);

    // Review hooks
    const { data: reviewsData, isLoading: isReviewsLoading } = useDocumentReviews(id, reviewPage, 5);
    const createReviewMutation = useCreateDocumentReview(id);

    const totalReviewPages = reviewsData?.totalPages || 1;
    const currentReviewPage = reviewsData?.currentPage || 1;

    // Accumulate reviews when new data arrives
    useEffect(() => {
        if (reviewsData?.data?.reviews) {
            if (reviewPage === 1) {
                // Reset accumulated reviews when going back to page 1
                setAccumulatedReviews(reviewsData.data.reviews);
            } else {
                // Append new reviews, avoid duplicates
                setAccumulatedReviews((prev) => {
                    const existingIds = new Set(prev.map((r) => r._id));
                    const newReviews = reviewsData.data.reviews.filter(
                        (r) => !existingIds.has(r._id)
                    );
                    return [...prev, ...newReviews];
                });
            }
        }
    }, [reviewsData, reviewPage]);

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

    // Review handlers
    const handleSubmitReview = (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nhận xét');
            return;
        }

        createReviewMutation.mutate(
            { rating, comment },
            {
                onSuccess: () => {
                    toast.success('Đánh giá thành công');
                    setComment('');
                    setRating(5);
                    setReviewPage(1); // Reset to first page
                },
                onError: (error) => {
                    toast.error(error.message || 'Đánh giá thất bại');
                },
            }
        );
    };

    const handleLoadMore = () => {
        if (currentReviewPage < totalReviewPages) {
            setReviewPage(currentReviewPage + 1);
        }
    };

    const handleCollapse = () => {
        setReviewPage(1);
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

                    {/* Total borrows */}
                    <div className="mb-4 text-gray-700">Tổng số lượt mượn: {document.total_borrows}</div>

                    {/* Copyright status */}
                    <div className="mb-4 text-gray-700">Tình trạng bản quyền: {document.copyright_status}</div>

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
                    <div className="flex gap-4 mb-8">
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

                    {/* Reviews Section */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá</h2>

                        {/* Review Form */}
                        {user && !hasReview && (
                            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Đánh giá của bạn
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none transition-colors"
                                            >
                                                <Star
                                                    size={28}
                                                    className={`${
                                                        star <= (hoverRating || rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {rating} sao
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nhận xét
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Chia sẻ suy nghĩ của bạn về tài liệu này..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows="4"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createReviewMutation.isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
                                >
                                    {createReviewMutation.isLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </form>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {isReviewsLoading && reviewPage === 1 ? (
                                <div className="text-center py-4 text-gray-500">Đang tải đánh giá...</div>
                            ) : accumulatedReviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                                </div>
                            ) : (
                                <>
                                    {accumulatedReviews.map((review) => (
                                        <ReviewSection key={review._id} review={review} />
                                    ))}

                                    {/* Load More / Collapse Button */}
                                    {totalReviewPages > 1 && (
                                        <div className="text-center mt-4">
                                            {currentReviewPage < totalReviewPages ? (
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={isReviewsLoading}
                                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200 disabled:opacity-50"
                                                >
                                                    {isReviewsLoading ? 'Đang tải...' : 'Hiển thị thêm'}
                                                </button>
                                            ) : (
                                                currentReviewPage > 1 && (
                                                    <button
                                                        onClick={handleCollapse}
                                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200"
                                                    >
                                                        Ẩn bớt
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;
