// Test script to simulate low stock scenario and trigger SMS alerts
import dotenv from 'dotenv';
dotenv.config();

// Mock product data to simulate a low stock situation
const mockProduct = {
  id: 'test-product-001',
  name: 'Test Product',
  sku: 'TEST-001',
  quantity: 2,  // Low stock
  reorder_level: 5,  // Should trigger alert when stock is below this
  max_stock_level: 50
};

// Mock alerts service
const mockAlertsService = {
  getActiveAlerts: async () => [],
  createAlert: async (alert) => {
    console.log('✅ Alert created:', alert.title);
    return { id: 'test-alert-id', ...alert };
  }
};

// Mock cache service
const mockCacheService = {
  clear: async (key) => console.log(`Cache cleared for ${key}`),
  get: async (key) => {
    if (key === 'products') return [mockProduct];
    return null;
  },
  set: async (key, value) => console.log(`Cache set for ${key}`)
};

// Import and test the alert generation logic
async function testLowStockAlert() {
  console.log('Testing low stock alert generation...\n');
  
  try {
    // Simulate the autoGenerateAlerts logic
    const products = [mockProduct];
    const existing = await mockAlertsService.getActiveAlerts();
    
    for (const p of products) {
      const qty = Number(p.quantity || 0);
      const reorder = Number(p.reorder_level);
      const threshold = reorder > 0 ? reorder : 5;
      
      console.log(`Product: ${p.name} (SKU: ${p.sku})`);
      console.log(`Current stock: ${qty}, Reorder level: ${threshold}`);
      
      if (qty === 0) {
        console.log('🔴 Out of stock condition detected');
        const has = existing.find((a) => a.product_id === p.id && a.type === 'out_of_stock' && a.status === 'active');
        if (!has) {
          const alertData = { 
            product_id: p.id, 
            type: 'out_of_stock', 
            severity: 'critical', 
            title: `${p.name} is out of stock`, 
            message: `Product ${p.name} (SKU: ${p.sku}) is out of stock.`, 
            metadata: {} 
          };
          await mockAlertsService.createAlert(alertData);
          console.log('📤 Would send SMS notification for out of stock');
        }
      } else if (qty <= threshold) {
        console.log('🟡 Low stock condition detected');
        const has = existing.find((a) => a.product_id === p.id && a.type === 'low_stock' && a.status === 'active');
        if (!has) {
          const alertData = { 
            product_id: p.id, 
            type: 'low_stock', 
            severity: 'high', 
            title: `${p.name} is low on stock`, 
            message: `Product ${p.name} (SKU: ${p.sku}) has low inventory.`, 
            metadata: {} 
          };
          await mockAlertsService.createAlert(alertData);
          console.log('📤 Would send SMS notification for low stock');
        }
      } else {
        console.log('🟢 Stock level is adequate');
      }
      console.log('---');
    }
    
    console.log('\n✅ Low stock alert test completed');
  } catch (error) {
    console.error('❌ Error in low stock alert test:', error.message);
  }
}

// Run the test
testLowStockAlert();