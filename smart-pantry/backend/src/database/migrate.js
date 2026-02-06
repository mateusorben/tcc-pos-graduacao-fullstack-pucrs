const db = require('../database');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
    console.log('🚀 Iniciando processo de migração...');

    const client = await db.getPool().connect();

    try {
        await client.query('BEGIN');

        // 1. Garante que a tabela de controle de migrations existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Lê os arquivos da pasta
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Garante ordem alfabética (001, 002...)

        // 3. Verifica quais já foram executadas
        const executedMigrationsResult = await client.query('SELECT name FROM migrations');
        const executedMigrations = new Set(executedMigrationsResult.rows.map(r => r.name));

        // 4. Executa as pendentes
        for (const file of files) {
            if (!executedMigrations.has(file)) {
                console.log(`Executing migration: ${file}`);
                const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

                await client.query(sql);
                await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);

                console.log(`✅ ${file} completed.`);
            } else {
                // console.log(`Skipping ${file} (already executed).`);
            }
        }

        await client.query('COMMIT');
        console.log('🏁 Todas as migrações concluídas com sucesso!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erro fatal na migração. Rollback executado.', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0); // Encerra o processo
    }
}

migrate();
