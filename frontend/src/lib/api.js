import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // Optionally redirect to login
            if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (email, password) => {
        const response = await api.post('/auth/register', { email, password });
        return response.data;
    },
    
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    
    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Projects API
export const projectsAPI = {
    list: async (params = {}) => {
        const response = await api.get('/projects', { params });
        return response.data;
    },
    
    get: async (id) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/projects', data);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },
};

// Assessments API
export const assessmentsAPI = {
    create: async (data) => {
        const response = await api.post('/assessments', data);
        return response.data;
    },
    
    get: async (id) => {
        const response = await api.get(`/assessments/${id}`);
        return response.data;
    },
    
    listByProject: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/assessments`);
        return response.data;
    },
    
    duplicate: async (id) => {
        const response = await api.post(`/assessments/${id}/duplicate`);
        return response.data;
    },
};

// Classification API
export const classifyAPI = {
    classify: async (answers) => {
        const response = await api.post('/classify', { answers_json: answers });
        return response.data;
    },
    
    getQuestions: async () => {
        const response = await api.get('/questions');
        return response.data;
    },
};

// Settings API
export const settingsAPI = {
    get: async () => {
        const response = await api.get('/settings');
        return response.data;
    },
    
    update: async (data) => {
        const response = await api.put('/settings', data);
        return response.data;
    },
};

// Estimator API
export const estimatorAPI = {
    calculate: async (data) => {
        const response = await api.post('/estimate', data);
        return response.data;
    },
};

// Export API
export const exportAPI = {
    get: async (assessmentId) => {
        const response = await api.get(`/export/${assessmentId}`);
        return response.data;
    },
};

export default api;
