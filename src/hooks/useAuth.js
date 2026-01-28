import { useContext } from 'react';
import Context from '../contexts/Auth/Context';

const useAuth = () => {
    return useContext(Context);
};

export default useAuth;
