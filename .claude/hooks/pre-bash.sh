#!/bin/bash

# Pre-Bash Hook: Provides guidance for bash commands
# Reads JSON from stdin as provided by Claude Code

# Colors for stderr output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4"
LESSONS_FILE="$PROJECT_ROOT/LESSONS_LEARNED.md"

# Read JSON from stdin
JSON_INPUT=$(cat)

# Parse JSON using Python
COMMAND=$(echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)

# Log to stderr
echo -e "${BLUE}🔍 Pre-Bash Hook: ${COMMAND:0:50}...${NC}" >&2

# Function to detect trial-and-error patterns
check_trial_and_error() {
    local cmd="$1"
    
    # Patterns that suggest trial-and-error debugging
    if echo "$cmd" | grep -E "npm install.*--force|npm install.*--legacy" > /dev/null; then
        echo -e "${YELLOW}⚠️  Trial-and-error pattern detected: force install${NC}" >&2
        echo -e "${YELLOW}   Consider: Research the actual dependency conflict first${NC}" >&2
        return 1
    fi
    
    if echo "$cmd" | grep -E "rm -rf node_modules" > /dev/null; then
        echo -e "${YELLOW}⚠️  Nuclear option detected: removing node_modules${NC}" >&2
        echo -e "${YELLOW}   Consider: Check package-lock.json for conflicts first${NC}" >&2
        return 1
    fi
    
    if echo "$cmd" | grep -E "npm cache clean|npm cache verify" > /dev/null; then
        echo -e "${YELLOW}⚠️  Cache clearing detected${NC}" >&2
        echo -e "${YELLOW}   This rarely solves the actual problem${NC}" >&2
        return 1
    fi
    
    if echo "$cmd" | grep -E "expo start.*--clear|watchman watch-del" > /dev/null; then
        echo -e "${YELLOW}⚠️  Cache clearing pattern for Expo/React Native${NC}" >&2
        echo -e "${YELLOW}   Consider: Check for actual code issues first${NC}" >&2
        return 1
    fi
    
    return 0
}

# Function to suggest best practices
suggest_best_practices() {
    local cmd="$1"
    
    # Check for npm install without exact versions
    if echo "$cmd" | grep -E "npm install [^@]+" > /dev/null; then
        echo -e "${BLUE}💡 Tip: Consider using exact versions with @${NC}" >&2
        echo -e "${BLUE}   Example: npm install package@1.2.3${NC}" >&2
    fi
    
    # Check for global installs
    if echo "$cmd" | grep -E "npm install -g|npm i -g" > /dev/null; then
        echo -e "${YELLOW}⚠️  Global npm install detected${NC}" >&2
        echo -e "${YELLOW}   Consider: Use npx or local dev dependencies instead${NC}" >&2
    fi
    
    # Check for rm commands
    if echo "$cmd" | grep -E "^rm " > /dev/null; then
        echo -e "${YELLOW}⚠️  File deletion detected${NC}" >&2
        echo -e "${YELLOW}   Make sure this won't break the build${NC}" >&2
    fi
}

# Function to remind about testing
remind_testing() {
    local cmd="$1"
    
    # After npm install, remind to test
    if echo "$cmd" | grep -E "npm install|npm i" > /dev/null; then
        echo -e "${GREEN}📋 After install, remember to:${NC}" >&2
        echo -e "${GREEN}   • Run 'npm run lint'${NC}" >&2
        echo -e "${GREEN}   • Test the app still works${NC}" >&2
    fi
}

# Function to log suspicious patterns
log_if_suspicious() {
    local cmd="$1"
    
    if check_trial_and_error "$cmd"; then
        # Log to LESSONS_LEARNED.md
        echo -e "\n## $(date '+%Y-%m-%d %H:%M:%S') - Trial-and-Error Pattern" >> "$LESSONS_FILE"
        echo "- **Command**: \`${cmd:0:100}\`" >> "$LESSONS_FILE"
        echo "- **Suggestion**: Research root cause before trying fixes" >> "$LESSONS_FILE"
    fi
}

# Main execution
if [ -n "$COMMAND" ]; then
    check_trial_and_error "$COMMAND"
    suggest_best_practices "$COMMAND"
    remind_testing "$COMMAND"
    # Don't log every command, only suspicious ones
    # log_if_suspicious "$COMMAND"
else
    echo -e "${YELLOW}⚠️  Could not parse command from hook input${NC}" >&2
fi

# Always exit 0 - this is advisory only
echo -e "${GREEN}✅ Pre-bash check complete${NC}" >&2
exit 0