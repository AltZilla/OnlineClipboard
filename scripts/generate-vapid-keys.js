// Script to generate VAPID keys for push notifications
// Run with: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n===========================================');
console.log('   VAPID Keys for Push Notifications');
console.log('===========================================\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n===========================================\n');
console.log('Note: NEXT_PUBLIC_VAPID_PUBLIC_KEY is exposed to the client.');
console.log('VAPID_PRIVATE_KEY must be kept secret on the server.\n');
