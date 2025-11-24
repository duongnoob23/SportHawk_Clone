# Figma-First Development Style

You are working on the SportHawk React Native project where FIGMA IS THE SOURCE OF TRUTH for all UI implementation.

## MANDATORY FIGMA WORKFLOW

Before writing ANY UI component code, you MUST follow this exact sequence:

### Step 1: STOP AND ANNOUNCE

Always start with: "I will now check Figma comprehensively before writing any code."

### Step 2: DOCUMENT ALL PROPERTIES

For EVERY UI element, explicitly document:

```
FIGMA ANALYSIS FOR [Component Name]:
═══════════════════════════════════

📐 TYPOGRAPHY:
- Font Family: [exact value or "not specified"]
- Font Size: [exact value or "not specified"]
- Font Weight: [exact value or "not specified"]
- Line Height: [exact value or "not specified"]
- Letter Spacing: [exact value or "not specified"]
- Text Transform: [exact value or "not specified"]

🎨 COLORS:
- Text Color: [exact value]
- Background: [exact value]
- Border Color: [exact value if present]
- Shadow Color: [exact value if present]

📏 SPACING & LAYOUT:
- Padding: [top, right, bottom, left]
- Margin: [top, right, bottom, left]
- Width: [exact value or "auto"]
- Height: [exact value or "auto"]
- Gap/Spacing between elements: [exact value]

🔄 STATE VARIATIONS:
Default State:
  - [list all properties]
Hover/Pressed State:
  - CHANGES: [what changes]
  - UNCHANGED: [what stays the same]
Disabled State:
  - CHANGES: [what changes]
  - UNCHANGED: [what stays the same]

⚠️ IMPORTANT OBSERVATIONS:
- [Any special behaviors noted]
- [Any animations or transitions]
- [Any conditional rendering]
```

### Step 3: GET APPROVAL

After documenting, ALWAYS ask: "I've documented the Figma properties above. Should I proceed with implementation using these exact values?"

### Step 4: IMPLEMENTATION RULES

When implementing:

1. If Figma doesn't show it, DON'T add it (no assumptions!)
2. Use EXACT values from Figma via config files
3. Comment your code with Figma references:
   ```typescript
   // Figma: Button/Primary/Default - 16px padding, 600 weight
   ```

## VIOLATION TRACKING

If you make ANY assumption without checking Figma:

1. Immediately add to LESSONS_LEARNED.md:

   ```markdown
   ## [Date] - Figma Assumption Violation

   - Component: [name]
   - Assumption: [what you assumed]
   - Actual Figma spec: [what it actually was]
   - Impact: Rework required
   ```

## EXAMPLES OF VIOLATIONS

❌ "I'll make the text bold since it's a heading" (without checking Figma)
❌ "Buttons typically have 16px padding" (assuming instead of checking)
❌ "I'll add a hover effect" (if Figma doesn't show one)
❌ "This looks like it needs a border" (visual assumption)

## EXAMPLES OF COMPLIANCE

✅ "Figma shows font-weight: 400, not bold, so I won't add bold"
✅ "Figma specifies exactly 12px padding, using spacing.md"
✅ "No hover state shown in Figma, so not implementing one"
✅ "Figma shows no border, keeping it borderless"

## MANDATORY OUTPUT FORMAT

Your responses when implementing UI MUST follow this structure:

1. **Figma Check**: "Checking Figma for [component]..."
2. **Properties List**: Complete documentation as shown above
3. **Config Mapping**: Show how each Figma value maps to config
4. **Implementation**: Code with Figma reference comments
5. **Verification**: "Verified against Figma node [ID]"

Remember: FIGMA IS ALWAYS RIGHT. Your assumptions are ALWAYS WRONG.
