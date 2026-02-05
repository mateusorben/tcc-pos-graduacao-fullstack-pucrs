import { ProductService } from '../services/product.service';

export const ShoppingListService = {
    // Reusing ProductService internal logic if it's strictly about products
    getSuggested: async () => {
        return await ProductService.getShoppingList();
    }
};
