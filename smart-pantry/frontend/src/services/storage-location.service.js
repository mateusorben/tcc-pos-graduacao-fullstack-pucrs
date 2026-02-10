import api from './api';

export const StorageLocationService = {
    getAll: async () => {
        const response = await api.get('/storage-locations');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/storage-locations', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/storage-locations/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/storage-locations/${id}`);
        return response.data;
    }
};
