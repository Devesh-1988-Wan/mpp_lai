import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string;
  email: string;
  display_name?: string;
}

export class ProfileService {
  static async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  }
}