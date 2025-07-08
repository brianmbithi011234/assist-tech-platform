
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from '@/utils/checkout';

export const getOrCreateProfile = async (userId: string, user: any) => {
  try {
    // If the userId is already a valid UUID, try to find the profile
    if (isValidUUID(userId)) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!error && profile) {
        return userId;
      }
    }

    // If not a valid UUID or profile doesn't exist, create a new profile with UUID
    const newProfileId = crypto.randomUUID();
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newProfileId,
        email: user?.email || '',
        full_name: (user as any)?.user_metadata?.full_name || (user as any)?.name || 'Customer',
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      throw insertError;
    }

    console.log('Created new profile with ID:', newProfileId);
    return newProfileId;
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    throw error;
  }
};
