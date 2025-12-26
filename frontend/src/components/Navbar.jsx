import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function NotificationBell({ token }) {
    const [alerts, setAlerts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Close if clicked outside
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (!token) return;
        axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` } // useAuth context might be safer or pass token prop
        }).then(res => {
            setAlerts(res.data);
            if (res.data.length > 0) setHasUnread(true);
        }).catch(err => console.log('Alert fetch error', err));
    }, [token]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); setHasUnread(false); }}
                className="relative p-2 text-gray-400 hover:text-white transition"
            >
                <Bell className="w-5 h-5" />
                {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="p-3 border-b border-white/5 font-bold text-gray-300">Smart Alerts</div>
                        <div className="max-h-64 overflow-y-auto">
                            {alerts.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No new alerts</div>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert.id} className="p-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 cursor-default">
                                        <div className={`text-sm font-bold mb-1 ${alert.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>
                                            {alert.title}
                                        </div>
                                        <div className="text-xs text-gray-400">{alert.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-nav px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        AI
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        Career<span className="text-cyan-400">AI</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
                    <Link to="/courses" className="hover:text-cyan-400 transition">Courses</Link>
                    {user?.role !== 'admin' && (
                        <Link to="/assessment" className="hover:text-cyan-400 transition">Career Test</Link>
                    )}
                    <a href="/#features" className="hover:text-cyan-400 transition">Features</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Dashboard Icon - Hide for Admins */}
                            {user.role !== 'admin' && (
                                <Link to="/dashboard" className="p-2 text-gray-400 hover:text-white transition" title="Dashboard">
                                    <LayoutDashboard className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Smart Alerts Bell */}
                            <NotificationBell token={user.token} />

                            <span className="text-sm text-gray-400">Hi, {user.name}</span>
                            {user.role === 'admin' && (
                                <Link to="/admin">
                                    <Button variant="primary" className="!py-1 !px-4 text-xs">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Button variant="secondary" onClick={logout} className="!py-1 !px-4 text-xs">
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium hover:text-white transition hidden md:block">
                                Sign In
                            </Link>
                            <Link to="/assessment">
                                <Button variant="primary">Start Free Test</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
