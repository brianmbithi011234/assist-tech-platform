
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { formatKES } from '@/utils/currency';
import { OrderData, PaymentMethod } from '@/types/checkout';
import { fetchPaymentMethods, processPayment } from '@/services/paymentService';
import { createOrder } from '@/services/orderService';
import { generateReceipt } from '@/services/receiptService';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import PaymentMethodFields from '@/components/checkout/PaymentMethodFields';

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

    loadPaymentMethods();
  }, [user, navigate, orderData.items]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    } catch (error) {
      toast.error('Failed to load payment methods');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to complete your order');
      navigate('/login');
      return;
    }
    
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
      
      toast.info('Creating order...', { duration: 1000 });
      const order = await createOrder(orderData, user, shippingAddress);
      console.log('Order created:', order);

      toast.info('Processing simulated payment...', { duration: 2000 });
      const payment = await processPayment(
        order.id,
        selectedPaymentMethod,
        paymentMethods,
        orderData.total,
        mpesaPhone,
        paypalEmail
      );
      console.log('Simulated payment processed:', payment);

      toast.info('Generating receipt...', { duration: 1000 });
      const receipt = await generateReceipt(
        order.id,
        payment.id,
        orderData,
        paymentMethods,
        selectedPaymentMethod,
        user
      );
      console.log('Receipt generated:', receipt);

      clearCart();
      toast.success('Order completed successfully! (Simulated Payment)', { duration: 3000 });
      
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
      let errorMessage = 'Failed to process order';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || JSON.stringify(error);
      }
      
      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {/* Simulated Payment Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> This is a simulated payment system. No real transactions will be processed. All payments will be marked as successful for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderSummary orderData={orderData} />

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <PaymentMethodSelector
                  paymentMethods={paymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodChange={setSelectedPaymentMethod}
                />

                <PaymentMethodFields
                  selectedPaymentMethod={selectedPaymentMethod}
                  paymentMethods={paymentMethods}
                  mpesaPhone={mpesaPhone}
                  paypalEmail={paypalEmail}
                  onMpesaPhoneChange={setMpesaPhone}
                  onPaypalEmailChange={setPaypalEmail}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing Simulated Payment...' : `Pay ${formatKES(orderData.total)} (Simulated)`}
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
