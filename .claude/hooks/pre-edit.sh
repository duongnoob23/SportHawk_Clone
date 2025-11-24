#!/bin/bash

# Pre-Edit Hook: Provides warnings and guidance before edits
# Reads JSON from stdin as provided by Claude Code

# Colors for stderr output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Read JSON from stdin
JSON_INPUT=$(cat)

# Parse JSON using Python (more reliable than jq dependency)
FILE_PATH=$(echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

TOOL_NAME=$(echo "$JSON_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', ''))
except:
    print('')
" 2>/dev/null)

# Log to stderr for visibility
echo -e "${BLUE}📝 Pre-Edit Hook: ${TOOL_NAME} on ${FILE_PATH}${NC}" >&2

# Function to check for config file imports
check_config_usage() {
    local file="$1"
    
    # Only check TypeScript/JavaScript files
    if [[ "$file" =~ \.(tsx?|jsx?)$ ]]; then
        # Check if it's a component file
        if [[ "$file" =~ /components/ ]]; then
            echo -e "${YELLOW}⚠️  Component file detected${NC}" >&2
            echo -e "${YELLOW}   Remember: Use colorPalette, spacing, fontWeights from config${NC}" >&2
            echo -e "${YELLOW}   Component names must start with 'Sh' prefix${NC}" >&2
        fi
        
        # Check if it's a new file (Write tool)
        if [[ "$TOOL_NAME" == "Write" ]]; then
            echo -e "${YELLOW}📋 Creating new file - Checklist:${NC}" >&2
            echo -e "${YELLOW}   ✓ Import configs: @cfg/colors, @cfg/spacing, @cfg/typography${NC}" >&2
            echo -e "${YELLOW}   ✓ No magic values - use config for ALL values${NC}" >&2
            echo -e "${YELLOW}   ✓ Follow existing patterns in codebase${NC}" >&2
        fi
    fi
}

# Function to warn about sensitive files
check_sensitive_files() {
    local file="$1"
    
    # Warn about environment files
    if [[ "$file" =~ \.env ]]; then
        echo -e "${RED}⚠️  WARNING: Editing environment file${NC}" >&2
        echo -e "${RED}   Never commit secrets or API keys${NC}" >&2
    fi
    
    # Warn about config modifications
    if [[ "$file" =~ \.(json|config\.(ts|js))$ ]]; then
        echo -e "${YELLOW}⚠️  Modifying configuration file${NC}" >&2
        echo -e "${YELLOW}   Ensure changes are backward compatible${NC}" >&2
    fi
}

# Function to check for research documentation
suggest_research() {
    local research_file="/Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4/.research.md"
    
    # If research file doesn't exist, suggest creating one
    if [ ! -f "$research_file" ]; then
        echo -e "${BLUE}💡 Tip: Consider creating .research.md to document:${NC}" >&2
        echo -e "${BLUE}   - Error investigations${NC}" >&2
        echo -e "${BLUE}   - Framework documentation findings${NC}" >&2
        echo -e "${BLUE}   - Design decisions${NC}" >&2
    fi
}

# Function to remind about CLAUDE.md rules
remind_claude_rules() {
    echo -e "${GREEN}📚 CLAUDE.md Reminders:${NC}" >&2
    echo -e "${GREEN}   • No magic values - use config files${NC}" >&2
    echo -e "${GREEN}   • Run 'npm run lint' after changes${NC}" >&2
    echo -e "${GREEN}   • Check Figma for UI specifications${NC}" >&2
}

# Main execution
if [ -n "$FILE_PATH" ]; then
    check_config_usage "$FILE_PATH"
    check_sensitive_files "$FILE_PATH"
    
    # Only show suggestions occasionally (for new files or configs)
    if [[ "$TOOL_NAME" == "Write" ]] || [[ "$FILE_PATH" =~ config ]]; then
        suggest_research
        remind_claude_rules
    fi
fi

# Always exit 0 - this is informational only, not blocking
echo -e "${GREEN}✅ Pre-edit check complete${NC}" >&2
exit 0