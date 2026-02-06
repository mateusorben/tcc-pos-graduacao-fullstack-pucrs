const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

class UserService {
    async register(data) {
        const { name, email, password } = data;

        if (!email || !password) {
            throw new AppError('E-mail e senha são obrigatórios.');
        }

        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            throw new AppError('Este e-mail já está cadastrado.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `;
        const result = await db.query(query, [name, email, hashedPassword]);
        return result.rows[0];
    }

    async login(email, password) {
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);
        if (!email || !password) {
            throw new AppError('E-mail e senha são obrigatórios.');
        }

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            throw new AppError('E-mail ou senha inválidos.', 401);
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new AppError('E-mail ou senha inválidos.', 401);
        }

        delete user.password;

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            message: 'Login realizado com sucesso!',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        };
    }

    async updateProfile(userId, { name, password }) {
        if (!name && !password) {
            throw new AppError('Informe ao menos um campo para atualizar (nome ou senha).');
        }

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
            throw new AppError('Usuário não encontrado.', 404);
        }

        return result.rows[0];
    }

    async subscribe(userId, subscription) {
        await db.query(
            `INSERT INTO subscriptions (user_id, endpoint, keys) 
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) DO NOTHING`,
            [userId, subscription.endpoint, JSON.stringify(subscription.keys)]
        );
    }

    getVapidKey() {
        return { publicKey: process.env.VAPID_PUBLIC_KEY };
    }
}

module.exports = new UserService();
