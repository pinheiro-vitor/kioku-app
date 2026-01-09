import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    // withCredentials: true, // Removed to avoid CORS issues with default Laravel config
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Optional: Redirect to login or trigger a global event
            // window.location.href = '/login'; 
            // For now, removing the token is enough for AuthContext to eventually pick up, 
            // but without a window reload or context update, the UI might stay stale until next action.
            // A safer bet is to simply let the error propagate, but we should ensure the UI handles it.
            // Better yet:
            if (typeof window !== 'undefined') {
                window.location.href = '/'; // Hard reload to home/login
            }
        }
        return Promise.reject(error);
    }
);

export default api;
