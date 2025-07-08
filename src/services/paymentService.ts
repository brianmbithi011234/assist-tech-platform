
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types/checkout';

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }

  return data || [];
};

export const processPayment = async (
  orderId: string,
  paymentMethodId: string,
  paymentMethods: PaymentMethod[],
  amount: number,
  mpesaPhone?: string,
  paypalEmail?: string
) => {
  try {
    console.log('Processing simulated payment for order:', orderId);

    const paymentMethod = paymentMethods.find(m => m.id === paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Invalid payment method');
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a fake transaction ID
    const transactionId = 'TXN-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString().slice(2, 8);

    // Create payment record with simulated success
    const paymentData: any = {
      payment_method: paymentMethod.name,
      simulated: true,
      transaction_id: transactionId,
      timestamp: new Date().toISOString()
    };

    // Add method-specific data
    if (paymentMethod.type === 'mpesa' && mpesaPhone) {
      paymentData.mpesa_phone = mpesaPhone;
      paymentData.mpesa_confirmation = 'SIM-' + Math.random().toString().slice(2, 8);
    } else if (paymentMethod.type === 'paypal' && paypalEmail) {
      paymentData.paypal_email = paypalEmail;
      paymentData.paypal_reference = 'PAY-' + Math.random().toString().slice(2, 8);
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_method_id: paymentMethodId,
        amount: amount,
        currency: 'KES',
        status: 'completed', // Simulated success
        transaction_id: transactionId,
        payment_data: paymentData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }

    console.log('Simulated payment processed successfully:', payment);
    return payment;
  } catch (error) {
    console.error('Error processing simulated payment:', error);
    throw error;
  }
};
