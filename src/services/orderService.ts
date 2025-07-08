
import { generateOrderNumber } from '@/utils/checkout';

// Demo order service that doesn't interact with Supabase
// This allows checkout to work without authentication issues

export const createOrder = async (orderData: any, user: any, shippingAddress: string) => {
  try {
    console.log('Creating demo order for user:', user);
    
    const orderNumber = generateOrderNumber();
    const orderId = `demo-order-${Date.now()}`;
    
    // Create a demo order object that simulates a real order
    const demoOrder = {
      id: orderId,
      order_number: orderNumber,
      user_id: user.id,
      total_amount: orderData.total,
      currency: 'KES',
      shipping_address: shippingAddress,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Demo order created:', demoOrder);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return demoOrder;
  } catch (error) {
    console.error('Error creating demo order:', error);
    throw error;
  }
};
