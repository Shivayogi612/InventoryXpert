
import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_KEY = process.env.VITE_FAST2SMS_API_KEY || '1uRezSg6ZQFlWpM7GULxbKf2cB3kNrT0D8OAJntaHyCjXVPdIm1iJfe3V6cUzEBYn7hLa9qmZQ0tRkuS';
const PHONE = process.env.VITE_OWNER_PHONE_NUMBER || '8970145125';

async function sendSMS() {
  console.log('Testing SMS Service...');
  console.log('API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Missing');
  console.log('Phone:', PHONE);

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        route: 'q',
        message: 'This is a test message from Smart Inventory Manager.',
        language: 'english',
        flash: 0,
        numbers: PHONE.replace('+', '').trim()
      })
    });

    const result = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', result);

    if (result.return) {
      console.log('✅ SMS Sent Successfully');
    } else {
      console.log('❌ SMS Failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendSMS();