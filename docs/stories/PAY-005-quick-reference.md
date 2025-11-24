# PAY-005 Quick Reference Card

## 🎯 Essential Info

**Screen:** `/app/payments/[id]/index.tsx`  
**Figma:** Node 559-3055  
**Imports:** Use aliases in `/app`, relative paths in `/components`

## 🔑 Key Files

```
/app/payments/[id]/index.tsx          # Main implementation
/config/payments.ts                    # Constants & messages
/lib/api/payments.ts                   # API helpers
/supabase/functions/stripe-create-payment  # Edge Function
```

## 💳 Test Cards

```
✅ Success:        4242 4242 4242 4242
❌ Declined:       4000 0000 0000 0002
💸 Insufficient:   4000 0000 0000 9995
📅 Expired:        4000 0000 0000 0069
🔒 Wrong CVC:      4000 0000 0000 0127
```

## 🐛 Debug Commands

```bash
# Watch Edge Function logs
npx supabase functions logs stripe-create-payment --tail

# Check payment status in DB
SELECT * FROM payment_request_members WHERE id = 'xxx';

# Test Edge Function directly
curl -X POST [PROJECT_URL]/functions/v1/stripe-create-payment \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{"payment_request_member_id": "test", "amount_pence": 1000}'
```

## 📊 Payment States

```typescript
PAYMENT_FLOW_STATUS.IDLE; // Ready to pay
PAYMENT_FLOW_STATUS.CREATING_INTENT; // Calling Edge Function
PAYMENT_FLOW_STATUS.SHEET_PRESENTED; // Stripe UI open
PAYMENT_FLOW_STATUS.PROCESSING; // Payment processing
PAYMENT_FLOW_STATUS.SUCCESS; // Payment complete
PAYMENT_FLOW_STATUS.ERROR; // Payment failed
```

## ⚠️ Common Issues

| Issue                  | Solution                  |
| ---------------------- | ------------------------- |
| No payment sheet       | Check client_secret valid |
| Payment fails silently | Check Edge Function logs  |
| Status not updating    | Verify webhook configured |
| Apple Pay not working  | Real device + merchant ID |

## ✅ Success Verification

```sql
-- Quick check if payment worked
SELECT payment_status, paid_at, stripe_payment_intent_id
FROM payment_request_members WHERE id = '<ID>';
-- Should show: 'paid', timestamp, 'pi_xxx'
```

## 🚨 Emergency Contacts

- **Stripe Issues:** Check dashboard.stripe.com/test
- **DB Issues:** Supabase Dashboard → SQL Editor
- **Urgent:** Post in #dev-emergency

## 📝 Remember

1. NEVER expose secret keys
2. Test on REAL device (not Expo Go)
3. Use test mode Stripe keys
4. Log everything during development
5. Remove logs before production
