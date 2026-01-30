const express = require('express');
const router = express.Router();
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./auth');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

        const user = userResult.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

        delete user.password;

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
});

router.get('/products', authMiddleware, async (req, res) => {
    try {
        const query = 'SELECT * FROM products WHERE user_id = $1 ORDER BY expiry_date ASC';
        const result = await db.query(query, [req.userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar seus produtos.' });
    }
});

router.post('/products', authMiddleware, async (req, res) => {
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
});

router.delete('/products/:id', authMiddleware, async (req, res) => {
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
});

router.patch('/products/:id/quantity', authMiddleware, async (req, res) => {
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
});

router.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at;
        `;
        const values = [name, email, hashedPassword];
        const result = await db.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao criar usuário.' });
    }
});

router.put('/products/:id', authMiddleware, async (req, res) => {
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
});

router.put('/users', authMiddleware, async (req, res) => {
    const { name, password } = req.body;
    const userId = req.userId;

    if (!name && !password) {
        return res.status(400).json({ error: 'Informe ao menos um campo para atualizar (nome ou senha).' });
    }

    try {
        let query;
        let values;

        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query = 'UPDATE users SET name = COALESCE($1, name), password = $2 WHERE id = $3 RETURNING id, name, email';
            values = [name || null, hashedPassword, userId];
        } else {
            query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email';
            values = [name, userId];
        }

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json({
            message: 'Informações atualizadas com sucesso!',
            user: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
    }
});

module.exports = router;