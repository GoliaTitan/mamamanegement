## Configuration & Sync

### Supabase Setup
The application requires a Supabase project with the following tables:
- `products`: id, name, price, sale_price, on_sale, is_best_seller, stock, category, barcode, image, unit, type
- `sales`: id, items (jsonb), totalGross, totalDiscount, totalNet, paymentMethod, storeId, userId, timestamp
- `users`: email, name, role, pin, phone, photo
- `stores`: id, name, address
- `daily_checks`: id, date, userId, storeId, type, data (jsonb), photos (jsonb)

### Environment Variables
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
