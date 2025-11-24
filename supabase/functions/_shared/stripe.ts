import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

export function createStripeClient(): Stripe {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
}

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return { url: supabaseUrl, key: supabaseServiceKey };
}
