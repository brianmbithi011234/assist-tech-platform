
import { supabase } from '@/integrations/supabase/client';
import { OrderData, PaymentMethod } from '@/types/checkout';

export const generateReceipt = async (
  orderId: string,
  paymentId: string,
  orderData: OrderData,
  paymentMethods: PaymentMethod[],
  selectedPaymentMethod: string,
  user: any
) => {
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
