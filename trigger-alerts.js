// Script to manually trigger alert generation
import dotenv from 'dotenv';
dotenv.config();

async function triggerAlerts() {
  console.log('Manually triggering alert generation...\n');
  
  try {
    // Dynamically import the alert engine service
    const { alertEngineService } = await import('./src/services/alertEngine.service.js');
    
    console.log('✅ Alert engine service loaded successfully\n');
    
    console.log('Generating alerts...');
    const result = await alertEngineService.generateAlerts();
    
    console.log('\n✅ Alert generation completed');
    console.log('Summary:');
    console.log('- Stockout risk alerts:', result.summary.stockoutRisk);
    console.log('- Excess stock alerts:', result.summary.excessStock);
    console.log('- Supplier delay alerts:', result.summary.supplierDelay);
    console.log('- Other alerts:', result.summary.other);
    console.log('- Total alerts created:', result.summary.totalCreated);
    console.log('- Total alerts skipped:', result.summary.totalSkipped);
    
    if (result.createdAlerts.length > 0) {
      console.log('\nCreated alerts:');
      result.createdAlerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.title}`);
      });
    }
    
    if (result.skippedAlerts.length > 0) {
      console.log('\nSkipped alerts:');
      result.skippedAlerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.title} - ${alert.reason}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error triggering alerts:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the alert trigger
triggerAlerts();