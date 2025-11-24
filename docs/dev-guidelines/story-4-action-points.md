# Story 4 Lessons: Action Points Summary

## MANDATORY for Every Story Going Forward

### 1. Before Writing ANY Code

**The "What Will Break?" Analysis**

- List 5-10 failure modes
- Define prevention, detection, and recovery for each
- Get user approval on approach

### 2. Defensive Logging Pattern

```typescript
// EVERY operation that could fail:
logger.info('Starting operation', { stateBefore, attempting });
try {
  const result = await operation();
  logger.info('Success', { stateBefore, stateAfter: result });
} catch (error) {
  logger.error('Failed', { stateBefore, attempted, error });
}
```

### 3. Test Failures FIRST

```typescript
// Test order:
it('should handle Stripe timeout'); // FIRST
it('should handle invalid input'); // SECOND
it('should handle database failure'); // THIRD
it('should process payment successfully'); // LAST
```

### 4. Version Control Discipline

- ALL changes in local files FIRST
- NEVER make direct database changes
- Test locally before remote
- Commit working code frequently

### 5. Evidence-Based Completion

Instead of: "Perfect! Done!"
Provide:

```
✅ Tested: Stripe timeout handling
✅ Tested: Database rollback
✅ Tested: Error messages
✅ Lint: 0 errors
✅ Types: 0 errors
```

## Quick Checklist for Developers

### Start of Story

- [ ] Read ONLY the story file (not 15 documents)
- [ ] List what could break
- [ ] Plan tests before coding
- [ ] Get user approval on approach

### During Development

- [ ] Log state BEFORE operations
- [ ] Handle ALL error cases
- [ ] Test failures first
- [ ] Keep changes in local files

### Before "Done"

- [ ] Show test evidence
- [ ] Verify logs are debuggable
- [ ] Update story documentation
- [ ] Run lint and type checks

## The Core Principle

**"Short-term pessimism for long-term optimism"**

Assume it will break → Build defenses → Sleep peacefully

## Remember

- Finding problems early = Victory 🎉
- Finding problems in production = Failure 🚨
- Every untested edge case = Future 3 AM call
- Every missing log = Undebuggable production issue

## Story 4's Biggest Lesson

**Process exists to prevent predictable failures.**
**Skipping process to "save time" costs 10x more time.**
