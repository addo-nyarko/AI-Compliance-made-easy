/**
 * Storage Abstraction Layer
 * Provides local-first storage with optional sync to backend.
 * Can be swapped between localStorage, IndexedDB, or API-backed storage.
 */

const STORAGE_PREFIX = 'aiac_';

// Storage mode: 'local' or 'hybrid' (local + API sync when authenticated)
const STORAGE_MODE = 'hybrid';

// Local storage helpers
const localStore = {
    get: (key) => {
        try {
            const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(STORAGE_PREFIX))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Draft storage for scan wizard
export const draftStorage = {
    DRAFT_KEY: 'scan_draft',
    
    saveDraft: (answers, step) => {
        const draft = {
            answers,
            step,
            updatedAt: new Date().toISOString()
        };
        return localStore.set(draftStorage.DRAFT_KEY, draft);
    },
    
    getDraft: () => {
        return localStore.get(draftStorage.DRAFT_KEY);
    },
    
    clearDraft: () => {
        return localStore.remove(draftStorage.DRAFT_KEY);
    },
    
    hasDraft: () => {
        const draft = localStore.get(draftStorage.DRAFT_KEY);
        return draft && Object.keys(draft.answers || {}).length > 0;
    }
};

// Settings storage (local cache + API sync)
export const settingsStorage = {
    SETTINGS_KEY: 'user_settings',
    
    getLocal: () => {
        return localStore.get(settingsStorage.SETTINGS_KEY);
    },
    
    setLocal: (settings) => {
        return localStore.set(settingsStorage.SETTINGS_KEY, settings);
    },
    
    clearLocal: () => {
        return localStore.remove(settingsStorage.SETTINGS_KEY);
    }
};

// Auth storage
export const authStorage = {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user',
    
    getToken: () => {
        return localStorage.getItem('auth_token');
    },
    
    setToken: (token) => {
        localStorage.setItem('auth_token', token);
    },
    
    getUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },
    
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    clear: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    }
};

// Recent assessments cache
export const recentStorage = {
    RECENT_KEY: 'recent_assessments',
    MAX_RECENT: 10,
    
    addRecent: (assessment) => {
        const recent = localStore.get(recentStorage.RECENT_KEY) || [];
        const filtered = recent.filter(a => a.id !== assessment.id);
        const updated = [
            { 
                id: assessment.id, 
                projectId: assessment.project_id,
                bucket: assessment.classification_json?.bucket,
                viewedAt: new Date().toISOString() 
            },
            ...filtered
        ].slice(0, recentStorage.MAX_RECENT);
        return localStore.set(recentStorage.RECENT_KEY, updated);
    },
    
    getRecent: () => {
        return localStore.get(recentStorage.RECENT_KEY) || [];
    },
    
    clearRecent: () => {
        return localStore.remove(recentStorage.RECENT_KEY);
    }
};

export default {
    local: localStore,
    draft: draftStorage,
    settings: settingsStorage,
    auth: authStorage,
    recent: recentStorage,
    mode: STORAGE_MODE
};
