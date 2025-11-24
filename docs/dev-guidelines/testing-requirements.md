# Testing Requirements & Philosophy

## Core Principle: Test Failure Before Success

**Always test what can go wrong before testing what should go right.**

## Mandatory Testing Coverage

### 1. Failure Mode Testing (FIRST Priority)

Every feature must have tests for:

- [ ] External service failures (Stripe down, Supabase timeout)
- [ ] Network failures and timeouts
- [ ] Invalid/malformed input data
- [ ] Missing required data
- [ ] Concurrent operation conflicts
- [ ] Permission/authorization failures
- [ ] Resource exhaustion (rate limits, quotas)

### 2. State Verification Testing

- [ ] Verify state BEFORE operation
- [ ] Verify state AFTER operation
- [ ] Verify partial failure rollback
- [ ] Verify idempotency (running twice = same result)

### 3. Happy Path Testing (LAST Priority)

Only after all failure modes are tested:

- [ ] Standard user flow
- [ ] Expected inputs and outputs
- [ ] Performance within acceptable limits

## Test Naming Convention

Tests must clearly state what they prove:

```typescript
// GOOD - Clear about what's being tested and why
it('should handle payment when Stripe returns 500 error by queuing for retry', async () => {});
it('should rollback database changes when payment fails after user update', async () => {});
it('should log full context when authentication timeout occurs', async () => {});

// BAD - Vague and unhelpful
it('should work', async () => {});
it('handles errors', async () => {});
it('processes payment', async () => {});
```

## Evidence Requirements

Every test must provide evidence it ran:

```typescript
it('should handle Stripe timeout gracefully', async () => {
  // Setup
  mockStripe.timeout();
  const consoleSpy = jest.spyOn(console, 'log');

  // Execute
  const result = await processPayment(100);

  // Verify - EVIDENCE that it handled correctly
  expect(result.status).toBe('queued_for_retry');
  expect(result.errorHandled).toBe('stripe_timeout');
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('Stripe timeout detected')
  );

  // Verify defensive logging worked
  const logs = consoleSpy.mock.calls;
  expect(logs.some(log => log[0].includes('stateBefore'))).toBe(true);
  expect(logs.some(log => log[0].includes('error'))).toBe(true);
  expect(logs.some(log => log[0].includes('recovery'))).toBe(true);
});
```

## The "Proof of Life" Test Pattern

### Step 1: Prove It's Broken

```typescript
it('should fail without proper error handling', async () => {
  const unprotectedFunction = async () => {
    const result = await riskyOperation();
    return result.data; // Will throw if result is null
  };

  mockRiskyOperation.returnNull();
  await expect(unprotectedFunction()).rejects.toThrow();
});
```

### Step 2: Prove The Fix Works

```typescript
it('should handle null response gracefully', async () => {
  const protectedFunction = async () => {
    try {
      const result = await riskyOperation();
      return result?.data || 'default_value';
    } catch (error) {
      logger.error('Operation failed', { error });
      return 'fallback_value';
    }
  };

  mockRiskyOperation.returnNull();
  const result = await protectedFunction();
  expect(result).toBe('default_value');
});
```

## Integration Test Requirements

### Database Operations

- [ ] Test with missing required fields
- [ ] Test with invalid foreign keys
- [ ] Test concurrent updates to same record
- [ ] Test transaction rollback on partial failure
- [ ] Verify all migrations are idempotent

### External Services (Stripe, etc.)

- [ ] Test with service completely down
- [ ] Test with slow response (timeout)
- [ ] Test with invalid credentials
- [ ] Test with rate limit exceeded
- [ ] Test with partial success (some operations succeed, others fail)

### User Interface

- [ ] Test rapid repeated clicks
- [ ] Test navigation during loading
- [ ] Test with very slow network
- [ ] Test with intermittent connectivity
- [ ] Test with invalid/expired session

## Test Documentation

Each test file must include:

```typescript
/**
 * Test Suite: Payment Processing
 *
 * What This Tests:
 * - Payment creation with Stripe
 * - Database transaction atomicity
 * - Error recovery mechanisms
 *
 * Failure Modes Covered:
 * - Stripe API timeout
 * - Invalid payment amounts
 * - Database connection loss
 * - Concurrent payment attempts
 *
 * What This Proves:
 * - Payments never double-charge
 * - Failed payments rollback completely
 * - Users receive clear error messages
 * - System logs contain debugging context
 */
```

## Running Tests

### Before Every Commit

```bash
npm run test:unit       # Must pass 100%
npm run test:integration # Must pass 100%
npm run lint            # Zero errors
npx tsc --noEmit       # Zero type errors
```

### Test Output Requirements

- [ ] Show what was tested
- [ ] Show what passed/failed
- [ ] Include timing information
- [ ] Include coverage percentage
- [ ] Log any skipped tests with reasons

## The "Can't Break It" Challenge

Before declaring any feature complete, try to break it:

1. What happens if I click submit 10 times rapidly?
2. What if I navigate away mid-operation?
3. What if my network dies halfway through?
4. What if the database is slow?
5. What if another user modifies the same data?

If you can break it, the tests are incomplete.

## Remember

**Every test you write prevents a 3 AM support call.**

Testing is not about proving code works - it's about proving code survives.
