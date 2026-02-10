const db = require('../database');
const AppError = require('../utils/AppError');

class StorageLocationService {
    async getAll(userId) {
        const result = await db.query(
            'SELECT * FROM storage_locations WHERE user_id = $1 ORDER BY name ASC',
            [userId]
        );
        return result.rows;
    }

    async getOne(userId, id) {
        const result = await db.query(
            'SELECT * FROM storage_locations WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        if (result.rowCount === 0) throw new AppError('Local não encontrado.', 404);
        return result.rows[0];
    }

    async create(userId, data) {
        const { name, description } = data;
        if (!name) throw new AppError('Nome é obrigatório.');

        const result = await db.query(
            'INSERT INTO storage_locations (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, description]
        );
        return result.rows[0];
    }

    async update(userId, id, data) {
        const { name, description } = data;

        const result = await db.query(
            'UPDATE storage_locations SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [name, description, id, userId]
        );

        if (result.rowCount === 0) throw new AppError('Local não encontrado.', 404);
        return result.rows[0];
    }

    async delete(userId, id) {
        // Check if products use this location
        const check = await db.query(
            'SELECT id FROM products WHERE storage_location_id = $1 AND user_id = $2 LIMIT 1',
            [id, userId]
        );

        if (check.rowCount > 0) {
            throw new AppError('Não é possível excluir local com produtos vinculados.', 400);
        }

        const result = await db.query(
            'DELETE FROM storage_locations WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) throw new AppError('Local não encontrado.', 404);
        return { message: 'Local removido com sucesso!' };
    }
}

module.exports = new StorageLocationService();
