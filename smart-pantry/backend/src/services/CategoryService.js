const db = require('../database');
const AppError = require('../utils/AppError');

class CategoryService {
    async getAll(userId) {
        const query = `
      SELECT * FROM categories 
      WHERE user_id IS NULL OR user_id = $1 
      ORDER BY name ASC
    `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    async create(userId, name) {
        if (!name) {
            throw new AppError('Nome da categoria é obrigatório.');
        }

        const query = `
      INSERT INTO categories (name, user_id) 
      VALUES ($1, $2) 
      RETURNING *
    `;
        const result = await db.query(query, [name, userId]);
        return result.rows[0];
    }
}

module.exports = new CategoryService();
