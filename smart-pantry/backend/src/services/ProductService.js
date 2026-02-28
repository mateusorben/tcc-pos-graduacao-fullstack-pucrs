const db = require('../database');
const AppError = require('../utils/AppError');

class ProductService {
    async getAll(userId, filter) {
        let query = `
            SELECT p.*, s.name as storage_location_name 
            FROM products p
            LEFT JOIN storage_locations s ON p.storage_location_id = s.id
            WHERE p.user_id = $1
        `;

        if (filter === 'expired') {
            query += ' AND p.expiry_date < CURRENT_DATE';
        } else if (filter === 'expiring') {
            query += " AND p.expiry_date >= CURRENT_DATE AND p.expiry_date <= (CURRENT_DATE + INTERVAL '7 days')";
        }

        query += ' ORDER BY p.expiry_date ASC';

        const result = await db.query(query, [userId]);
        return result.rows;
    }

    async getBatches(userId, productId) {

        const check = await db.query('SELECT id FROM products WHERE id = $1 AND user_id = $2', [productId, userId]);
        if (check.rowCount === 0) throw new AppError('Produto não encontrado.', 404);

        const result = await db.query('SELECT * FROM batches WHERE product_id = $1 ORDER BY expiry_date ASC', [productId]);
        return result.rows;
    }

    async create(userId, data) {
        const { name, obs, quantity, min_quantity, expiry_date, category_id, storage_location_id } = data;

        if (!name || !expiry_date) {
            throw new AppError('Nome e validade são obrigatórios.');
        }

        const client = await db.getPool().connect();
        try {
            await client.query('BEGIN');

            console.log('Creating product:', name);


            const prodRes = await client.query(`
                INSERT INTO products (name, obs, quantity, min_quantity, expiry_date, category_id, storage_location_id, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [name, obs, quantity || 0, min_quantity || 0, expiry_date, category_id, storage_location_id, userId]);

            const productId = prodRes.rows[0].id;
            console.log('Product created with ID:', productId);


            await client.query(`
                INSERT INTO batches (product_id, quantity, expiry_date)
                VALUES ($1, $2, $3)
            `, [productId, quantity || 0, expiry_date]);

            await client.query('COMMIT');
            return prodRes.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Error creating product:', e);
            throw e;
        } finally {
            client.release();
        }
    }

    async update(userId, id, data) {

        const { name, obs, min_quantity, category_id, storage_location_id } = data;

        const result = await db.query(`
            UPDATE products 
            SET name = $1, obs = $2, min_quantity = $3, category_id = $4, storage_location_id = $5
            WHERE id = $6 AND user_id = $7
            RETURNING *
        `, [name, obs, min_quantity || 0, category_id, storage_location_id, id, userId]);

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
            throw new AppError('Produto não encontrado.', 404);
        }
        return { message: 'Produto removido com sucesso!' };
    }


    async addBatch(userId, productId, data) {
        const { quantity, expiry_date } = data;

        const check = await db.query('SELECT id FROM products WHERE id = $1 AND user_id = $2', [productId, userId]);
        if (check.rowCount === 0) throw new AppError('Produto não encontrado.', 404);

        const batchCheck = await db.query(
            'SELECT id FROM batches WHERE product_id = $1 AND expiry_date = $2::DATE',
            [productId, expiry_date]
        );

        if (batchCheck.rowCount > 0) {
            await db.query(
                'UPDATE batches SET quantity = quantity + $1 WHERE id = $2',
                [quantity, batchCheck.rows[0].id]
            );
        } else {
            await db.query(`
                INSERT INTO batches (product_id, quantity, expiry_date)
                VALUES ($1, $2, $3)
            `, [productId, quantity, expiry_date]);
        }

        // Limpeza inteligente: Se sobrou algum lote com quantidade 0 (como os lotes temporários
        // gerados pela "Adição Rápida" na lista de compras), nós apagamos para não poluir a interface.
        // Isso é seguro porque um lote de 0 não afeta o inventário.
        await db.query('DELETE FROM batches WHERE product_id = $1 AND quantity <= 0', [productId]);

        return this._updateAggregates(productId);
    }

    async deleteBatch(userId, batchId) {

        const check = await db.query(`
            SELECT b.product_id FROM batches b
            JOIN products p ON b.product_id = p.id
            WHERE b.id = $1 AND p.user_id = $2
        `, [batchId, userId]);

        if (check.rowCount === 0) throw new AppError('Lote não encontrado.', 404);

        const productId = check.rows[0].product_id;
        await db.query('DELETE FROM batches WHERE id = $1', [batchId]);

        return this._updateAggregates(productId);
    }

    async updateBatch(userId, batchId, quantity) {
        const check = await db.query(`
            SELECT b.product_id FROM batches b
            JOIN products p ON b.product_id = p.id
            WHERE b.id = $1 AND p.user_id = $2
        `, [batchId, userId]);

        if (check.rowCount === 0) throw new AppError('Lote não encontrado.', 404);

        const productId = check.rows[0].product_id;

        if (quantity <= 0) {
            await db.query('DELETE FROM batches WHERE id = $1', [batchId]);
        } else {
            await db.query('UPDATE batches SET quantity = $1 WHERE id = $2', [quantity, batchId]);
        }

        return this._updateAggregates(productId);
    }

    async updateQuantity(userId, id, newTotal) {

        const client = await db.getPool().connect();
        try {
            await client.query('BEGIN');

            // Lock product to prevent race conditions
            const prodRes = await client.query('SELECT * FROM products WHERE id = $1 AND user_id = $2 FOR UPDATE', [id, userId]);
            if (prodRes.rowCount === 0) throw new AppError('Produto não encontrado.', 404);
            const product = prodRes.rows[0];
            const currentTotal = product.quantity;
            let diff = newTotal - currentTotal;

            if (diff === 0) {
                await client.query('ROLLBACK');
                return product;
            }

            // Get batches sorted by expiry
            const batchesRes = await client.query('SELECT * FROM batches WHERE product_id = $1 ORDER BY expiry_date ASC FOR UPDATE', [id]);
            let batches = batchesRes.rows;

            if (batches.length === 0 && diff > 0) {
                // Fallback: Create new batch
                await client.query("INSERT INTO batches (product_id, quantity, expiry_date) VALUES ($1, $2, CURRENT_DATE + INTERVAL '30 days')", [id, diff]);
            } else if (diff > 0) {
                batches.sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date)); // Descending
                const targetBatch = batches[0];
                await client.query('UPDATE batches SET quantity = quantity + $1 WHERE id = $2', [diff, targetBatch.id]);
            } else {

                let remainingToDeduct = Math.abs(diff);
                // Batches already sorted ASC by expiry
                for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;

                    if (batch.quantity >= remainingToDeduct) {
                        await client.query('UPDATE batches SET quantity = quantity - $1 WHERE id = $2', [remainingToDeduct, batch.id]);
                        remainingToDeduct = 0;
                    } else {
                        await client.query('DELETE FROM batches WHERE id = $1', [batch.id]);
                        remainingToDeduct -= batch.quantity;
                    }
                }
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return this._updateAggregates(id);
    }

    async _updateAggregates(productId) {

        const res = await db.query(`
            UPDATE products p
            SET 
                quantity = (SELECT COALESCE(SUM(quantity), 0) FROM batches WHERE product_id = p.id),
                expiry_date = (SELECT MIN(expiry_date) FROM batches WHERE product_id = p.id AND quantity > 0)
            WHERE id = $1
            RETURNING *
        `, [productId]);



        return res.rows[0];
    }

    async getShoppingList(userId) {
        const query = `
            SELECT * FROM products 
            WHERE user_id = $1 
            AND (quantity <= min_quantity OR (expiry_date IS NOT NULL AND expiry_date < NOW()))
            ORDER BY name ASC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = new ProductService();
