
const cron = require('node-cron');
const webpush = require('web-push');
const db = require('./database');

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:admin@smartpantry.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

async function checkExpiringProducts() {
    console.log('Running daily expiry check...');
    try {
        // Find products expiring in 3 days, 1 day, or Today
        const query = `
            SELECT p.id, p.name, p.expiry_date, u.id as user_id,
            (p.expiry_date::date - CURRENT_DATE) as days_left
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.expiry_date::date IN (
                (CURRENT_DATE + INTERVAL '3 days')::date,
                (CURRENT_DATE + INTERVAL '1 day')::date,
                CURRENT_DATE
            )
        `;

        const { rows: products } = await db.query(query);
        console.log(`Encontrados ${products.length} produtos para notificar.`);

        for (const product of products) {
            // Get user subscriptions
            const { rows: subscriptions } = await db.query(
                'SELECT * FROM subscriptions WHERE user_id = $1',
                [product.user_id]
            );

            let title = 'Alerta de Validade! 🚨';
            let body = '';

            const days = parseInt(product.days_left);

            if (days === 3) body = `O produto "${product.name}" vence em 3 dias.`;
            else if (days === 1) body = `Urgente: "${product.name}" vence amanhã!`;
            else if (days === 0) body = `Atenção: "${product.name}" vence hoje!`;
            else body = `O produto "${product.name}" está vencendo.`;

            const payload = JSON.stringify({
                title,
                body,
                icon: '/vite.svg'
            });

            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: sub.keys
                    }, payload);
                } catch (err) {
                    // console.error('Error sending push:', err); // Silent error for testing
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await db.query('DELETE FROM subscriptions WHERE id = $1', [sub.id]);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Scheduler error:', err);
    }
}

// Run every day at 09:00 AM
cron.schedule('0 9 * * *', checkExpiringProducts);
// Run on startup for dev/test purposes (optional)
setTimeout(checkExpiringProducts, 5000);

module.exports = { checkExpiringProducts };
