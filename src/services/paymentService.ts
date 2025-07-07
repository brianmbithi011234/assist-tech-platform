
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types/checkout';

export const fetchPaymentMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const processPayment = async (
  orderId: string,
  selectedPaymentMethod: string,
  paymentMethods: PaymentMethod[],
  orderTotal: number,
  mpesaPhone: string,
  paypalEmail: string
) => {
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
      amount: orderTotal,
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
