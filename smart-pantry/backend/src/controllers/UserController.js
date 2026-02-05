const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

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
};

exports.updateProfile = async (req, res) => {
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
};

exports.subscribe = async (req, res) => {
    const subscription = req.body;
    const userId = req.userId;

    try {
        await db.query(
            `INSERT INTO subscriptions (user_id, endpoint, keys) 
             VALUES ($1, $2, $3)
             ON CONFLICT (endpoint) DO NOTHING`,
            [userId, subscription.endpoint, JSON.stringify(subscription.keys)]
        );
        res.status(201).json({});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao salvar inscrição" });
    }
};

exports.getVapidKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};
