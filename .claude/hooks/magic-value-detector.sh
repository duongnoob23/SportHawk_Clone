#!/bin/bash

# Magic Value Detector: Standalone script to scan for hardcoded values
# Can be run manually or integrated into other hooks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# File or directory to scan (default to current directory)
TARGET="${1:-.}"
PROJECT_ROOT="/Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4"

echo -e "${BLUE}🔍 Magic Value Detector - Scanning for hardcoded values...${NC}"
echo -e "${BLUE}Target: $TARGET${NC}\n"

# Track if any violations found
VIOLATIONS_FOUND=0

# Function to scan a single file
scan_file() {
    local file="$1"
    local file_violations=0
    
    # Skip non-code files
    if [[ ! "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
        return 0
    fi
    
    # Skip node_modules and build directories
    if [[ "$file" =~ node_modules|\.next|build|dist ]]; then
        return 0
    fi
    
    local violations=()
    local line_numbers=()
    
    # Check for hardcoded colors (with line numbers)
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            violations+=("Line $line_num: Hardcoded color - $line_content")
            ((file_violations++))
        fi
    done < <(grep -n -E "color.*:.*['\"]($|white|black|gray|grey|red|blue|green|yellow|orange|purple)['\"]" "$file" 2>/dev/null)
    
    # Check for hex colors
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            violations+=("Line $line_num: Hardcoded hex color - $line_content")
            ((file_violations++))
        fi
    done < <(grep -n -E "['\"]#[0-9a-fA-F]{3,6}['\"]" "$file" 2>/dev/null)
    
    # Check for hardcoded numeric values in styles
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            # Filter out some false positives (flex: 1, opacity values, etc.)
            if ! echo "$line_content" | grep -E "flex:.*1|opacity:|zIndex:|aspectRatio:" > /dev/null; then
                # Also check it's not using a config value
                if ! echo "$line_content" | grep -E "spacing\.|fontSize|borderRadius\.|fontWeights\." > /dev/null; then
                    violations+=("Line $line_num: Hardcoded dimension - $line_content")
                    ((file_violations++))
                fi
            fi
        fi
    done < <(grep -n -E "(padding|margin|width|height|top|bottom|left|right|gap|borderWidth).*:.*[0-9]+" "$file" 2>/dev/null)
    
    # Check for hardcoded font weights
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            violations+=("Line $line_num: Hardcoded font weight - $line_content")
            ((file_violations++))
        fi
    done < <(grep -n -E "fontWeight.*:.*['\"]([0-9]{3}|bold|normal|light)['\"]" "$file" 2>/dev/null)
    
    # Check for hardcoded font sizes
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            if ! echo "$line_content" | grep -E "fontSize\.|fontSizes\." > /dev/null; then
                violations+=("Line $line_num: Hardcoded font size - $line_content")
                ((file_violations++))
            fi
        fi
    done < <(grep -n -E "fontSize.*:.*[0-9]+" "$file" 2>/dev/null)
    
    # Check for string literal icon names
    while IFS=: read -r line_num line_content; do
        if [[ -n "$line_num" ]]; then
            if ! echo "$line_content" | grep -E "IconName\." > /dev/null; then
                violations+=("Line $line_num: String literal icon name - $line_content")
                ((file_violations++))
            fi
        fi
    done < <(grep -n -E "icon.*:.*['\"][a-z][a-z-]+['\"]" "$file" 2>/dev/null)
    
    # If violations found in this file, report them
    if [ ${#violations[@]} -gt 0 ]; then
        echo -e "${RED}❌ $file${NC}"
        for violation in "${violations[@]}"; do
            echo -e "  ${YELLOW}$violation${NC}" | head -c 120
            echo
        done
        echo
        VIOLATIONS_FOUND=1
    fi
    
    return $file_violations
}

# Function to generate fix suggestions
suggest_fixes() {
    echo -e "${MAGENTA}💡 How to fix magic values:${NC}"
    echo -e "${GREEN}1. Colors:${NC}"
    echo "   ❌ backgroundColor: 'white'"
    echo "   ✅ backgroundColor: colorPalette.white"
    echo ""
    echo -e "${GREEN}2. Spacing/Dimensions:${NC}"
    echo "   ❌ padding: 16"
    echo "   ✅ padding: spacing.lg"
    echo ""
    echo -e "${GREEN}3. Font Weights:${NC}"
    echo "   ❌ fontWeight: '600'"
    echo "   ✅ fontWeight: fontWeights.semiBold"
    echo ""
    echo -e "${GREEN}4. Font Sizes:${NC}"
    echo "   ❌ fontSize: 14"
    echo "   ✅ fontSize: fontSizes.body"
    echo ""
    echo -e "${GREEN}5. Icons:${NC}"
    echo "   ❌ icon: 'check-circle'"
    echo "   ✅ icon: IconName.CheckCircle"
    echo ""
    echo -e "${BLUE}Remember: If a value doesn't exist in config, add it there first!${NC}"
}

# Main scanning logic
if [ -f "$TARGET" ]; then
    # Single file
    scan_file "$TARGET"
else
    # Directory - scan all TypeScript/JavaScript files
    total_files=0
    files_with_violations=0
    
    while IFS= read -r -d '' file; do
        ((total_files++))
        if scan_file "$file"; then
            ((files_with_violations++))
        fi
    done < <(find "$TARGET" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/build/*" -not -path "*/dist/*" -print0 2>/dev/null)
    
    echo -e "${BLUE}Scanned $total_files files${NC}"
fi

# Summary and suggestions
if [ $VIOLATIONS_FOUND -eq 1 ]; then
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo -e "${RED}Magic values detected! These violate CLAUDE.md rules.${NC}"
    echo -e "${RED}═══════════════════════════════════════${NC}\n"
    suggest_fixes
    exit 1
else
    echo -e "${GREEN}✅ No magic values detected!${NC}"
    echo -e "${GREEN}All values properly use configuration files.${NC}"
    exit 0
fi