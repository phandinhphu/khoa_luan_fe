import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RouteGuard from './RouteGuard';
import publicRoutes from './publicRoutes';
import { Fragment } from 'react';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Layout = route.layout === null ? Fragment : route.layout;
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <RouteGuard requiresAuth={route.requiresAuth} allowedRoles={route.allowedRoles}>
                                    <Layout>
                                        <route.component />
                                    </Layout>
                                </RouteGuard>
                            }
                        />
                    );
                })}
            </Routes>
        </Router>
    );
};

export default AppRoutes;