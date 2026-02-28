import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { aadhaar_url, selfie_url, consent } = await req.json();

    console.log(`Processing verification for user: ${user.id}`);

    if (!aadhaar_url || !selfie_url || !consent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert Aadhaar verification
    const { error: aadhaarError } = await supabase
      .from('verifications')
      .upsert({
        user_id: user.id,
        type: 'aadhaar',
        document_url: aadhaar_url,
        status: 'pending',
        notes: 'Identity document submitted',
      }, { onConflict: 'user_id,type' });

    if (aadhaarError) {
      console.error('Aadhaar upsert error:', aadhaarError);
      throw aadhaarError;
    }

    // Upsert face scan verification
    const { error: selfieError } = await supabase
      .from('verifications')
      .upsert({
        user_id: user.id,
        type: 'face_scan',
        document_url: selfie_url,
        status: 'pending',
        notes: 'Selfie submitted for face verification',
      }, { onConflict: 'user_id,type' });

    if (selfieError) {
      console.error('Selfie upsert error:', selfieError);
      throw selfieError;
    }

    // Ensure wallet exists for the user
    await supabase
      .from('wallets')
      .upsert({
        user_id: user.id,
        balance: 0,
        verification_bonus_claimed: false,
      }, { onConflict: 'user_id' });

    console.log(`Verification submitted successfully for user: ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Verification submitted successfully',
      status: 'pending'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in submit-verification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
