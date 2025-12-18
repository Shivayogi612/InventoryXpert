// Simple test to send an SMS directly using Fast2SMS
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Read .env file manually to get the API key and phone number
function getEnvVars() {
  const envPath = path.resolve('.env');
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.trim() === '' || line.startsWith('#')) return;
      
      const [key, ...values] = line.split('=');
      const value = values.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
      envVars[key.trim()] = value;
    });
  }
  
  return envVars;
}

async function testSMSSend() {
  console.log('Testing direct SMS sending via Fast2SMS...\n');
  
  const envVars = getEnvVars();
  
  // Get API key and phone number
  const apiKey = envVars.VITE_FAST2SMS_API_KEY || envVars.FAST2SMS_API_KEY;
  const phoneNumber = envVars.VITE_OWNER_PHONE_NUMBER || envVars.OWNER_PHONE_NUMBER;
  
  if (!apiKey) {
    console.error('❌ Fast2SMS API key not found in .env file');
    return;
  }
  
  if (!phoneNumber) {
    console.error('❌ Phone number not found in .env file');
    return;
  }
  
  console.log('✅ Environment variables loaded');
  console.log('API Key length:', apiKey.length);
  console.log('Phone Number:', phoneNumber);
  
  try {
    // Send test SMS
    console.log('\nSending test SMS...');
    
    const message = 'Test SMS from Inventory Manager - Low stock alert simulation';
    
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber.replace('+', '').trim()
      })
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    
    if (result.return === true) {
      console.log('✅ SMS sent successfully!');
      console.log('Request ID:', result.request_id);
      console.log('Message:', result.message);
    } else {
      console.error('❌ Failed to send SMS');
      console.error('Error code:', result.code);
      console.error('Error message:', result.message);
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
  }
}

// Run the test
testSMSSend();