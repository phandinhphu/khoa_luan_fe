import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        try {
            const res = await login(email, password);
            toast.success('Đăng nhập thành công');
            console.log('Đăng nhập thành công', res);
            // Check role and navigate
            const user = res?.data?.user;
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Đăng nhập thất bại', error);
            toast.error(error.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
                <p className="mt-2 text-gray-600">Vui lòng đăng nhập vào tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition ease-in-out duration-150 outline-none"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition ease-in-out duration-150 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <a href="#!" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Quên mật khẩu?
                        </a>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Đăng nhập'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Chưa có tài khoản? </span>
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Đăng ký ngay
                </Link>
            </div>
        </div>
    );
};

export default Login;
