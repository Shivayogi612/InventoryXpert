import { alertEngineService } from './src/services/alertEngine.service.js';
import { supabase } from './src/services/supabase.js';

async function triggerAlert() {
    console.log('Triggering alert generation manually...');
    try {
        const result = await alertEngineService.generateAlerts();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

triggerAlert();
