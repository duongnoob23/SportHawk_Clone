# Claude Code Enforcement System - Updated Documentation

## ✅ What Actually Works

After testing and fixing, here's what the enforcement system can actually do:

## 🔧 Working Hooks

### 1. **Pre-Edit Hook** (`hooks/pre-edit.sh`)

✅ **What it CAN do:**

- Detect when editing TypeScript/JavaScript files
- Remind about using config files for components
- Warn when editing sensitive files (.env, configs)
- Suggest creating .research.md for documentation
- Provide helpful reminders about CLAUDE.md rules

❌ **What it CANNOT do:**

- Check if you wrote "STOP 1, 2, 3" (can't see Claude's messages)
- Force you to research first (can't see your context)
- Block edits (only warns)

### 2. **Post-Edit Hook** (`hooks/post-edit.sh`)

✅ **What it CAN do:**

- Detect magic values in code (hardcoded colors, spacing, etc.)
- Check component naming conventions (Sh prefix)
- Find TODO comments
- Suggest running linting
- Log violations to LESSONS_LEARNED.md

❌ **What it CANNOT do:**

- Automatically run linting (would slow down every edit)
- Fix issues automatically
- Know if you checked Figma first

### 3. **Pre-Bash Hook** (`hooks/pre-bash.sh`)

✅ **What it CAN do:**

- Detect trial-and-error patterns (npm install --force, rm -rf node_modules)
- Warn about risky commands
- Suggest best practices
- Remind about testing after installs

❌ **What it CANNOT do:**

- Block dangerous commands (only warns)
- Know if you researched the issue first

### 4. **Magic Value Detector** (`hooks/magic-value-detector.sh`)

✅ **Standalone tool you can run manually:**

```bash
.claude/hooks/magic-value-detector.sh components/
```

- Finds all hardcoded values
- Suggests specific fixes
- Works on entire directories

### 5. **Prompt Logger** (`hooks/prompt-logger.sh`)

⚠️ **Partially working:**

- Creates log file
- Gets transcript path
- May not capture actual prompt text (depends on Claude Code implementation)

## 📊 How Hooks Receive Data

Hooks receive JSON via stdin with this structure:

```json
{
  "session_id": "...",
  "transcript_path": "...",
  "cwd": "...",
  "hook_event_name": "PreToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file",
    "content": "..."
  }
}
```

## 🎯 Realistic Enforcement Strategy

### What Hooks Are Good For:

1. **Education** - Reminding about best practices
2. **Detection** - Finding problems after they happen
3. **Logging** - Tracking patterns over time
4. **Suggestions** - Offering better approaches

### What Hooks CANNOT Do:

1. **See Claude's thought process** - No access to conversation
2. **Block bad code** - Can only warn (exit 0)
3. **Force compliance** - Claude can ignore warnings
4. **Check context** - Can't see if you researched or checked Figma

## 🚀 Recommended Usage

### 1. **Use Hooks for Awareness**

- Let them run in background
- Check their warnings
- Learn from patterns

### 2. **Run Magic Detector Before Commits**

```bash
# Check entire codebase
.claude/hooks/magic-value-detector.sh .

# Check specific directory
.claude/hooks/magic-value-detector.sh components/
```

### 3. **Use Sub-agents for Enforcement**

The `senior-dev` agent has the rules in its system prompt:

```bash
@senior-dev implement the new feature
```

### 4. **Apply Output Styles for UI Work**

The `figma-first` style forces documentation of Figma properties

## 🔄 Future Improvements

### Possible Enhancements:

1. **Create a wrapper script** that monitors Claude's actual output
2. **Use git hooks** for pre-commit enforcement
3. **Build a VSCode extension** for real-time checking
4. **Create GitHub Actions** for CI/CD enforcement

### Current Limitations:

- Hooks can't see Claude's messages or thought process
- Can't block operations (would break Claude Code)
- Limited to data in JSON stdin
- No access to previous context

## 📋 Summary

**The hooks work best as educational tools and detectors, not enforcers.**

They will:

- ✅ Help you remember best practices
- ✅ Catch magic values and naming issues
- ✅ Warn about risky patterns
- ✅ Log violations for review

They won't:

- ❌ Force Claude to follow STOP protocol
- ❌ Block bad code from being written
- ❌ Know if you checked Figma or researched
- ❌ See Claude's reasoning or context

For true enforcement, combine:

1. Hooks for detection
2. Sub-agents for system prompt enforcement
3. Output styles for formatting
4. Manual review of LESSONS_LEARNED.md
5. Git hooks or CI/CD for final validation
