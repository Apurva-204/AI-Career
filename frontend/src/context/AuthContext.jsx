import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Initialize state from localStorage ensures persistence on refresh
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('authUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); // START AS TRUE to prevent premature redirects

    // Initial Auth Check
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    // Refresh user data from backend to ensure role is up-to-date
                    const res = await axios.get('http://localhost:5000/api/user/profile', {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });

                    if (res.data && res.data.id) {
                        setUser(res.data);
                        localStorage.setItem('authUser', JSON.stringify(res.data)); // Sync local storage
                        setToken(storedToken);
                        console.log("AuthContext: Session validated & User refreshed:", res.data.role);
                    } else {
                        throw new Error("User not found in DB");
                    }
                } catch (err) {
                    console.error("AuthContext: Session invalid", err);
                    logout(); // Token expired or invalid -> Clear everything
                }
            } else {
                console.log("AuthContext: No session found");
                setLoading(false);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const isAuthenticated = !!token;

    const login = async (data) => {
        try {
            console.log("Attempting Login...", data);
            let endpoint;
            if (data.provider === 'manual') endpoint = 'http://localhost:5000/api/auth/login';
            else if (data.provider === 'signup') endpoint = 'http://localhost:5000/api/auth/signup';
            else endpoint = 'http://localhost:5000/api/auth/google';

            const res = await axios.post(endpoint, data);
            const { token: newToken, user: newUser } = res.data;

            if (!newToken || !newUser) {
                console.error("Invalid response from server", res.data);
                return false;
            }

            console.log("Login Success! Storing data...");
            // 2. STORE AUTH DATA
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(newUser));

            // 3. UPDATE AUTH STATE IMMEDIATELY
            setToken(newToken);
            setUser(newUser);

            console.log("AuthContext: State updated. Token:", !!newToken, "User:", newUser?.email);
            return { success: true, user: newUser };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const logout = () => {
        console.log("Logging out...");
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };



    return (
        <AuthContext.Provider value={{ user, login, logout, token, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
