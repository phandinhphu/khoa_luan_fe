import { useState, useEffect } from 'react';
import Context from './Context';
import * as authService from '@/services/auth.service';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (token && !user) {
                try {
                     // Assuming you might want to validate the token or fetch user profile here.
                     // For now, based on the requirement "user data returned on login",
                     // we might just need to persist the user info alongside token or fetch it.
                     // But the prompt says "refreshToken added to cookies", so we can try to fetch profile.
                     // The existing authService has getCurrentUser.
                    const userData = await authService.getCurrentUser();
                    setUser(userData.data);
                } catch (error) {
                    console.error("Failed to fetch user on load", error);
                    localStorage.removeItem('accessToken');
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [user]);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        // data: { message, data: { user, accessToken } }
        if (data && data.data) {
             localStorage.setItem('accessToken', data.data.accessToken);
             setUser(data.data.user);
        }
        return data;
    };

    const register = async (name, email, password) => {
        return await authService.register(name, email, password);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
        }
    };

    const updateUser = (updatedUserData) => {
        setUser((prevUser) => ({ ...prevUser, ...updatedUserData }));
    };

    return (
        <Context.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </Context.Provider>
    );
};

export default AuthProvider;