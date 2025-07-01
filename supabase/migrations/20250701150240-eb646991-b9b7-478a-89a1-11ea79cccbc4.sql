
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_number TEXT UNIQUE NOT NULL,
  device_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  serial_number TEXT,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for products (public read)
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create their own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create RLS policies for service_requests
CREATE POLICY "Users can view their own service requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own service requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products with Kenyan Shillings pricing
INSERT INTO public.products (name, description, price, category, stock_quantity, image_url, specifications) VALUES
('MacBook Pro 16"', 'Powerful laptop for professionals', 324870.00, 'laptops', 15, 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop', '{"processor": "Apple M3 Pro", "memory": "18GB", "storage": "512GB SSD"}'),
('iPhone 15 Pro', 'Latest smartphone technology', 129870.00, 'phones', 8, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=300&fit=crop', '{"display": "6.1-inch Super Retina XDR", "storage": "128GB", "camera": "48MP Main"}'),
('Dell XPS 13', 'Compact and powerful ultrabook', 168870.00, 'laptops', 12, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&h=300&fit=crop', '{"processor": "Intel Core i7", "memory": "16GB", "storage": "512GB SSD"}'),
('iPad Pro 12.9"', 'Versatile tablet for work and creativity', 103870.00, 'tablets', 20, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=300&fit=crop', '{"display": "12.9-inch Liquid Retina XDR", "storage": "256GB", "chip": "Apple M2"}'),
('Samsung Galaxy Tab S9', 'Premium Android tablet', 71500.00, 'tablets', 15, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=300&fit=crop', '{"display": "11-inch Dynamic AMOLED 2X", "storage": "128GB", "processor": "Snapdragon 8 Gen 2"}'),
('Amazon Echo Dot (5th Gen)', 'Smart speaker with Alexa', 6500.00, 'smart_speakers', 30, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=300&fit=crop', '{"voice_assistant": "Alexa", "connectivity": "Wi-Fi, Bluetooth", "audio": "1.73-inch speaker"}'),
('Google Nest Audio', 'Smart speaker with Google Assistant', 9750.00, 'smart_speakers', 25, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop', '{"voice_assistant": "Google Assistant", "audio": "75mm woofer, 19mm tweeter", "connectivity": "Wi-Fi"}'),
('Samsung 55" QLED 4K TV', 'Premium 4K smart television', 97500.00, 'televisions', 10, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=300&fit=crop', '{"display": "55-inch QLED 4K", "smart_tv": "Tizen OS", "hdr": "HDR10+"}'),
('LG 65" OLED TV', 'Premium OLED television with perfect blacks', 195000.00, 'televisions', 8, 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=500&h=300&fit=crop', '{"display": "65-inch OLED 4K", "smart_tv": "webOS", "hdr": "Dolby Vision, HDR10"}'),
('PlayStation 5', 'Next-generation gaming console', 71500.00, 'game_consoles', 5, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=300&fit=crop', '{"storage": "825GB SSD", "resolution": "4K gaming", "processor": "AMD Zen 2"}'),
('Xbox Series X', 'Powerful gaming console with 4K gaming', 71500.00, 'game_consoles', 7, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&h=300&fit=crop', '{"storage": "1TB SSD", "resolution": "4K gaming", "processor": "AMD Zen 2"}'),
('Nintendo Switch OLED', 'Portable gaming console with OLED screen', 45500.00, 'game_consoles', 12, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop', '{"display": "7-inch OLED", "storage": "64GB", "battery": "4.5-9 hours"}');
