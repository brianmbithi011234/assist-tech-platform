
import { OrderData, PaymentMethod } from '@/types/checkout';

// Demo receipt service that doesn't interact with Supabase
export const generateReceipt = async (
  orderId: string,
  paymentId: string,
  orderData: OrderData,
  paymentMethods: PaymentMethod[],
  selectedPaymentMethod: string,
  user: any
) => {
  try {
    console.log('Generating demo receipt for order:', orderId, 'payment:', paymentId);
    
    const receiptNumber = 'RCP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString().slice(2, 8);
    
    const receiptData = {
      order_id: orderId,
      payment_id: paymentId,
      items: orderData.items,
      total: orderData.total,
      currency: 'KES',
      payment_method: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Demo Payment',
      customer: {
        name: user?.name || 'Demo Customer',
        email: user?.email || 'demo@example.com'
      },
      timestamp: new Date().toISOString()
    };

    console.log('Receipt data:', receiptData);

    // Create a demo receipt object
    const demoReceipt = {
      id: `demo-receipt-${Date.now()}`,
      order_id: orderId,
      payment_id: paymentId,
      receipt_number: receiptNumber,
      receipt_data: receiptData,
      created_at: new Date().toISOString()
    };

    console.log('Demo receipt created:', demoReceipt);
    
    // Store the receipt in localStorage for demo purposes
    const existingReceipts = JSON.parse(localStorage.getItem('demoReceipts') || '[]');
    existingReceipts.push(demoReceipt);
    localStorage.setItem('demoReceipts', JSON.stringify(existingReceipts));
    
    return demoReceipt;
  } catch (error) {
    console.error('Error generating demo receipt:', error);
    throw error;
  }
};
