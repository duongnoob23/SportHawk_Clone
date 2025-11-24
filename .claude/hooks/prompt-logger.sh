#!/bin/bash

# Prompt Logger Hook: Logs user prompts from UserPromptSubmit events
# Reads JSON from stdin as provided by Claude Code

# Colors for stderr output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4"
LOG_FILE="$PROJECT_ROOT/private-prompt-log.md"

# Read JSON from stdin
JSON_INPUT=$(cat)

# Parse JSON using Python to get the transcript path and prompt
TRANSCRIPT_PATH=$(echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('transcript_path', ''))
except:
    print('')
" 2>/dev/null)

# For UserPromptSubmit, the prompt might be in tool_input or another field
USER_PROMPT=$(echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    # Try different possible locations for the prompt
    prompt = data.get('prompt', '') or data.get('user_prompt', '') or data.get('message', '')
    if not prompt and 'tool_input' in data:
        prompt = data['tool_input'].get('prompt', '') or data['tool_input'].get('message', '')
    print(prompt)
except:
    print('')
" 2>/dev/null)

# Function to ensure log file exists
init_log_file() {
    if [ ! -f "$LOG_FILE" ]; then
        cat > "$LOG_FILE" << 'EOF'
# Private Prompt Log

This file contains an archive of all user prompts for this project.
**Note**: This file is for the user's records only. Claude should reference CLAUDE.md, LESSONS_LEARNED.md, and /docs for guidance.

---

EOF
        echo -e "${BLUE}📝 Created new prompt log file${NC}" >&2
    fi
}

# Function to log the prompt
log_prompt() {
    local prompt="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Only log if we have actual content
    if [ -n "$prompt" ]; then
        cat >> "$LOG_FILE" << EOF

## [$timestamp]

$prompt

---
EOF
        echo -e "${GREEN}✓ Prompt logged to private-prompt-log.md${NC}" >&2
    else
        # If we can't extract the prompt, log that we tried
        echo -e "${YELLOW}ℹ️  UserPromptSubmit event received but couldn't extract prompt${NC}" >&2
        
        # Debug: show what we received (first 200 chars)
        if [ -n "$JSON_INPUT" ]; then
            echo -e "${YELLOW}   Debug: JSON keys received:${NC}" >&2
            echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('   Keys:', list(data.keys())[:5])
except Exception as e:
    print('   Could not parse JSON:', str(e))
" >&2
        fi
    fi
}

# Main execution
init_log_file

if [ -n "$USER_PROMPT" ]; then
    log_prompt "$USER_PROMPT"
else
    # Log transcript path info if available
    if [ -n "$TRANSCRIPT_PATH" ]; then
        echo -e "${BLUE}ℹ️  Transcript available at: ${TRANSCRIPT_PATH}${NC}" >&2
    fi
fi

# Always exit 0
exit 0