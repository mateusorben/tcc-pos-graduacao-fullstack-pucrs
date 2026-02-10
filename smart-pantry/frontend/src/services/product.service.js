import api from './api';

export const ProductService = {
    getAll: async (filter) => {
        const response = await api.get('/products', { params: { filter } });
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    updateQuantity: async (id, quantity) => {
        const response = await api.patch(`/products/${id}/quantity`, { quantity });
        return response.data;
    },

    getBatches: async (id) => {
        const response = await api.get(`/products/${id}/batches`);
        return response.data;
    },

    addBatch: async (id, batchData) => {
        const response = await api.post(`/products/${id}/batches`, batchData);
        return response.data;
    },

    updateBatch: async (id, batchId, quantity) => {
        const response = await api.put(`/products/${id}/batches/${batchId}`, { quantity });
        return response.data;
    },

    deleteBatch: async (id, batchId) => {
        const response = await api.delete(`/products/${id}/batches/${batchId}`);
        return response.data;
    },

    getShoppingList: async () => {
        const response = await api.get('/shopping-list');
        return response.data;
    }
};
