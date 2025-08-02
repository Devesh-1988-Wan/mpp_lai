import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  projectId: string;
  permission: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Get the site URL from environment variables for the redirect
    const siteUrl = Deno.env.get('SITE_URL');
    if (!siteUrl) {
      throw new Error("SITE_URL environment variable is not set.");
    }

    const { email, projectId, permission }: InviteUserRequest = await req.json();

    console.log('Inviting user:', { email, projectId, permission });

    const { data: existingUser, error: userCheckError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userCheckError);
      throw userCheckError;
    }

    const userExists = !!existingUser;
    console.log('User exists:', userExists);

    if (!userExists) {
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        if (!createError.message.includes('already registered')) {
          throw createError;
        }
      } else {
        console.log('Created new user:', newUser.user?.email);
      }
    }

    const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: '/',
    });

    if (resetError) {
      console.error('Error sending password reset email:', resetError);
      throw resetError;
    }

    console.log('Password reset email sent to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: userExists 
          ? 'Password reset email sent to existing user' 
          : 'User created and password reset email sent'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in invite-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
