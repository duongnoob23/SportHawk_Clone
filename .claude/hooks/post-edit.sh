#!/bin/bash

# Post-Edit Hook: Checks code quality after edits
# Reads JSON from stdin as provided by Claude Code

# Colors for stderr output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4"
LESSONS_FILE="$PROJECT_ROOT/LESSONS_LEARNED.md"

# Read JSON from stdin
JSON_INPUT=$(cat)

# Parse JSON using Python
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

# Log to stderr
echo -e "${BLUE}🔍 Post-Edit Hook: Checking ${FILE_PATH}${NC}" >&2

# Function to check for magic values in the edited file
check_magic_values() {
    local file="$1"
    
    # Skip if not a TypeScript/JavaScript file
    if [[ ! "$file" =~ \.(tsx?|jsx?)$ ]]; then
        return 0
    fi
    
    # Skip if file doesn't exist (might be deleted)
    if [ ! -f "$file" ]; then
        return 0
    fi
    
    local found_issues=false
    
    # Check for hardcoded colors
    if grep -E "color.*:.*['\"]($|white|black|gray|grey|red|blue|green|yellow|orange|purple)['\"]" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Magic value detected: Hardcoded color${NC}" >&2
        echo -e "${YELLOW}   Use: colorPalette from @cfg/colors${NC}" >&2
        found_issues=true
    fi
    
    # Check for hex colors
    if grep -E "['\"]#[0-9a-fA-F]{3,6}['\"]" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Magic value detected: Hex color${NC}" >&2
        echo -e "${YELLOW}   Add to colorPalette in /config/colors.ts${NC}" >&2
        found_issues=true
    fi
    
    # Check for hardcoded dimensions (but be smart about it)
    if grep -E "(padding|margin|gap|borderWidth).*:.*[0-9]+" "$file" 2>/dev/null | grep -v "spacing\." > /dev/null; then
        echo -e "${YELLOW}⚠️  Possible magic value: Hardcoded spacing${NC}" >&2
        echo -e "${YELLOW}   Use: spacing from @cfg/spacing${NC}" >&2
        found_issues=true
    fi
    
    # Check for hardcoded font weights
    if grep -E "fontWeight.*:.*['\"]([0-9]{3}|bold|normal)['\"]" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Magic value detected: Hardcoded font weight${NC}" >&2
        echo -e "${YELLOW}   Use: fontWeights from @cfg/typography${NC}" >&2
        found_issues=true
    fi
    
    # Check for string literal icon names
    if grep -E "icon.*:.*['\"][a-z][a-z-]+['\"]" "$file" 2>/dev/null | grep -v "IconName\." > /dev/null; then
        echo -e "${YELLOW}⚠️  Magic value detected: String literal icon name${NC}" >&2
        echo -e "${YELLOW}   Use: IconName enum from configuration${NC}" >&2
        found_issues=true
    fi
    
    if [ "$found_issues" = true ]; then
        # Log to LESSONS_LEARNED.md but don't block
        echo -e "\n## $(date '+%Y-%m-%d %H:%M:%S') - Magic Values Warning" >> "$LESSONS_FILE"
        echo "- **File**: $file" >> "$LESSONS_FILE"
        echo "- **Note**: Magic values detected, should use config files" >> "$LESSONS_FILE"
        
        echo -e "${MAGENTA}💡 Run this to check all magic values:${NC}" >&2
        echo -e "${MAGENTA}   .claude/hooks/magic-value-detector.sh ${file}${NC}" >&2
    fi
}

# Function to check for TODO comments
check_todo_comments() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        return 0
    fi
    
    if grep -E "//\s*TODO|/\*.*TODO|\*\s*TODO" "$file" > /dev/null 2>&1; then
        echo -e "${BLUE}ℹ️  TODO comment found in file${NC}" >&2
        echo -e "${BLUE}   Remember: Complete implementations before marking done${NC}" >&2
    fi
}

# Function to suggest linting
suggest_linting() {
    local file="$1"
    
    # Only for code files
    if [[ "$file" =~ \.(tsx?|jsx?)$ ]]; then
        echo -e "${GREEN}💡 Next step: Run 'npm run lint' to check code quality${NC}" >&2
    fi
}

# Function to check component naming
check_component_naming() {
    local file="$1"
    
    # Check if it's a component file
    if [[ "$file" =~ /components/.*\.(tsx|jsx)$ ]]; then
        # Extract filename without extension
        local filename=$(basename "$file" | sed 's/\.[^.]*$//')
        
        # Check if it starts with Sh
        if [[ ! "$filename" =~ ^Sh ]]; then
            echo -e "${YELLOW}⚠️  Component naming convention${NC}" >&2
            echo -e "${YELLOW}   Components should start with 'Sh' prefix${NC}" >&2
            echo -e "${YELLOW}   Expected: Sh${filename}${NC}" >&2
        fi
    fi
}

# Main execution
if [ -n "$FILE_PATH" ]; then
    check_magic_values "$FILE_PATH"
    check_todo_comments "$FILE_PATH"
    check_component_naming "$FILE_PATH"
    suggest_linting "$FILE_PATH"
else
    echo -e "${YELLOW}⚠️  Could not determine file path from hook input${NC}" >&2
fi

# Always exit 0 - warnings only, not blocking
echo -e "${GREEN}✅ Post-edit check complete${NC}" >&2
exit 0