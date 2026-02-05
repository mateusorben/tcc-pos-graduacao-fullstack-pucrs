import api from './api';

export const ProductService = {
    getAll: async () => {
        const response = await api.get('/products');
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

    getShoppingList: async () => {
        const response = await api.get('/shopping-list');
        return response.data;
    }
};
