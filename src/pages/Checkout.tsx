
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatKES } from '@/utils/currency';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
}

interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  const orderData: OrderData = location.state?.orderData || { items, total };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderData.items || orderData.items.length === 0) {
      toast.error('No items to checkout');
      navigate('/cart');
      return;
    }

    fetchPaymentMethods();
  }, [user, navigate, orderData.items]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setPaymentMethods(data || []);
      if (data && data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  };

  const generateOrderNumber = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const createOrder = async () => {
    try {
      const orderNumber = generateOrderNumber();
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          order_number: orderNumber,
          total_amount: orderData.total,
          currency: 'KES',
          shipping_address: shippingAddress,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: 'KES'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const processPayment = async (orderId: string) => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!selectedMethod) throw new Error('No payment method selected');

    let paymentData: any = {};
    
    if (selectedMethod.type === 'mpesa') {
      if (!mpesaPhone) throw new Error('M-Pesa phone number is required');
      paymentData = { phone: mpesaPhone };
    } else if (selectedMethod.type === 'paypal') {
      if (!paypalEmail) throw new Error('PayPal email is required');
      paymentData = { email: paypalEmail };
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_method_id: selectedPaymentMethod,
        amount: orderData.total,
        currency: 'KES',
        status: 'processing',
        payment_data: paymentData
      })
      .select()
      .single();

    if (error) throw error;

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', payment.id);

    if (updateError) throw updateError;

    return payment;
  };

  const generateReceipt = async (orderId: string, paymentId: string) => {
    try {
      console.log('Generating receipt for order:', orderId, 'payment:', paymentId);
      
      const receiptData = {
        order_id: orderId,
        payment_id: paymentId,
        items: orderData.items,
        total: orderData.total,
        currency: 'KES',
        payment_method: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name,
        customer: {
          name: (user as any)?.user_metadata?.full_name || user?.email || 'Customer',
          email: user?.email || ''
        },
        timestamp: new Date().toISOString()
      };

      console.log('Receipt data:', receiptData);

      // Generate receipt number using the database function
      const { data: receiptNumberResult, error: receiptNumberError } = await supabase
        .rpc('generate_receipt_number');

      if (receiptNumberError) {
        console.error('Error generating receipt number:', receiptNumberError);
        // Fallback to client-side generation if database function fails
        const fallbackReceiptNumber = 'RCP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString().slice(2, 8);
        console.log('Using fallback receipt number:', fallbackReceiptNumber);
        
        const { data: receipt, error } = await supabase
          .from('receipts')
          .insert({
            order_id: orderId,
            payment_id: paymentId,
            receipt_number: fallbackReceiptNumber,
            receipt_data: receiptData
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting receipt with fallback number:', error);
          throw error;
        }

        console.log('Receipt created successfully with fallback number:', receipt);
        return receipt;
      }

      console.log('Generated receipt number:', receiptNumberResult);

      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert({
          order_id: orderId,
          payment_id: paymentId,
          receipt_number: receiptNumberResult,
          receipt_data: receiptData
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting receipt:', error);
        throw error;
      }

      console.log('Receipt created successfully:', receipt);
      return receipt;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      toast.error('Please enter a shipping address');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (selectedMethod?.type === 'mpesa' && !mpesaPhone) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }
    if (selectedMethod?.type === 'paypal' && !paypalEmail) {
      toast.error('Please enter your PayPal email');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting checkout process...');
      
      toast.info('Creating order...');
      const order = await createOrder();
      console.log('Order created:', order);

      toast.info('Processing payment...');
      const payment = await processPayment(order.id);
      console.log('Payment processed:', payment);

      toast.info('Generating receipt...');
      const receipt = await generateReceipt(order.id, payment.id);
      console.log('Receipt generated:', receipt);

      clearCart();
      toast.success('Order completed successfully!');
      
      console.log('Navigating to receipt page with:', {
        receiptId: receipt.id,
        orderNumber: order.order_number
      });
      
      navigate('/receipt', { 
        state: { 
          receiptId: receipt.id,
          orderNumber: order.order_number 
        } 
      });

    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return <Smartphone className="h-5 w-5" />;
      case 'paypal':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatKES(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatKES(orderData.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Address</Label>
                  <Input
                    id="shipping"
                    placeholder="Enter your full address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                          {getPaymentIcon(method.type)}
                          <span>{method.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Payment Method Specific Fields */}
                {selectedPaymentMethod && (
                  <div className="space-y-4">
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'mpesa' && (
                      <div className="space-y-2">
                        <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                        <Input
                          id="mpesa-phone"
                          placeholder="254XXXXXXXXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'paypal' && (
                      <div className="space-y-2">
                        <Label htmlFor="paypal-email">PayPal Email</Label>
                        <Input
                          id="paypal-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatKES(orderData.total)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
