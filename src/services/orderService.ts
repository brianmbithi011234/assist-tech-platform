
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/types/checkout';
import { generateOrderNumber } from '@/utils/checkout';
import { getOrCreateProfile } from './profileService';

export const createOrder = async (orderData: OrderData, user: any, shippingAddress: string) => {
  try {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Original user object:', user);
    
    // Get or create a valid UUID profile for the user
    const validUserId = await getOrCreateProfile(user.id, user);
    
    console.log('Using valid user ID:', validUserId);

    const orderNumber = generateOrderNumber();
    
    console.log('Creating order with data:', {
      user_id: validUserId,
      order_number: orderNumber,
      total_amount: orderData.total,
      currency: 'KES',
      shipping_address: shippingAddress,
      status: 'pending'
    });
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: validUserId,
        order_number: orderNumber,
        total_amount: orderData.total,
        currency: 'KES',
        shipping_address: shippingAddress,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created successfully:', order);

    // Create order items - ensuring we don't pass invalid UUIDs
    const orderItems = orderData.items.map(item => {
      console.log('Processing item for order:', item);
      return {
        order_id: order.id,
        product_id: null, // We set this to null since cart items don't have valid UUIDs
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: 'KES'
      };
    });

    console.log('Inserting order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    console.log('Order items created successfully');
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
