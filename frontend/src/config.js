/**
 * Centralized Application Configuration
 * 
 * This file serves as the single source of truth for all application-wide settings.
 * Environment variables are read from .env file using REACT_APP_ prefix.
 */

// API Configuration
export const API_CONFIG = {
    // Backend API URL - defaults to production, can be overridden by REACT_APP_BACKEND_URL env var
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://ai-compliance-made-easy.onrender.com',
    
    // Derive API_BASE from BACKEND_URL
    get API_BASE() {
        return `${this.BACKEND_URL}/api`;
    },
};

// Application Settings
export const APP_CONFIG = {
    APP_NAME: 'AI Compliance Made Easy',
    ENABLE_HEALTH_CHECK: process.env.REACT_APP_ENABLE_HEALTH_CHECK === 'true',
};

// Export convenience variables
export const BACKEND_URL = API_CONFIG.BACKEND_URL;
export const API_BASE = API_CONFIG.API_BASE;

export default {
    API_CONFIG,
    APP_CONFIG,
    BACKEND_URL,
    API_BASE,
};
