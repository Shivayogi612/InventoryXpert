// Test script to check real alert generation and SMS sending
import dotenv from 'dotenv';
dotenv.config();

// We need to dynamically import the services since they use import.meta.env
async function testRealAlerts() {
  console.log('Testing real alert generation and SMS sending...\n');
  
  try {
    // Dynamically import the services
    const { useAlerts } = await import('./src/hooks/useAlerts.js');
    const { alertEngineService } = await import('./src/services/alertEngine.service.js');
    
    console.log('✅ Services imported successfully\n');
    
    // Test sending a direct SMS notification
    console.log('Testing direct SMS notification...');
    const testAlert = {
      title: 'Direct SMS Test',
      message: 'This is a direct test of the SMS notification system.',
      type: 'test',
      severity: 'medium'
    };
    
    try {
      // Test via hook
      console.log('\n--- Testing via useAlerts hook ---');
      // We can't directly call the hook outside of a React component, 
      // but we can test the underlying function
      
      // Test via alert engine service
      console.log('\n--- Testing via alertEngineService ---');
      const smsResult = await alertEngineService.sendSMSNotification(testAlert);
      console.log('✅ SMS sent successfully via alertEngineService:', smsResult);
    } catch (smsError) {
      console.error('❌ Failed to send SMS:', smsError.message);
    }
    
    console.log('\n✅ Real alert test completed');
  } catch (error) {
    console.error('❌ Error in real alert test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testRealAlerts();