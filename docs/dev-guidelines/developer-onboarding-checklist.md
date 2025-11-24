# SportHawk Developer Onboarding Checklist

## 🎯 Priority 1: Understanding the Figma Translation Process

### Before You Write ANY Code:

- [ ] **READ**: `/docs/dev-guidelines/figma-translation-process.md` - This is MANDATORY
- [ ] **UNDERSTAND**: Figma Translation documents are your PRIMARY source, not reference
- [ ] **COMMIT**: Never write components from scratch when a translation exists

### The Golden Rule:

> **Every story has a Figma Translation document. Start there. Copy the code. Don't reinvent.**

## 📋 Essential Documents to Read (In Order)

### 1. Process & Methodology

- [ ] `/docs/dev-guidelines/figma-translation-process.md` - **START HERE**
- [ ] `/docs/dev-guidelines/component-usage-guide.md` - How to use SportHawk components
- [ ] `/docs/dev-guidelines/form-development-checklist.md` - Form implementation standards

### 2. Architecture & Standards

- [ ] `/docs/architecture/coding-standards.md` - Code style and conventions
- [ ] `/docs/architecture/tech-stack.md` - Technology choices and versions
- [ ] `/docs/architecture/component-interfaces.md` - Component API reference
- [ ] `/docs/architecture/ui-patterns.md` - UI implementation patterns
- [ ] `/docs/architecture/source-tree.md` - Project structure

### 3. Learn from Mistakes

- [ ] `/docs/mistakes/view-payment-mistakes1.md` - Real example of why Translation docs matter

## 🚀 Your First Story Implementation

### Step 1: Receive Story Assignment

- [ ] Locate your story in `/docs/stories/[STORY-ID]-*.md`
- [ ] Read the CRITICAL DEVELOPER INSTRUCTION section at the top
- [ ] Note the Figma Translation document path

### Step 2: Open the RIGHT Document First

- [ ] **OPEN**: `/docs/stories/[STORY-ID]-figma-translation-*.md`
- [ ] **NOT**: The Figma design file
- [ ] **NOT**: Writing code from scratch

### Step 3: Copy the Implementation

- [ ] Copy the complete component code from the translation
- [ ] Copy all imports exactly as shown
- [ ] Copy type definitions if provided
- [ ] Do NOT "improve" or refactor the code

### Step 4: Integrate

- [ ] Paste into your target file location
- [ ] Make only necessary integration adjustments
- [ ] Ensure all values come from config files (no magic values)

### Step 5: Verify

- [ ] Run TypeScript compilation: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Test the implementation
- [ ] Confirm it matches the Figma design

## ⚠️ Critical Warnings

### NEVER Do These:

1. ❌ Write components by looking at Figma designs
2. ❌ Create "better" implementations than the translation
3. ❌ Use hardcoded values (colors, sizes, text)
4. ❌ Skip the Figma Translation document
5. ❌ Assume you know better than the tested translation

### ALWAYS Do These:

1. ✅ Start with the Figma Translation document
2. ✅ Copy code exactly as provided
3. ✅ Use config values for everything
4. ✅ Follow the established patterns
5. ✅ Ask if a translation seems wrong (don't work around it)

## 🏗️ Project-Specific Context

### Design System

- All components prefixed with `Sh` (SportHawk)
- Colors from `/config/colors.ts` - use `colorPalette.*`
- Spacing from `/config/spacing.ts`
- Typography from `/config/fonts.ts`

### Component Libraries

- Base components: `/components/base/*`
- Form components: `/components/form/*`
- Navigation components: Follow existing patterns

### Database & Backend

- Supabase for database (types in `/lib/database.types.ts`)
- Stripe Connect for payments (Stories 4+ for backend)
- API routes follow Next.js App Router patterns

## 📝 Story Workflow

1. **Story Assignment** → Check `/docs/stories/`
2. **Find Translation** → Look for `[STORY-ID]-figma-translation-*.md`
3. **Copy Implementation** → Use the complete code provided
4. **Integrate** → Place in correct file location
5. **Test** → Verify against acceptance criteria
6. **Submit** → PR with reference to translation doc used

## 🤝 Getting Help

### If Translation Document is Missing:

- STOP - Don't proceed
- Notify Product Owner immediately
- Wait for translation to be created

### If Translation Seems Wrong:

- DON'T work around it
- DON'T create your own version
- DO raise with Product Owner for clarification

### If You're Unsure:

- Check existing implementations for patterns
- Reference the architecture documents
- Ask rather than guess

## ✅ Onboarding Complete Checklist

Before starting your first story:

- [ ] Read all Process & Methodology docs
- [ ] Understand the Figma Translation process
- [ ] Review architecture documents
- [ ] Examined PAY-002 mistakes document
- [ ] Located story and translation documents
- [ ] Committed to copying, not creating

## 🎉 Welcome to SportHawk!

Remember: **The Figma Translation documents are your friends. They contain complete, tested implementations that save you hours of work.**

Your first story should take minutes to implement, not hours, because the code is already written for you in the translation document.

---

_Last Updated: After PAY-002 Process Improvements_
_Onboarding Owner: Product Owner Team_
