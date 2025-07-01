
-- Add more sample products with diverse categories and proper Kenyan pricing
INSERT INTO public.products (name, description, price, category, stock_quantity, image_url, specifications) VALUES
-- More Laptops
('HP Pavilion 15', 'Affordable laptop for students and professionals', 89700.00, 'laptops', 25, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=300&fit=crop', '{"processor": "Intel Core i5", "memory": "8GB", "storage": "256GB SSD"}'),
('Lenovo ThinkPad X1', 'Business-grade ultrabook', 215000.00, 'laptops', 10, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=300&fit=crop', '{"processor": "Intel Core i7", "memory": "16GB", "storage": "512GB SSD"}'),
('ASUS ROG Gaming Laptop', 'High-performance gaming laptop', 182000.00, 'laptops', 8, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=300&fit=crop', '{"processor": "AMD Ryzen 7", "memory": "16GB", "storage": "1TB SSD", "gpu": "RTX 4060"}'),

-- More Phones
('Samsung Galaxy S24', 'Latest Android flagship smartphone', 97500.00, 'phones', 20, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=300&fit=crop', '{"display": "6.2-inch Dynamic AMOLED", "storage": "256GB", "camera": "50MP Triple"}'),
('Google Pixel 8', 'Pure Android experience with AI features', 78000.00, 'phones', 15, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=300&fit=crop', '{"display": "6.2-inch OLED", "storage": "128GB", "camera": "50MP Main with AI"}'),
('OnePlus 12', 'Flagship killer with fast charging', 71500.00, 'phones', 12, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=300&fit=crop', '{"display": "6.82-inch LTPO AMOLED", "storage": "256GB", "charging": "100W SuperVOOC"}'),

-- More Tablets
('Microsoft Surface Pro 9', 'Versatile 2-in-1 laptop tablet', 130000.00, 'tablets', 14, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=300&fit=crop', '{"display": "13-inch PixelSense", "storage": "256GB", "processor": "Intel Core i5"}'),
('Amazon Fire HD 10', 'Budget-friendly entertainment tablet', 19500.00, 'tablets', 30, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=300&fit=crop', '{"display": "10.1-inch HD", "storage": "32GB", "battery": "12 hours"}'),

-- More Smart Speakers
('Apple HomePod mini', 'Compact smart speaker with Siri', 13000.00, 'smart_speakers', 20, 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&h=300&fit=crop', '{"voice_assistant": "Siri", "audio": "360-degree sound", "connectivity": "Wi-Fi, Bluetooth"}'),
('Sonos One', 'Premium smart speaker with rich sound', 26000.00, 'smart_speakers', 15, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop', '{"voice_assistant": "Alexa & Google", "audio": "Two Class-D amps", "connectivity": "Wi-Fi"}'),

-- More Televisions
('Sony 43" 4K Smart TV', 'Compact 4K TV for smaller spaces', 58500.00, 'televisions', 18, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=300&fit=crop', '{"display": "43-inch 4K LED", "smart_tv": "Google TV", "hdr": "HDR10"}'),
('TCL 75" QLED TV', 'Large screen premium viewing experience', 156000.00, 'televisions', 6, 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=500&h=300&fit=crop', '{"display": "75-inch QLED 4K", "smart_tv": "Android TV", "hdr": "Dolby Vision"}'),

-- More Gaming Consoles
('Steam Deck', 'Portable PC gaming handheld', 65000.00, 'game_consoles', 10, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop', '{"storage": "256GB SSD", "display": "7-inch touchscreen", "processor": "AMD APU"}'),
('Xbox Series S', 'Compact next-gen gaming console', 39000.00, 'game_consoles', 15, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&h=300&fit=crop', '{"storage": "512GB SSD", "resolution": "1440p gaming", "processor": "AMD Zen 2"}');

-- Update specific product images as requested
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=300&fit=crop'
WHERE name = 'iPhone 15 Pro';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop'
WHERE name = 'Google Nest Audio';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop'
WHERE name = 'Nintendo Switch OLED';

-- Create additional necessary tables

-- Create categories table for better product management
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_addresses table for user addresses
CREATE TABLE public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table for persistent shopping cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table for product reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- RLS policies for shipping_addresses
CREATE POLICY "Users can view their own addresses" ON public.shipping_addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own addresses" ON public.shipping_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.shipping_addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON public.shipping_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for cart_items
CREATE POLICY "Users can view their own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Insert category data
INSERT INTO public.categories (name, description, icon) VALUES
('laptops', 'Portable computers for work and gaming', 'laptop'),
('phones', 'Smartphones and mobile devices', 'smartphone'),
('tablets', 'Tablet computers and 2-in-1 devices', 'tablet'),
('smart_speakers', 'Voice-controlled smart speakers', 'speaker'),
('televisions', 'Smart TVs and displays', 'tv'),
('game_consoles', 'Gaming consoles and handhelds', 'gamepad2');

-- Insert sample shipping addresses (will be linked when users sign up)
-- Note: These will be example addresses that can be modified by users

-- Insert sample reviews for products
-- Note: These would typically be created after users make purchases
INSERT INTO public.reviews (user_id, product_id, rating, title, comment) VALUES
-- We'll leave this empty for now since we need actual user IDs
-- Users will create reviews after they sign up and make purchases
();

-- Remove the empty review insert
DELETE FROM public.reviews WHERE id IS NULL;

-- Add some sample service requests data structure
-- Note: Service requests will be created by users after they sign up

-- Update order statuses to include more realistic values
-- Add a check constraint for order status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add a check constraint for service request status
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_status_check 
  CHECK (status IN ('received', 'in_progress', 'awaiting_parts', 'completed', 'cancelled', 'ready_for_pickup'));
