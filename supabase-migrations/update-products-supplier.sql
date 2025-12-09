-- Ensure products table has supplier field for linking products to suppliers
-- This allows filtering products by supplier when creating purchase orders

-- Add supplier column if it doesn't exist (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'supplier'
    ) THEN
        ALTER TABLE products ADD COLUMN supplier VARCHAR(255);
    END IF;
END $$;

-- Update some sample products to have supplier names
-- This links products to the suppliers we created earlier

UPDATE products 
SET supplier = 'ABC Supplies Co.'
WHERE id IN (
    SELECT id FROM products 
    WHERE supplier IS NULL 
    LIMIT 5
);

UPDATE products 
SET supplier = 'Global Parts Ltd.'
WHERE id IN (
    SELECT id FROM products 
    WHERE supplier IS NULL 
    LIMIT 5
);

UPDATE products 
SET supplier = 'Tech Components Inc.'
WHERE id IN (
    SELECT id FROM products 
    WHERE supplier IS NULL 
    LIMIT 5
);

-- Verify the update
SELECT 
    supplier,
    COUNT(*) as product_count
FROM products
WHERE supplier IS NOT NULL
GROUP BY supplier
ORDER BY supplier;
