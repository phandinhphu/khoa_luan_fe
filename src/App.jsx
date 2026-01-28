import AuthProvider from './contexts/Auth/AuthProvider';
import AppRouters from './routes/AppRouters';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppRouters />
                <ToastContainer position="top-right" autoClose={3000} />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
