import useAuth from '@/hooks/useAuth';
import { Star } from 'lucide-react';

const ReviewSection = ({ review }) => {
    const { user } = useAuth();

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                            {review.user_id?.name?.charAt(0).toUpperCase() === user?.name?.charAt(0).toUpperCase()
                                ? user?.name?.charAt(0).toUpperCase()
                                : review.user_id?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {review.user_id?.name === user?.name ? 'Bạn' : review.user_id?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={14}
                                    className={`${
                                        star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
        </div>
    );
};

export default ReviewSection;
