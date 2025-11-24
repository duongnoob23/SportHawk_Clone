import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^13.0.0';

Deno.serve(async (req: Request) => {
  console.log('1. Webhook received');

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.log('2. ERROR: No signature');
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (
    !stripeSecretKey ||
    !webhookSecret ||
    !supabaseUrl ||
    !supabaseServiceKey
  ) {
    console.log('3. ERROR: Missing env vars');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('4. Event verified:', event.type);

    // 2. Handle specific events using atomic RPC functions
    // PO DECISION: Added payment_intent.canceled to track user cancellations
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;
        const payment_method_type =
          paymentIntent.metadata.payment_method_type || 'card';

        if (!member_id) {
          console.log('5. ERROR: Missing member_id');
          throw new Error('Missing payment_request_member_id in metadata');
        }

        console.log('5. Calling RPC for payment success', {
          payment_method: payment_method_type,
          member_id: member_id,
        });

        const { error } = await supabase.rpc('process_payment_success', {
          p_payment_intent_id: paymentIntent.id,
          p_charge_id: paymentIntent.latest_charge as string,
          p_member_id: member_id,
          p_amount_pence: paymentIntent.amount,
        });

        if (error) {
          console.log('6. RPC ERROR:', error.message);
          throw error;
        }

        console.log('7. Payment processed successfully');
        // NOTE: No notification triggering - handled in future story
        break;
      }

      case 'payment_intent.payment_failed': {
        console.log('Processing payment_intent.payment_failed event');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;

        console.log('Payment failure details:', {
          id: paymentIntent.id,
          member_id: member_id,
          error_message: paymentIntent.last_payment_error?.message,
        });

        if (!member_id) {
          console.error('Missing payment_request_member_id in metadata');
          throw new Error('Missing payment_request_member_id in metadata');
        }

        // Use atomic RPC function for failure handling
        console.log('Calling process_payment_failure RPC...');
        const { error } = await supabase.rpc('process_payment_failure', {
          p_payment_intent_id: paymentIntent.id,
          p_member_id: member_id,
          p_failure_reason:
            paymentIntent.last_payment_error?.message || 'Payment failed',
        });

        if (error) {
          console.error('Failed to process payment failure:', error);
          throw error;
        }

        console.log('Payment failure processed successfully');
        break;
      }

      case 'payment_intent.canceled': {
        console.log('Processing payment_intent.canceled event');
        // PO DECISION: Track canceled payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;

        console.log('Payment cancellation details:', {
          id: paymentIntent.id,
          member_id: member_id,
          status: paymentIntent.status,
        });

        if (!member_id) {
          console.error('Missing payment_request_member_id in metadata');
          throw new Error('Missing payment_request_member_id in metadata');
        }

        // Use atomic RPC function for cancellation
        console.log('Calling process_payment_canceled RPC...');
        const { error } = await supabase.rpc('process_payment_canceled', {
          p_payment_intent_id: paymentIntent.id,
          p_member_id: member_id,
        });

        if (error) {
          console.error('Failed to process payment cancellation:', error);
          throw error;
        }

        console.log('Payment cancellation processed successfully');
        break;
      }

      default: {
        // PO DECISION: Log unhandled events for monitoring
        console.log(`Unhandled webhook event: ${event.type}`, {
          event_id: event.id,
          event_type: event.type,
          created: event.created,
        });
        break;
      }
    }

    console.log('8. Webhook completed successfully');
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.log(
      'ERROR:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
      }
    );
  }
});
