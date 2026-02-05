const db = require('./src/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'src', 'migration_categories.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executando migração de Categorias...');
        await db.query(sql);
        console.log('Migração concluída com sucesso!');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        // Force exit as pool might keep open
        process.exit();
    }
}

runMigration();
