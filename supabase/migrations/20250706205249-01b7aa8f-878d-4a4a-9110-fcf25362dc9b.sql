
-- Ensure the receipt sequence exists and is properly configured
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Recreate the receipt number generation function to ensure it works properly
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('receipt_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Add missing trigger for updating timestamps on payments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payments table if it doesn't exist
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure orders can be updated (needed for status changes)
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders" 
  ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow service to update order status
DROP POLICY IF EXISTS "Service can update order status" ON orders;
CREATE POLICY "Service can update order status" 
  ON orders 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
