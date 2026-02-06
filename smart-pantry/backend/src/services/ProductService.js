const db = require('../database');
const AppError = require('../utils/AppError');

class ProductService {
    async getAll(userId) {
        const query = 'SELECT * FROM products WHERE user_id = $1 ORDER BY expiry_date ASC';
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    async create(userId, data) {
        const { name, obs, quantity, min_quantity, expiry_date, category_id } = data;

        // Basic validation (Service Layer)
        if (!name || !expiry_date) {
            throw new AppError('Nome e validade são obrigatórios.');
        }

        const query = `
      INSERT INTO products (name, obs, quantity, min_quantity, expiry_date, category_id, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [name, obs, quantity || 1, min_quantity || 0, expiry_date, category_id, userId];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async update(userId, id, data) {
        // Check ownership handled by query condition user_id = $8
        const { name, obs, quantity, min_quantity, expiry_date, category_id } = data;

        const query = `
      UPDATE products 
      SET name = $1, obs = $2, quantity = $3, min_quantity = $4, expiry_date = $5, category_id = $6
      WHERE id = $7 AND user_id = $8
      RETURNING *;
    `;
        const values = [name, obs, quantity, min_quantity || 0, expiry_date, category_id, id, userId];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            throw new AppError('Produto não encontrado ou sem permissão.', 404);
        }
        return result.rows[0];
    }

    async delete(userId, id) {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError('Produto não encontrado ou sem permissão.', 404);
        }
        return { message: 'Produto removido com sucesso!' };
    }

    async updateQuantity(userId, id, quantity) {
        const result = await db.query(
            'UPDATE products SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError('Produto não encontrado.', 404);
        }
        return result.rows[0];
    }

    async getShoppingList(userId) {
        const query = `
      SELECT * FROM products 
      WHERE user_id = $1 
      AND (expiry_date < NOW() OR quantity <= min_quantity)
      ORDER BY name ASC
    `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = new ProductService();
