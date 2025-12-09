# Complete Purchase Order Automation Guide

## 🎯 Overview

The purchase order system is now **fully automated**! Here's the complete workflow:

1. ✅ **Create Purchase Order** - Select supplier and add items
2. ✅ **Track Order** - Monitor status and delivery dates
3. ✅ **Mark as Delivered** - Click one button
4. ✅ **Automatic Inventory Update** - Items added to inventory automatically
5. ✅ **Transaction History** - Full audit trail created

## 🚀 Setup (One-Time)

### Step 1: Run Database Migrations

Run these SQL scripts in **Supabase SQL Editor**:

1. **`suppliers-orders-schema.sql`** - Creates suppliers and orders tables
2. **`update-products-supplier.sql`** - Links products to suppliers
3. **`add-order-items.sql`** (optional) - Adds sample data for testing

### Step 2: Link Products to Suppliers

In your products table, set the `supplier` field to match supplier names:
- "ABC Supplies Co."
- "Global Parts Ltd."
- "Tech Components Inc."

This allows the system to show relevant products when creating orders.

## 📋 How to Create a Purchase Order

### Step 1: Click "New Purchase Order"

On the Suppliers page, click the blue **"+ New Purchase Order"** button.

### Step 2: Select Supplier (Step 1 of 3)

- View all available suppliers
- Click on a supplier to select them
- See supplier details (contact, email, phone)
- Click **"Next: Add Items"**

### Step 3: Add Items (Step 2 of 3)

**Available Products Section:**
- See all products from the selected supplier
- Products are filtered by the `supplier` field
- Each product shows: Name, SKU, Current Stock, Price

**Add Items:**
- Click **"+ Add"** button on any product
- Product appears in "Order Items" section below

**Order Items Section:**
- Adjust **quantity** for each item
- Adjust **unit price** if needed
- See **total** for each line item
- Remove items with trash icon
- See **grand total** at bottom

Click **"Next: Review"** when done.

### Step 4: Review & Create (Step 3 of 3)

**Review Details:**
- Supplier name
- Number of items
- Total value
- Set **Expected Delivery Date** (optional)
- Add **Notes** (optional)

**Order Items Summary:**
- See all items with quantities and prices
- Verify totals are correct

Click **"Create Purchase Order"** to finalize.

## ✅ What Happens When Order is Created

1. **Purchase Order Created**
   - Unique order number generated (PO-2024-XXXX)
   - Status: "Pending"
   - Saved to database

2. **Items Linked**
   - All items saved to `purchase_order_items` table
   - Linked to specific products in inventory
   - Quantities and prices recorded

3. **Order Appears in List**
   - Visible in "Purchase Orders" tab
   - Shows all details
   - Ready to track

## 📦 How to Receive/Deliver an Order

### Step 1: Find the Order

Go to **Suppliers** → **Purchase Orders** tab

### Step 2: Click "Mark Delivered"

- Find the order (status: Pending or Shipped)
- Click **"Mark Delivered"** button
- Confirm the action

### Step 3: Automatic Processing

The system automatically:

```
For each item in the order:
  1. Creates transaction (type: IN)
  2. Updates product quantity (+item.quantity)
  3. Records in transaction history
  4. Checks for low stock alerts
```

### Step 4: Verify Updates

**Check Transactions Page:**
- See new "IN" transactions
- Reference: PO number
- Reason: "Purchase Order Received"
- Notes: "Received from [Supplier]"

**Check Inventory Page:**
- Product quantities updated
- Previous quantity + order quantity = new quantity

**Check Order Status:**
- Status changed to "Delivered"
- Actual delivery date recorded
- Green checkmark shown

## 🔄 Complete Workflow Example

### Creating an Order:

```
1. Click "New Purchase Order"
2. Select "ABC Supplies Co."
3. Add items:
   - Product A: 50 units @ $25 = $1,250
   - Product B: 30 units @ $30 = $900
   - Product C: 20 units @ $35 = $700
4. Total: $2,850
5. Set delivery: 2024-12-15
6. Click "Create Purchase Order"
7. Order PO-2024-001 created!
```

### Receiving the Order:

```
1. Order arrives on 2024-12-15
2. Go to Suppliers → Purchase Orders
3. Find PO-2024-001
4. Click "Mark Delivered"
5. Confirm action
6. System processes:
   - Creates 3 transactions
   - Product A: 10 → 60 units
   - Product B: 5 → 35 units
   - Product C: 8 → 28 units
7. Done! Inventory updated automatically
```

## 📊 Data Flow Diagram

```
Create Purchase Order
        ↓
Select Supplier
        ↓
Add Items (from supplier's products)
        ↓
Review & Create
        ↓
Order Saved (status: pending)
        ↓
Items Linked to Products
        ↓
[Wait for delivery]
        ↓
Click "Mark Delivered"
        ↓
For Each Item:
  - Create Transaction (IN)
  - Update Product Quantity
  - Record History
        ↓
Order Status → Delivered
        ↓
All Pages Updated (cache cleared)
```

## 🎨 UI Features

### Purchase Order Modal

**3-Step Wizard:**
- Step 1: Select Supplier (with contact info)
- Step 2: Add Items (with live product filtering)
- Step 3: Review & Create (with summary)

**Visual Indicators:**
- Progress steps at top
- Active step highlighted
- Smooth animations
- Clear navigation

**Product Selection:**
- Grid layout for easy browsing
- Product cards with details
- Quick "Add" buttons
- Real-time total calculation

**Order Items Management:**
- Editable quantities
- Editable prices
- Remove items easily
- Live total updates

### Orders Table

**Status Badges:**
- 🟡 Pending (yellow)
- 🔵 Shipped (blue)
- 🟢 Delivered (green)
- 🔴 Delayed (red)

**Actions:**
- "Mark Delivered" button (for pending/shipped)
- Green checkmark (for delivered)
- Disabled state while processing

## 🔧 Technical Details

### Database Tables

**purchase_orders:**
- order_number (unique)
- supplier_id (FK)
- status, items_count, total_value
- order_date, expected_delivery, actual_delivery

**purchase_order_items:**
- order_id (FK → purchase_orders)
- product_id (FK → products)
- product_name, quantity, unit_price
- total (auto-calculated)

**transactions:**
- Created when order marked as delivered
- type: 'in'
- reference_number: PO number
- Links to product and updates quantity

### Services

**ordersService:**
- `create()` - Create new order
- `addOrderItem()` - Add item to order
- `updateOrderTotals()` - Calculate totals
- `markAsDelivered()` - Process delivery
- `generateOrderNumber()` - Auto-generate PO#

**Integration:**
- Automatically creates transactions
- Updates inventory quantities
- Clears caches for real-time updates
- Triggers low stock alerts

## ✅ Verification Checklist

After creating and receiving an order:

- [ ] Order appears in Purchase Orders list
- [ ] Order has correct supplier
- [ ] Items count matches
- [ ] Total value is correct
- [ ] Can click "Mark Delivered"
- [ ] Transactions created (check Transactions page)
- [ ] Inventory quantities updated (check Inventory page)
- [ ] Order status changed to "Delivered"
- [ ] Green checkmark shown
- [ ] No errors in console

## 🆘 Troubleshooting

**Modal doesn't open?**
- Check browser console for errors
- Verify CreateOrderModal component imported
- Ensure state is managed correctly

**No products shown for supplier?**
- Check products have `supplier` field set
- Supplier name must match exactly
- Run `update-products-supplier.sql` script

**Can't create order?**
- Ensure supplier is selected
- Add at least one item
- Check Supabase connection
- Verify RLS policies allow inserts

**Items not added to inventory?**
- Check purchase_order_items table has data
- Verify product_id is valid
- Check transactions service logs
- Ensure RLS policies allow updates

**Quantities not updating?**
- Verify transactions were created
- Check products table for updates
- Look for errors in browser console
- Ensure cache is clearing properly

## 📝 Best Practices

1. **Always Set Supplier Field**
   - Update products with correct supplier names
   - Use exact supplier names from suppliers table
   - This enables proper product filtering

2. **Review Before Creating**
   - Double-check quantities
   - Verify prices are correct
   - Set expected delivery date
   - Add notes for reference

3. **Track Delivery Dates**
   - Set realistic expected delivery dates
   - System auto-detects delays
   - Update status when shipped

4. **Verify After Delivery**
   - Check Transactions page
   - Verify inventory quantities
   - Confirm all items processed
   - Review for any errors

## 🎯 Summary

**Before:**
- ❌ Manual inventory updates
- ❌ No purchase order tracking
- ❌ No transaction history
- ❌ Prone to errors

**After:**
- ✅ Automated inventory updates
- ✅ Complete order tracking
- ✅ Full transaction history
- ✅ Error-free processing
- ✅ One-click delivery processing
- ✅ Real-time data sync

The system is now **fully automated** from order creation to inventory update! 🚀
