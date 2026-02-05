const db = require('../database');

exports.getCategories = async (req, res) => {
    try {
        const userId = req.userId;
        // Select system defaults (user_id IS NULL) + user's own categories
        const query = `
            SELECT * FROM categories 
            WHERE user_id IS NULL OR user_id = $1 
            ORDER BY name ASC
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }

    try {
        const query = `
            INSERT INTO categories (name, user_id) 
            VALUES ($1, $2) 
            RETURNING *
        `;
        const result = await db.query(query, [name, userId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
};
