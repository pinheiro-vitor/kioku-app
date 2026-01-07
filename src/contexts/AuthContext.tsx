import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Adpating legacy User interface to avoid breaking changes everywhere immediately
// but ideally we should update the app to use Supabase types directly.
interface User {
    id: string | number; // Allowing string for UUID
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                mapSupabaseUser(session.user, session.access_token);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                mapSupabaseUser(session.user, session.access_token);
            } else {
                setUser(null);
                setToken(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUser = (sbUser: SupabaseUser, accessToken: string) => {
        const mappedUser: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Usuário',
        };
        setUser(mappedUser);
        setToken(accessToken);
        setIsLoading(false);
    };

    // Legacy login - now mostly no-op or just state update if needed manually
    // But mostly we expect login via supabase.auth.signIn*
    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
    };

    const updateProfile = async (data: Partial<User> & { password?: string }) => {
        // Basic profile update mapping
        const updates: any = {};
        if (data.name) updates.data = { name: data.name };
        if (data.email) updates.email = data.email;
        if (data.password) updates.password = data.password;

        const { data: { user: updatedUser }, error } = await supabase.auth.updateUser(updates);

        if (error) throw error;
        if (updatedUser) {
            // State update happens via onAuthStateChange automatically usually, 
            // but we can force it if needed.
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading, updateProfile }}>
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
