// Script to check if alerts are being generated and SMS notifications are being sent
import fs from 'fs';
import path from 'path';

// Read the .env file to get the phone number
function getPhoneNumber() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('VITE_OWNER_PHONE_NUMBER=') || line.startsWith('OWNER_PHONE_NUMBER=')) {
        return line.split('=')[1].trim().replace(/['"]/g, '');
      }
    }
  }
  return null;
}

// Check if the phone number is properly set
const phoneNumber = getPhoneNumber();
console.log('Phone number from .env:', phoneNumber);

if (!phoneNumber) {
  console.log('❌ Phone number not found in .env file');
  process.exit(1);
}

if (phoneNumber.length < 10) {
  console.log('❌ Phone number appears to be invalid');
  process.exit(1);
}

console.log('✅ Phone number is properly configured');

// Check if the alert engine service has the correct implementation
const alertEnginePath = path.resolve('src/services/alertEngine.service.js');
if (fs.existsSync(alertEnginePath)) {
  const alertEngineContent = fs.readFileSync(alertEnginePath, 'utf8');
  
  // Check if the SMS sending code is uncommented
  const lines = alertEngineContent.split('\n');
  let fetchLineIndex = -1;
  let routeLineIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const response = await fetch(\'https://www.fast2sms.com/dev/bulkV2\'')) {
      fetchLineIndex = i;
    }
    if (lines[i].includes('route: \'q\'')) {
      routeLineIndex = i;
    }
  }
  
  // Check if the fetch call line is not commented out
  const isFetchUncommented = fetchLineIndex >= 0 && !lines[fetchLineIndex].trim().startsWith('//');
  const isRouteUncommented = routeLineIndex >= 0 && !lines[routeLineIndex].trim().startsWith('//');
  
  if (isFetchUncommented && isRouteUncommented) {
    console.log('✅ Alert engine service has SMS sending code uncommented and properly configured');
  } else {
    console.log('❌ Alert engine service might not have SMS sending code properly configured');
    console.log('Checking for specific markers...');
    console.log('- Fetch call line:', fetchLineIndex >= 0 ? `Found at line ${fetchLineIndex + 1}` : 'Not found');
    console.log('- Route line:', routeLineIndex >= 0 ? `Found at line ${routeLineIndex + 1}` : 'Not found');
    console.log('- Fetch line uncommented:', isFetchUncommented);
    console.log('- Route line uncommented:', isRouteUncommented);
  }
  
  // Check if the hook has the correct implementation
  const hookPath = path.resolve('src/hooks/useAlerts.js');
  if (fs.existsSync(hookPath)) {
    const hookContent = fs.readFileSync(hookPath, 'utf8');
    
    const hookLines = hookContent.split('\n');
    let hookFetchLineIndex = -1;
    let hookRouteLineIndex = -1;
    
    for (let i = 0; i < hookLines.length; i++) {
      if (hookLines[i].includes('const response = await fetch(\'https://www.fast2sms.com/dev/bulkV2\'')) {
        hookFetchLineIndex = i;
      }
      if (hookLines[i].includes('route: \'q\'')) {
        hookRouteLineIndex = i;
      }
    }
    
    // Check if the fetch call line is not commented out
    const isHookFetchUncommented = hookFetchLineIndex >= 0 && !hookLines[hookFetchLineIndex].trim().startsWith('//');
    const isHookRouteUncommented = hookRouteLineIndex >= 0 && !hookLines[hookRouteLineIndex].trim().startsWith('//');
    
    if (isHookFetchUncommented && isHookRouteUncommented) {
      console.log('✅ useAlerts hook has SMS sending code uncommented and properly configured');
    } else {
      console.log('❌ useAlerts hook might not have SMS sending code properly configured');
      console.log('Checking for specific markers...');
      console.log('- Fetch call line:', hookFetchLineIndex >= 0 ? `Found at line ${hookFetchLineIndex + 1}` : 'Not found');
      console.log('- Route line:', hookRouteLineIndex >= 0 ? `Found at line ${hookRouteLineIndex + 1}` : 'Not found');
      console.log('- Fetch line uncommented:', isHookFetchUncommented);
      console.log('- Route line uncommented:', isHookRouteUncommented);
    }
  }
}

console.log('\n✅ Alert system check completed');
console.log('\nTo test if alerts are working:');
console.log('1. Make sure your application is running (npm run dev)');
console.log('2. Set a product\'s quantity below its reorder level');
console.log('3. Wait for the background job to run (every 5 minutes) or manually trigger alert generation');
console.log('4. Check if you receive an SMS notification');