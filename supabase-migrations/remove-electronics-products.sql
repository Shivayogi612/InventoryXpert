-- Remove all electronics products from the inventory
-- This will delete products with category 'Electronics' or 'Accessories' or 'Storage'
-- Keeps only general store/grocery products

-- First, show what will be deleted
SELECT 
  COUNT(*) as products_to_delete,
  category
FROM products
WHERE category IN ('Electronics', 'Accessories', 'Storage')
GROUP BY category;

-- Delete electronics products
DELETE FROM products
WHERE category IN ('Electronics', 'Accessories', 'Storage');

-- Also delete products with SKU starting with 'SKU-' (our sample electronics)
DELETE FROM products
WHERE sku LIKE 'SKU-%';

-- Verify deletion
SELECT 
  COUNT(*) as total_products,
  category,
  COUNT(*) as count_per_category
FROM products
GROUP BY category
ORDER BY category;

-- Show remaining products
SELECT sku, name, category, price, quantity
FROM products
ORDER BY category, name;
