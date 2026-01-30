
require('dotenv').config();
const db = require('./src/database');
const fs = require('fs');
const webpush = require('web-push');

async function setup() {
    try {
        console.log("Running migration...");
        const sql = fs.readFileSync('./src/migration_subscriptions.sql', 'utf8');
        await db.query(sql);
        console.log("Migration successful!");

        console.log("Generating VAPID Keys...");
        const vapidKeys = webpush.generateVAPIDKeys();

        const envPath = '.env';
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        if (!envContent.includes('VAPID_PUBLIC_KEY')) {
            envContent += `\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}`;
            envContent += `\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}`;
            envContent += `\nVAPID_EMAIL=mailto:admin@smartpantry.com`;
            fs.writeFileSync(envPath, envContent);
            console.log("Keys added to .env");
        } else {
            console.log("Keys already exist in .env");
        }

    } catch (err) {
        console.error("Setup failed:", err);
    } finally {
        process.exit();
    }
}

setup();
