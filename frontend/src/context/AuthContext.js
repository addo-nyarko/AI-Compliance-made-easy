import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';
import { authStorage } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = authStorage.getToken();
            const storedUser = authStorage.getUser();
            
            if (token && storedUser) {
                try {
                    // Verify token is still valid
                    const userData = await authAPI.me();
                    setUser(userData);
                    authStorage.setUser(userData);
                } catch (err) {
                    // Token invalid, clear auth
                    authStorage.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        
        checkAuth();
    }, []);
    
    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const response = await authAPI.login(email, password);
            authStorage.setToken(response.token);
            authStorage.setUser(response.user);
            setUser(response.user);
            return response;
        } catch (err) {
            const message = err.response?.data?.detail || 'Login failed';
            setError(message);
            throw new Error(message);
        }
    }, []);
    
    const register = useCallback(async (email, password) => {
        setError(null);
        try {
            const response = await authAPI.register(email, password);
            authStorage.setToken(response.token);
            authStorage.setUser(response.user);
            setUser(response.user);
            return response;
        } catch (err) {
            const message = err.response?.data?.detail || 'Registration failed';
            setError(message);
            throw new Error(message);
        }
    }, []);
    
    const logout = useCallback(() => {
        authStorage.clear();
        setUser(null);
        setError(null);
    }, []);
    
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
