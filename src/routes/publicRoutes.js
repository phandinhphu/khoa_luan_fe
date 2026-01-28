import { lazy } from 'react';

// Layouts
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import ClientLayout from '../layouts/ClientLayout/ClientLayout';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Pages
import Login from '../pages/auth/Login/Login';
import Register from '../pages/auth/Register/Register';
import Home from '../pages/client/Home/Home';
import DocumentDetail from '../pages/client/DocumentDetail/DocumentDetail';
import DocumentReader from '../pages/client/DocumentReader/DocumentReader';
import Profile from '../pages/client/Profile/Profile';
import Dashboard from '../pages/admin/Dashboard/Dashboard';
import UserManagement from '../pages/admin/UserManagement/UserManagement';
import Forbidden from '../pages/error/Forbidden/Forbidden';

/**
 * Structure of a route object:
 * { 
 *   path: string, 
 *   component: ReactComponent, 
 *   layout: ReactComponent | null, 
 *   requiresAuth: boolean,
 *   allowedRoles?: string[]
 * }
 */
const publicRoutes = [
    // Auth Routes
    {
        path: '/login',
        component: Login,
        layout: AuthLayout,
        requiresAuth: false,
    },
    {
        path: '/register',
        component: Register,
        layout: AuthLayout,
        requiresAuth: false,
    },

    // Client Routes
    {
        path: '/',
        component: Home,
        layout: ClientLayout,
        requiresAuth: false, // Client pages do not require login
    },
    {
        path: '/documents/:id',
        component: DocumentDetail,
        layout: ClientLayout,
        requiresAuth: false,
    },
    {
        path: '/documents/:id/read',
        component: DocumentReader,
        layout: null, // Full screen
        requiresAuth: false,
    },
    {
        path: '/profile',
        component: Profile,
        layout: ClientLayout,
        requiresAuth: true,
    },

    // Admin Routes
    {
        path: '/admin/dashboard',
        component: Dashboard,
        layout: AdminLayout,
        requiresAuth: true,
        allowedRoles: ['admin'],
    },
    {
        path: '/admin/users',
        component: UserManagement,
        layout: AdminLayout,
        requiresAuth: true,
        allowedRoles: ['admin'],
    },
    {
        path: '/403',
        component: Forbidden,
        layout: null, // Full screen
        requiresAuth: false,
    },
];

export default publicRoutes;
