import { productsService } from './src/services/products.service.js';
import { config } from 'dotenv';

config();

async function testProductsService() {
  try {
    console.log('Testing products service...');
    
    const products = await productsService.getAll();
    console.log('Products fetched successfully!');
    console.log('Total products:', products.length);
    
    if (products.length > 0) {
      console.log('First 3 products:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.sku}: ${product.name} (${product.quantity} units)`);
      });
    }
  } catch (error) {
    console.error('Error testing products service:', error);
  }
}

testProductsService();