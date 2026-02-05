import api from './api';

export const AuthService = {
    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/users', userData);
        return response.data;
    },

    getVapidKey: async () => {
        const response = await api.get('/vapid-public-key');
        return response.data;
    },

    subscribe: async (subscription) => {
        const response = await api.post('/subscribe', subscription);
        return response.data;
    }
};
