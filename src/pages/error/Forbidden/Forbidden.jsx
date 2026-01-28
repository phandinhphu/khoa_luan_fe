import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Forbidden = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <ShieldAlert className="mx-auto h-24 w-24 text-red-500 mb-6" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">403</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có quyền truy cập</h2>
                <p className="text-gray-600 mb-8">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default Forbidden;
