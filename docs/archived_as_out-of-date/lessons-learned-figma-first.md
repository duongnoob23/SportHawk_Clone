# Lessons Learned: Figma-First Implementation

**Date:** 2025-08-11  
**Issue:** Critical process failure in V4 development  
**Impact:** High - Rework required for authentication screens

## The Incident

### What Happened

During Epic 0 Task 5 (Auth Layout Protection), the AI developer:

1. Created placeholder home, profile, and settings screens WITHOUT consulting Figma
2. Updated SignIn and VerifyEmail screens WITHOUT first checking Figma designs
3. Only consulted Figma AFTER human intervention pointed out the error

This directly contradicted one of the key lessons from V3's failure.

### Timeline

1. **Initial Implementation**: Created auth protection and screens based on assumptions
2. **Human Intervention**: "Did you check Figma (via MCP) for the visual design?"
3. **Discovery**: Realized Figma was never consulted
4. **Correction**: Fetched Figma designs and rebuilt screens to match

## Root Cause Analysis

### Primary Cause

**Process Gap**: Despite V3 documenting "failing to use Figma as visual design" as a war story, the development plan didn't explicitly mandate Figma consultation as the FIRST step.

### Contributing Factors

1. **Assumption-Based Development**: AI assumed it knew what screens should look like
2. **Missing Process Check**: No automated reminder to check Figma first
3. **Documentation Ambiguity**: Plan mentioned Figma but didn't make it mandatory
4. **Eagerness to Code**: Jumped straight into implementation

## Impact Assessment

### What Was Wrong

1. SignIn screen lacked:
   - Logo in bordered container
   - Proper subtitle text
   - Google sign-in button (even if commented)
   - Correct layout and spacing

2. VerifyEmail screen completely wrong:
   - Had placeholder text instead of 6-digit OTP boxes
   - Missing countdown timer
   - Wrong visual hierarchy
   - No email display section

### Effort Wasted

- ~30 minutes creating wrong implementations
- ~20 minutes fixing implementations
- Trust erosion in AI's ability to follow process

## Corrective Actions Taken

### Immediate

1. ✅ Rebuilt SignIn screen to match Figma exactly
2. ✅ Created proper VerifyEmail screen with OTP boxes
3. ✅ Added ForgotPassword screen (discovered from SignIn reference)

### Process Updates

1. ✅ Updated development-plan-v4.md:
   - Added "Figma-First Design" as Core Principle #2
   - Made Figma consultation MANDATORY in Epic 1 process
   - Added explicit MCP tool requirements

2. ✅ Updated qa-standards.md:
   - Added "No Figma Consultation" as Critical Issue #1
   - Made it an automatic rejection criterion
   - Added verification step in QA process

3. ✅ Created this lessons-learned document

## Prevention Strategy

### For AI Developers

1. **BEFORE implementing ANY screen**:

   ```
   Step 1: Get node ID from sequenced_screen_list.md
   Step 2: Call mcp__figma-dev-mode-mcp-server__get_image(nodeId)
   Step 3: Call mcp__figma-dev-mode-mcp-server__get_code(nodeId)
   Step 4: ONLY THEN start implementation
   ```

2. **Mental Checklist**:
   - Have I seen the Figma design? ❓
   - Do I have the visual reference? ❓
   - Have I extracted the specifications? ❓
   - If any answer is NO → STOP and get Figma first

### For Human Oversight

1. Ask "Show me the Figma design you're implementing"
2. Verify MCP tool usage in conversation history
3. Reject any implementation without Figma evidence

### For QA Process

1. First QA check: "Was Figma consulted?"
2. Look for MCP tool calls in implementation history
3. Compare implementation visually with Figma
4. Reject if no Figma consultation evidence

## Key Takeaways

### The Golden Rule

**"No Screen Without Seeing The Design First"**

### Why This Matters

1. **V3 Failed** partly because of not using Figma
2. **Assumptions ≠ Requirements**
3. **Visual Design Is Not Optional**
4. **Process Discipline Prevents Rework**

### What Success Looks Like

Every screen implementation should show:

1. MCP Figma tool calls in history
2. Visual match to Figma design
3. Component extraction from Figma
4. No assumptions about appearance

## Metrics to Track

1. **Figma Consultation Rate**: % of screens checking Figma first
2. **Visual Match Score**: How closely implementations match designs
3. **Rework Due to Figma**: Hours spent fixing non-Figma implementations
4. **QA Rejections**: How many for "No Figma Consultation"

## The Commitment

From this point forward:

- **EVERY** screen starts with Figma
- **NO** visual assumptions allowed
- **ALWAYS** use MCP to fetch designs
- **NEVER** skip the visual reference

## Conclusion

This incident reinforces that even with documented lessons from V3, process discipline is essential. The failure to consult Figma first—despite it being a known issue from V3—shows that explicit, mandatory process steps are necessary.

The updates to development-plan-v4.md and qa-standards.md now make Figma consultation:

1. Mandatory
2. Verifiable
3. Rejectable if skipped

This should prevent any future occurrences of building screens without visual design reference.

---

_"Those who cannot remember the past are condemned to repeat it."_  
_- George Santayana_

_In our case: Those who don't check Figma first are condemned to rebuild it._
