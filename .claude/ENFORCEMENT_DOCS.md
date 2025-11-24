# Claude Code Enforcement System Documentation

## Overview

This enforcement system mechanically ensures Claude follows the CLAUDE.md rules through hooks, agents, and output styles rather than relying on Claude to remember instructions.

## 🔧 Hooks System

### 1. Pre-Edit Hook (`hooks/pre-edit.sh`)

**Blocks file edits unless Claude has:**

- ✅ Documented STOP 1: Error analysis
- ✅ Documented STOP 2: Verification steps
- ✅ Documented STOP 3: Pre-change checks
- ✅ Created research documentation for fixes

**Enforcement:** Hard block - edits will fail without compliance

### 2. Post-Edit Hook (`hooks/post-edit.sh`)

**Automatically runs after edits to check:**

- 🔧 Linting (runs `npm run lint`)
- 🎨 Magic values (colors, spacing, fonts)
- 📝 TODO comments
- 🎯 Figma documentation for UI components

**Enforcement:** Fails the edit if linting fails or magic values detected

### 3. Magic Value Detector (`hooks/magic-value-detector.sh`)

**Standalone scanner that detects:**

- Hardcoded colors (`'white'`, `'#eabd22'`)
- Hardcoded dimensions (padding, margins)
- Hardcoded font weights/sizes
- String literal icon names

**Usage:** Can be run manually on any file/directory

```bash
.claude/hooks/magic-value-detector.sh components/
```

### 4. Pre-Bash Hook (`hooks/pre-bash.sh`)

**Monitors commands for trial-and-error patterns:**

- `npm install --force`
- `rm -rf node_modules`
- Cache clearing commands
- Other "desperate fix" patterns

**Enforcement:** Warns and logs to LESSONS_LEARNED.md

### 5. Prompt Logger (`hooks/prompt-logger.sh`)

**Implements CLAUDE.md requirement:**

- Logs all user prompts with timestamps
- Saves to `/private-prompt-log.md`
- For user's archive only

## 🤖 Agents

### Senior Developer Agent (`agents/senior-dev.json`)

A specialized agent that:

- **Enforces** STOP protocol in system prompt
- **Requires** research before fixes
- **Blocks** magic values
- **Demands** Figma verification
- **Limited tools** to prevent shortcuts

**Usage:** Invoke with `@senior-dev` or let it auto-delegate

## 🎨 Output Styles

### Figma-First Style (`output-styles/figma-first.md`)

Forces Claude to:

1. **Announce** Figma check before coding
2. **Document** ALL properties (typography, colors, spacing)
3. **Get approval** before implementing
4. **Comment** code with Figma references
5. **Track violations** in LESSONS_LEARNED.md

## 📋 How to Use This System

### 1. Enable Hooks in Claude Code Settings

Add to your Claude Code configuration to activate hooks at appropriate events.

### 2. Use the Senior Developer Agent

```
@senior-dev implement the new button component
```

### 3. Apply Figma-First Output Style

When working on UI, activate the Figma-first output style for enforced compliance.

### 4. Run Magic Value Detector Regularly

```bash
# Check entire codebase
.claude/hooks/magic-value-detector.sh .

# Check specific directory
.claude/hooks/magic-value-detector.sh components/
```

### 5. Monitor LESSONS_LEARNED.md

Check this file regularly to see what violations have been caught and learn from them.

## 🚨 Enforcement Levels

### Level 1: Warning

- Logs to LESSONS_LEARNED.md
- Allows continuation with warning

### Level 2: Soft Block

- Strong warning with guidance
- Requires acknowledgment
- Tracks strikes

### Level 3: Hard Block

- Operation fails completely
- Must fix issue to proceed
- No workarounds

## 📊 Success Metrics

Track improvement by monitoring:

1. **Reduction in LESSONS_LEARNED.md entries** - Fewer violations over time
2. **Linting pass rate** - Should approach 100%
3. **Magic value detection** - Should find zero violations
4. **Research documentation** - .research.md files created before fixes
5. **Figma compliance** - UI matches designs exactly

## 🔄 Continuous Improvement

1. **Review LESSONS_LEARNED.md weekly** to identify patterns
2. **Update hooks** when new anti-patterns emerge
3. **Refine agent prompts** based on repeated violations
4. **Share successful patterns** in CLAUDE.md

## 💡 Tips for Maximum Effectiveness

1. **Don't disable hooks** even if they seem annoying - they're catching real issues
2. **Use the senior-dev agent** for all complex tasks
3. **Run magic-value-detector** before any PR
4. **Document research** even when not required - it helps Claude learn
5. **Treat violations as learning opportunities** not failures

## 🐛 Troubleshooting

### Hook not triggering?

- Check file permissions: `chmod +x .claude/hooks/*.sh`
- Verify hook is configured in Claude Code settings

### Too many false positives?

- Review and refine the detection patterns
- Add exceptions for legitimate cases
- Document in this file for future reference

### Claude still making mistakes?

- Check if hooks are actually running (check logs)
- Ensure agent is being used (not default Claude)
- Verify output style is active

---

Remember: **These mechanisms make quality automatic, not optional.**
