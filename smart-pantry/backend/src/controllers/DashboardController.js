const db = require('../database');

exports.getStats = async (req, res) => {
    const userId = req.userId;

    try {
        // 1. Total Products
        const totalResult = await db.query('SELECT COUNT(*) FROM products WHERE user_id = $1', [userId]);
        const totalProducts = parseInt(totalResult.rows[0].count);

        // 2. Products by Category
        const categoryResult = await db.query(`
            SELECT c.name, COUNT(p.id) as count 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = $1 
            GROUP BY c.name
        `, [userId]);

        const byCategory = categoryResult.rows.map(row => ({
            name: row.name || 'Outros',
            count: parseInt(row.count)
        }));

        // 3. Expiring Soon (7 days)
        const expiringResult = await db.query(`
            SELECT COUNT(*) FROM products 
            WHERE user_id = $1 
            AND expiry_date >= CURRENT_DATE 
            AND expiry_date <= (CURRENT_DATE + INTERVAL '7 days')
        `, [userId]);
        const expiringCount = parseInt(expiringResult.rows[0].count);

        // 4. Shopping List Count
        const listResult = await db.query(`
            SELECT COUNT(*) FROM products 
            WHERE user_id = $1 
            AND (expiry_date < NOW() OR quantity <= min_quantity)
        `, [userId]);
        const listCount = parseInt(listResult.rows[0].count);

        // 5. Expired Count (Already gone)
        const expiredResult = await db.query(`
            SELECT COUNT(*) FROM products 
            WHERE user_id = $1 
            AND expiry_date < CURRENT_DATE
        `, [userId]);
        const expiredCount = parseInt(expiredResult.rows[0].count);

        res.json({
            totalProducts,
            byCategory,
            expiringCount,
            listCount,
            expiredCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
    }
};
