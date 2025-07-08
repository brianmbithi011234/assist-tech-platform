import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from '@/utils/checkout';

export const getOrCreateProfile = async (userId: string, user: any) => {
  try {
    console.log('Demo mode: Skipping profile creation for user:', userId);
    
    // For demo purposes, we'll just return the user ID without creating a profile
    // This avoids RLS policy violations while still allowing the checkout flow to work
    
    // Generate a consistent demo profile ID based on the user's mock ID
    const demoProfileId = `demo-${userId}`;
    
    console.log('Using demo profile ID:', demoProfileId);
    return demoProfileId;
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    // Return a fallback demo ID to keep the flow working
    const fallbackId = `demo-${Date.now()}`;
    console.log('Using fallback demo ID:', fallbackId);
    return fallbackId;
  }
};
