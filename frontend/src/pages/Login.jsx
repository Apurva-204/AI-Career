import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('signin');

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                console.log("Google Auth Success, calling backend...", tokenResponse);
                const success = await login({
                    token: tokenResponse.access_token,
                    provider: 'google'
                });

                console.log("Backend Login Result:", success);
                if (success) {
                    console.log("Redirecting to Dashboard...");
                    // 4. REDIRECT AFTER LOGIN
                    navigate('/dashboard', { replace: true });
                }
            } catch (err) {
                console.error('Login Failed', err);
                alert('Login Failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.error('Login Failed');
            setLoading(false);
        }
    });

    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center p-4">
            <Navbar />

            <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[50px] -z-10" />

                <h2 className="text-3xl font-bold text-center mb-8">Welcome to <span className="text-cyan-400">CareerAI</span></h2>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-lg p-1 mb-8">
                    <button
                        onClick={() => setActiveTab('signin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'signin' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'signup' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Google Button */}
                {/* Google Button */}
                <button
                    onClick={() => handleGoogleLogin()}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors mb-6"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    {loading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-glass-border"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-wider">Or continue with email</span>
                    <div className="flex-grow border-t border-glass-border"></div>
                </div>

                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);

                    const formData = {
                        email: e.target.email.value,
                        password: e.target.password.value,
                        provider: 'manual'
                    };

                    if (activeTab === 'signup') {
                        formData.name = e.target.name.value;
                        const phone = e.target.phone.value;

                        // Validation
                        if (phone.length < 10) {
                            alert('Phone number must be at least 10 digits');
                            setLoading(false);
                            return;
                        }

                        formData.phone = phone;
                    }

                    try {
                        let success;
                        // Updated to use the correct provider for signup
                        const result = await login({
                            ...formData,
                            provider: activeTab === 'signup' ? 'signup' : 'manual'
                        });

                        success = result.success;

                        if (success) {
                            const role = result.user?.role;
                            console.log("Login Successful. Role:", role);

                            if (role === 'admin') {
                                navigate('/admin', { replace: true });
                            } else {
                                navigate('/dashboard', { replace: true });
                            }
                        } else {
                            alert(result.error || (activeTab === 'signup' ? 'Signup Failed' : 'Invalid Credentials'));
                        }
                    } catch (err) {
                        alert('Authentication Failed');
                    } finally {
                        setLoading(false);
                    }
                }}>
                    {activeTab === 'signup' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                    placeholder="John Doe"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                    placeholder="+1 234 567 8900"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '');
                                    }}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input name="email" type="email" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input name="password" type="password" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition" placeholder="••••••••" />
                    </div>

                    <Button variant="primary" className="w-full justify-center mt-2" type="submit" disabled={loading}>
                        {activeTab === 'signin' ? 'Sign In →' : 'Create Account →'}
                    </Button>
                </form>

            </div>
        </div>
    );
}
