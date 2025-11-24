# Progressive Documentation Loading Strategy

## Purpose

Reduce cognitive load and startup time by loading only essential documentation progressively as needed.

## Initial Load (<100 lines total)

Load ONLY these files at story start:

1. The specific story file being implemented
2. `/docs/dev-guidelines/pre-flight-checklist.md`
3. This progressive documentation guide

**DO NOT AUTO-LOAD:**

- Architecture documents
- Coding standards (reference when needed)
- Component interfaces (load during planning)
- Historical stories
- PRD sections

## Phase 1: Planning (Before Coding)

Load these ONLY during component planning phase:

- `/config/colors.ts` - For Figma color mapping
- `/config/spacing.ts` - For Figma spacing mapping
- `/config/typography.ts` - For Figma text style mapping
- `/config/icons.ts` - For icon name verification
- Specific component interfaces being used

## Phase 2: Implementation (While Coding)

Load ON-DEMAND only when:

- Creating new component → Load `/docs/architecture/component-interfaces.md`
- Uncertain about pattern → Load `/docs/architecture/ui-patterns.md`
- Database work → Load relevant schema sections
- Import conventions → Load `/docs/architecture/coding-standards.md#imports`

## Phase 3: Validation (Before Completion)

Reference for final checks:

- `/docs/architecture/coding-standards.md` - Compliance verification
- Story acceptance criteria - Completeness check

## Never Auto-Load Unless Explicitly Requested

These should NEVER be loaded automatically:

- Full PRD document
- All architecture documents at once
- Historical mistake documents
- Other epic files
- Previous story implementations (unless directly relevant)
- Test files from other features

## Loading Decision Tree

```
Need information?
├─ Is it about current story requirements?
│  └─ Already loaded (story file)
├─ Is it about component props?
│  └─ Load specific component interface only
├─ Is it about styling patterns?
│  └─ Load ui-patterns.md section only
├─ Is it about config values?
│  └─ Load specific config file only
├─ Is it about database schema?
│  └─ Query database directly, don't load docs
└─ Unsure what to load?
   └─ ASK USER - don't guess

```

## Rationale

- 2,500+ lines → 100 lines initial load (96% reduction)
- Faster startup and context switching
- Reduced chance of confusion from unrelated docs
- More focused attention on current task

## Measuring Success

Track per story:

- Lines of documentation loaded
- Number of documentation loads
- Time to first code written
- Number of clarification requests

Target metrics:

- <500 total lines loaded per story
- <10 document loads per story
- <5 minutes to planning phase complete
- <3 clarification requests per story

## Progressive Loading Commands

When you need information, explicitly request:

- "Load component interface for ShButton"
- "Load spacing constants only"
- "Load database schema for payments table"
- "Check coding standard for imports"

Never say:

- "Load all architecture docs"
- "Load everything about components"
- "Give me all the context"

## Remember

- Less is more at the start
- Load only what's needed when needed
- Ask user if unsure what to load
- Focus beats comprehensive knowledge
