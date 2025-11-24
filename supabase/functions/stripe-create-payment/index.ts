import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^13.0.0';

Deno.serve(async (req: Request) => {
  try {
    // 1. Parse request body
    const { payment_request_member_id, payment_method_type = 'card' } =
      await req.json();

    // 2. Initialize clients
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Bypass RLS
    );

    // 3. Fetch payment details with joins
    const { data: member, error: memberError } = await supabase
      .from('payment_request_members')
      .select(
        `
        *,
        payment_requests!inner(
          *,
          team_id
        )
      `
      )
      .eq('id', payment_request_member_id)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Payment member record not found',
          },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate payment can be made
    if (member.payment_status === 'paid') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'ALREADY_PAID',
            message: 'This payment has already been completed',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4a. Fetch Stripe account for the team
    const { data: stripeAccount, error: stripeError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('team_id', member.payment_requests.team_id)
      .single();

    if (stripeError || !stripeAccount?.stripe_account_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NO_STRIPE_ACCOUNT',
            message: 'Team has not configured payment processing',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripeAccountId = stripeAccount.stripe_account_id;

    // 5. Check for existing PaymentIntent (PO Decision: Option C - One Payment Intent Per Member)
    if (member.stripe_payment_intent_id) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          member.stripe_payment_intent_id
        );
        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation' ||
          existingIntent.status === 'requires_action'
        ) {
          // Return existing intent that can still be used
          return new Response(
            JSON.stringify({
              client_secret: existingIntent.client_secret,
              amount: member.amount_pence,
              currency: 'GBP',
              payment_intent_id: existingIntent.id,
              payment_id: member.payment_id, // Assuming this was stored
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (err) {
        // Intent doesn't exist or error retrieving, create new one
      }
    }

    // 6. Create new Stripe PaymentIntent (NO application_fee_amount)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: member.amount_pence,
      currency: 'gbp', // Lowercase for Stripe
      description: `SportHawk: ${member.payment_requests.title}`,
      statement_descriptor_suffix: 'SPORTHAWK', // Use suffix instead of descriptor for card payments
      metadata: {
        payment_request_member_id: member.id,
        payment_request_id: member.payment_request_id,
        user_id: member.user_id,
        team_id: member.payment_requests.team_id,
        payment_method_type: payment_method_type, // Track payment method (card/apple/google)
      },
      on_behalf_of: stripeAccountId,
      transfer_data: {
        destination: stripeAccountId, // Team gets FULL amount
      },
    });

    // 7. Create payment record for tracking
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: member.user_id,
        payment_request_id: member.payment_request_id,
        amount: member.amount_pence / 100,
        amount_pence: member.amount_pence,
        currency: 'GBP',
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: 'card',
      })
      .select()
      .single();

    if (paymentError) {
      // PO DECISION: Cancel on Failure - Rollback PaymentIntent if database fails
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        console.error('Failed to cancel PaymentIntent:', cancelError);
      }
      throw paymentError;
    }

    // 8. Update payment_request_members with intent ID and payment ID
    await supabase
      .from('payment_request_members')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_id: payment.id,
      })
      .eq('id', payment_request_member_id);

    // 9. Return response
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        amount: member.amount_pence,
        currency: 'GBP',
        payment_intent_id: paymentIntent.id,
        payment_id: payment.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // PO DECISION: Comprehensive error handling with potential rollback
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'STRIPE_ERROR',
          message: 'Failed to create payment intent',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
