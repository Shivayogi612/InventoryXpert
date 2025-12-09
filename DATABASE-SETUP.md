# Supplier & Order Management - Database Setup Guide

## 🗄️ Database Tables Created

### 1. **suppliers** table
Stores supplier information including contact details and ratings.

**Columns:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR, NOT NULL)
- `contact_person` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `rating` (DECIMAL 0-5)
- `notes` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### 2. **purchase_orders** table
Tracks purchase orders with delivery dates and status.

**Columns:**
- `id` (UUID, Primary Key)
- `order_number` (VARCHAR, UNIQUE)
- `supplier_id` (UUID, Foreign Key → suppliers)
- `status` (VARCHAR: pending, shipped, delivered, delayed, cancelled)
- `items_count` (INTEGER)
- `total_value` (DECIMAL)
- `order_date` (DATE)
- `expected_delivery` (DATE)
- `actual_delivery` (DATE)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### 3. **purchase_order_items** table (Optional)
Detailed line items for each purchase order.

**Columns:**
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → purchase_orders)
- `product_id` (UUID, Foreign Key → products)
- `product_name` (VARCHAR)
- `quantity` (INTEGER)
- `unit_price` (DECIMAL)
- `total` (DECIMAL, Computed)
- `created_at` (TIMESTAMP)

## 📋 Setup Instructions

### Step 1: Run the SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase-migrations/suppliers-orders-schema.sql`
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute

This will:
- ✅ Create all three tables
- ✅ Set up foreign key relationships
- ✅ Create indexes for performance
- ✅ Enable Row Level Security (RLS)
- ✅ Create authentication policies
- ✅ Insert sample data (3 suppliers, 4 orders)

### Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see:
   - `suppliers` (3 rows)
   - `purchase_orders` (4 rows)
   - `purchase_order_items` (0 rows - optional)

### Step 3: Test the Integration

The app will automatically:
- Fetch suppliers from the database
- Display purchase orders with real data
- Calculate stats (active orders, delayed orders)
- Show low stock items from your inventory

## 🔧 Services Created

### `suppliers.service.js`
- `getAll()` - Fetch all suppliers
- `getById(id)` - Get single supplier
- `create(payload)` - Add new supplier
- `update(id, payload)` - Update supplier
- `remove(id)` - Delete supplier

### `orders.service.js`
- `getAll()` - Fetch all orders with supplier info
- `getById(id)` - Get single order
- `getByStatus(status)` - Filter by status
- `getActiveOrders()` - Get pending/shipped orders
- `getDelayedOrders()` - Get delayed orders
- `create(payload)` - Create new order
- `update(id, payload)` - Update order
- `updateStatus(id, status)` - Change order status
- `remove(id)` - Delete order
- `generateOrderNumber()` - Auto-generate PO number

## 📊 Sample Data Included

### Suppliers:
1. **ABC Supplies Co.** - John Smith (Rating: 4.5)
2. **Global Parts Ltd.** - Sarah Johnson (Rating: 4.8)
3. **Tech Components Inc.** - Mike Chen (Rating: 4.2)

### Purchase Orders:
1. **PO-2024-001** - Pending (15 items, $5,420)
2. **PO-2024-002** - Shipped (8 items, $3,200)
3. **PO-2024-003** - Delivered (22 items, $8,900)
4. **PO-2024-004** - Delayed (12 items, $4,100)

## 🔐 Security

All tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ Policies for authenticated users
- ✅ Full CRUD permissions for logged-in users

## 🚀 Features Now Working

### Real-Time Data:
- ✅ Supplier list from database
- ✅ Purchase orders with status tracking
- ✅ Automatic delay detection
- ✅ Low stock items from inventory
- ✅ Live statistics calculation

### Auto-Detection:
- ✅ Delayed orders (past expected delivery)
- ✅ Low stock items (below reorder level)
- ✅ Active vs completed orders

### Data Relationships:
- ✅ Orders linked to suppliers
- ✅ Supplier info displayed in orders
- ✅ Products linked to orders (via items table)

## 📝 Next Steps (Optional Enhancements)

1. **Add Forms:**
   - Create supplier form
   - Create purchase order form
   - Edit supplier/order modals

2. **Advanced Features:**
   - Email notifications for delays
   - Auto-generate PO from low stock
   - PDF export of orders
   - Supplier performance analytics

3. **Order Items:**
   - Link products to orders
   - Track individual line items
   - Calculate totals automatically

## 🔄 Data Flow

```
User Action → Service Call → Supabase → useCache → Component Update
```

All data is cached for performance and auto-refreshes based on stale time settings.

## ✅ Verification Checklist

- [ ] SQL migration executed successfully
- [ ] Tables visible in Supabase Table Editor
- [ ] Sample data appears in tables
- [ ] App shows suppliers in Suppliers tab
- [ ] App shows orders in Purchase Orders tab
- [ ] Stats cards show correct counts
- [ ] Low stock items appear in Auto-Generate tab
- [ ] No console errors

## 🆘 Troubleshooting

**No data showing?**
- Check Supabase connection in browser console
- Verify RLS policies are created
- Ensure you're logged in to the app

**Orders not showing supplier names?**
- Check the foreign key relationship
- Verify supplier_id matches in orders table

**Sample data not inserted?**
- Re-run the INSERT statements separately
- Check for unique constraint violations
