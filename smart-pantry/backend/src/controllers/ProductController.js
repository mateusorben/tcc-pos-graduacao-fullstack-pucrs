const db = require('../database');

exports.getProducts = async (req, res) => {
    try {
        const query = 'SELECT * FROM products WHERE user_id = $1 ORDER BY expiry_date ASC';
        const result = await db.query(query, [req.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar seus produtos.' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, obs, quantity, min_quantity, expiry_date, category_id } = req.body;
    const userId = req.userId;

    if (!name || !expiry_date || !userId) {
        return res.status(400).json({ error: 'Nome, validade e ID do usuário são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO products (name, obs, quantity, min_quantity, expiry_date, category_id, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [name, obs, quantity || 1, min_quantity || 0, expiry_date, category_id, userId];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar o produto no banco de dados.' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, obs, quantity, min_quantity, expiry_date, category_id } = req.body;
        const userId = req.userId;

        const query = `
            UPDATE products 
            SET name = $1, obs = $2, quantity = $3, min_quantity = $4, expiry_date = $5, category_id = $6
            WHERE id = $7 AND user_id = $8
            RETURNING *;
        `;
        const values = [name, obs, quantity, min_quantity || 0, expiry_date, category_id, id, userId];
        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await db.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
        }
        res.json({ message: 'Produto removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.userId;

        const result = await db.query(
            'UPDATE products SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar quantidade.' });
    }
};

exports.getShoppingList = async (req, res) => {
    try {
        const userId = req.userId;
        const query = `
            SELECT * FROM products 
            WHERE user_id = $1 
            AND (expiry_date < NOW() OR quantity <= min_quantity)
            ORDER BY name ASC
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar lista de compras.' });
    }
};
