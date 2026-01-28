import { Outlet } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
