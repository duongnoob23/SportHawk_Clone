# Common Mistakes Reference

## Purpose

Quick reference to prevent the most common and costly errors based on 4,155 lines of historical debugging.

## Critical Violations (Check Every Time)

### 1. Magic Values

```typescript
// ❌ WRONG - Magic values
backgroundColor: 'rgba(0,0,0,0.3)';
padding: 20;
marginTop: 16;
fontSize: 18;
color: '#EABD22';

// ✅ CORRECT - Config values
backgroundColor: colorPalette.cardBackground;
padding: spacing.xl;
marginTop: spacing.lg;
fontSize: fontSizes.lg;
color: colorPalette.primary;
```

### 2. Import Paths

```typescript
// ❌ WRONG - Relative paths
import { ShButton } from '../../../components/ShButton';
import { colors } from '../../config/colors';

// ✅ CORRECT - Alias paths
import { ShButton } from '@top/components/ShButton';
import { colorPalette } from '@cfg/colors';
```

### 3. StyleSheet in Screens

```typescript
// ❌ WRONG - StyleSheet in screen files
// app/payments/[id]/index.tsx
const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24 }
})

// ✅ CORRECT - Component-only styling
// app/payments/[id]/index.tsx
<ShScreenContainer>
  <ShPaymentTitle title={payment.title} />
</ShScreenContainer>

// Components handle ALL styling internally
```

### 4. Component Props

```typescript
// ❌ WRONG - Guessing prop names
<ShInput onChangeValue={setValue} />
<ShButton title="Submit" />

// ✅ CORRECT - Verify actual interface
<ShInput onChange={setValue} />  // Check interface first!
<ShButton label="Submit" />      // Use correct prop name
```

### 5. Database Relationships

```typescript
// ❌ WRONG - Assuming foreign keys exist
.from('payment_requests')
.select('*, profiles:created_by(*)')

// ✅ CORRECT - Verify FK first
// First: Check FK exists with execute_sql
// Then: Use correct syntax
.from('payment_requests')
.select('*, profiles!payment_requests_created_by_fkey(*)')
```

### 6. Icon Names

```typescript
// ❌ WRONG - Guessing icon names
IconName.ArrowLeft;
IconName.MoreVertical;
IconName.CheckMark;

// ✅ CORRECT - Use exact names from config
IconName.BackArrow; // Verified from icons.ts
IconName.Edit; // Actual name in enum
IconName.Checkmark; // Note: lowercase 'm'
```

### 7. Flex Layout Issues

```typescript
// ❌ WRONG - flex: 1 on content containers
const styles = StyleSheet.create({
  descriptionContainer: {
    flex: 1, // Creates huge gaps!
  },
});

// ✅ CORRECT - Intrinsic height
const styles = StyleSheet.create({
  descriptionContainer: {
    // No flex - height based on content
  },
});
```

### 8. Typography Variants

```typescript
// ❌ WRONG - Incorrect casing
ShTextVariant.SubHeading; // Wrong case
ShTextVariant.body; // Wrong case

// ✅ CORRECT - Exact constants
ShTextVariant.Subheading; // Lowercase 'h'
ShTextVariant.Body; // Uppercase 'B'
```

### 9. Color Usage

```typescript
// ❌ WRONG - Hardcoded colors
color: '#FFFFFF';
backgroundColor: 'white';
borderColor: 'rgba(255,255,255,0.2)';

// ✅ CORRECT - Color palette
color: colorPalette.lightText;
backgroundColor: colorPalette.cardBackground;
borderColor: colorPalette.border;
```

### 10. Completion Messages

```typescript
// ❌ WRONG - Overconfident declarations
'Perfect! Implementation complete!';
'Excellent! Everything works flawlessly!';
'All done perfectly!';

// ✅ CORRECT - Accurate status
'Ready for review. Lint and type checks passed.';
'Completed 3 components. All checks passed.';
'Implementation complete. Ready for testing.';
```

## Database Column Names

Common mismatches to verify:

- `image_url` vs `team_photo_url` (teams table)
- `avatar_url` vs `profile_photo_uri` (profiles table)
- `name` vs `first_name + last_name` (profiles table)
- Always check exact column names with SQL query first

## Component Creation Rules

Before creating ANY new component:

1. Check if similar component exists
2. Look at existing Sh components for patterns
3. NO StyleSheet in the component file - use separate styles file
4. Export from index file
5. Follow exact folder structure of existing components

## Form Validation Patterns

```typescript
// ❌ WRONG - Show errors immediately
const [error, setError] = useState('Field is required');

// ✅ CORRECT - Show errors after interaction
const [touched, setTouched] = useState(false);
const [error, setError] = useState('');
// Only show error if touched && invalid
```

## SafeAreaView Exception

The ONLY allowed StyleSheet in screens:

```typescript
// This is the ONLY acceptable StyleSheet in a screen file
<SafeAreaView style={{ flex: 1 }}>
  {/* All other styling via components */}
</SafeAreaView>
```

## Quick Validation Commands

Before saying "done", run:

```bash
npm run lint          # Must be zero errors
npx tsc --noEmit     # Must be zero type errors
```

## When to STOP and Ask

- Icon name doesn't match expected
- Component prop doesn't work as expected
- Database query returns unexpected error
- Figma style has no semantic name
- Any magic value seems necessary
- Confused about which pattern to follow

## Critical New Patterns (From Story 4 Lessons)

### 11. Database Changes Without Version Control

```typescript
// ❌ WRONG - Direct database changes
// Making changes in Supabase console without local files
await supabase.rpc('create_function', { sql: '...' }); // No local record!

// ✅ CORRECT - Local first, always
// 1. Create migration file locally
// 2. Test locally
// 3. Apply to remote
// 4. Commit to Git
```

### 12. Not Logging State Before Operations

```typescript
// ❌ WRONG - Only logging results
async function updateStatus(id: string, status: string) {
  const result = await db.update(id, { status });
  logger.info('Updated', { result }); // What if it fails? What WAS the state?
}

// ✅ CORRECT - Log before state for debugging
async function updateStatus(id: string, status: string) {
  const before = await db.get(id);
  logger.info('Updating status', { before, attemptedStatus: status });

  try {
    const after = await db.update(id, { status });
    logger.info('Update successful', { before, after });
    return after;
  } catch (error) {
    logger.error('Update failed', { before, attemptedStatus: status, error });
    throw error;
  }
}
```

### 13. Testing Only Happy Paths

```typescript
// ❌ WRONG - Only testing success
it('should process payment', async () => {
  const result = await processPayment(100);
  expect(result.success).toBe(true);
});

// ✅ CORRECT - Test failures first
it('should handle Stripe timeout by queuing retry', async () => {
  mockStripe.timeout();
  const result = await processPayment(100);
  expect(result.queued).toBe(true);
  expect(result.retryAt).toBeDefined();
});
```

### 14. Declaring Success Without Evidence

```typescript
// ❌ WRONG - Overconfident declarations
"Perfect! Everything works flawlessly!"
"Implementation complete and tested!"

// ✅ CORRECT - Factual status with evidence
"Implementation complete. Tests passing:
- ✅ Stripe timeout handling
- ✅ Database rollback on failure
- ✅ User error messages
Lint and type checks passed."
```

## Cost of Common Mistakes

Based on historical data:

- Magic value: ~50 lines of debugging
- Wrong import: ~30 lines of debugging
- StyleSheet in screen: ~100 lines of debugging
- Wrong FK syntax: ~400 lines of debugging
- flex: 1 issue: ~600 lines of debugging
- **Database changes without version control: ~2 days of recovery**
- **No defensive logging: Unable to debug production issues**
- **Testing only happy paths: Production failures**

**Remember: Every mistake prevented saves 30-600 lines of debugging!**
**Story 4 Lesson: Process violations cost DAYS, not hours.**
