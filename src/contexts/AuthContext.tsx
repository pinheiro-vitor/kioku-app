import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
    id: number | string;
    name: string;
    email: string;
    avatarUrl?: string;
    profile?: { avatar_url?: string };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            const userData = response.data;
            const mappedUser = {
                ...userData,
                avatarUrl: userData.profile?.avatar_url
            };
            setUser(mappedUser);
        } catch (error) {
            console.error('Failed to fetch user', error);
            // If 401, clear token
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            // Set default header just in case, though interceptor does it
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        const mappedUser = {
            ...newUser,
            avatarUrl: newUser.profile?.avatar_url || newUser.avatarUrl
        };
        setUser(mappedUser);
    };

    const register = async (data: any) => {
        const response = await api.post('/register', data);
        login(response.data.access_token, response.data.user);
    };

    const logout = async () => {
        try {
            if (token) await api.post('/logout');
        } catch (e) {
            console.error('Logout error', e);
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data: Partial<User> & { password?: string }) => {
        const response = await api.put('/user', data);
        const userData = response.data.user;
        const mappedUser = {
            ...userData,
            avatarUrl: userData.profile?.avatar_url
        };
        setUser(mappedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
