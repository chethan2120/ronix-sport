-- Supabase Schema & Row Level Security (RLS) for Ronix Sports CRM

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'stock', 'customer')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can read/write all profiles
CREATE POLICY "Admins have full access to all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Allow public insert for new signups (strictly enforcing role = 'customer' for unauthenticated/new users)
CREATE POLICY "Allow public customer profile creation on signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    (auth.uid() = id AND role = 'customer')
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', Split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    -- Automatically default to 'customer' unless explicitly created by an admin
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PRODUCTS Table & RLS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  image TEXT,
  description TEXT,
  cost_price NUMERIC,
  retail_price NUMERIC NOT NULL,
  b2b_price NUMERIC,
  min_stock_level INT DEFAULT 10,
  gst_percent NUMERIC DEFAULT 18,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Stock staff read products" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock'))
  );

CREATE POLICY "Customers read active products" ON public.products
  FOR SELECT USING (status = 'Active');

-- 4. INVENTORY Table & RLS
CREATE TABLE IF NOT EXISTS public.inventory (
  product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  on_hand INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  available INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to inventory" ON public.inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Stock staff read inventory" ON public.inventory
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock'))
  );

CREATE POLICY "Stock staff update inventory" ON public.inventory
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock'))
  );

-- 5. STOCK MOVEMENTS (AUDIT) Table & RLS
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  product_id TEXT REFERENCES public.products(id),
  product_name TEXT,
  sku TEXT,
  change INT NOT NULL,
  prev_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read stock movements" ON public.stock_movements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Stock staff insert stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock'))
  );

-- 6. CUSTOMER ORDERS Table & RLS
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  subtotal NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Confirmed', 'Processing', 'Ready', 'Shipped', 'Delivered', 'Cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to customer orders" ON public.customer_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers read own orders" ON public.customer_orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers insert own orders" ON public.customer_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 7. CUSTOMER ORDER ITEMS Table & RLS
CREATE TABLE IF NOT EXISTS public.customer_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL
);

ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to customer order items" ON public.customer_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers read own order items" ON public.customer_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customer_orders
      WHERE customer_orders.id = customer_order_items.order_id
      AND customer_orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers insert own order items" ON public.customer_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customer_orders
      WHERE customer_orders.id = customer_order_items.order_id
      AND customer_orders.customer_id = auth.uid()
    )
  );

