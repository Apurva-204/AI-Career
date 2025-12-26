import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Courses from './pages/Courses';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();

    console.log("PrivateRoute Check:", { loading, isAuthenticated, role: user?.role, allowed: allowedRoles });

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect based on role if unauthorized for this route
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/assessment" element={<PrivateRoute allowedRoles={['user']}><Assessment /></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute allowedRoles={['user']}><Dashboard /></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
