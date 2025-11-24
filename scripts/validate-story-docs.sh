#!/bin/bash

# Story Documentation Validation Script
# Created from lessons learned in Story 6 (PAY-006)
# Usage: ./scripts/validate-story-docs.sh [STORY-ID]
# Example: ./scripts/validate-story-docs.sh PAY-006

STORY_ID=$1

if [ -z "$STORY_ID" ]; then
    echo "❌ Error: Please provide a story ID"
    echo "Usage: ./scripts/validate-story-docs.sh [STORY-ID]"
    echo "Example: ./scripts/validate-story-docs.sh PAY-006"
    exit 1
fi

DOCS_DIR="docs/stories"
STORY_FILES="${DOCS_DIR}/${STORY_ID}*.md"
ERRORS_FOUND=0
WARNINGS_FOUND=0

echo "========================================="
echo "📋 Validating Story Documentation: $STORY_ID"
echo "========================================="
echo ""

# Check if story files exist
if ! ls $STORY_FILES 1> /dev/null 2>&1; then
    echo "❌ No story files found for $STORY_ID in $DOCS_DIR"
    exit 1
fi

echo "📂 Found story files:"
ls -la $STORY_FILES
echo ""

# Function to check and report issues
check_pattern() {
    local pattern=$1
    local description=$2
    local severity=$3  # ERROR or WARNING
    
    echo "Checking: $description"
    
    local found=false
    for file in $STORY_FILES; do
        if grep -E "$pattern" "$file" > /dev/null 2>&1; then
            found=true
            echo "  ⚠️  Found in $(basename $file):"
            grep -n -E "$pattern" "$file" | head -5 | sed 's/^/      Line /'
            
            if [ "$severity" = "ERROR" ]; then
                ((ERRORS_FOUND++))
            else
                ((WARNINGS_FOUND++))
            fi
        fi
    done
    
    if [ "$found" = false ]; then
        echo "  ✅ Clean"
    fi
    echo ""
}

echo "🔍 Running validation checks..."
echo "========================================="
echo ""

# Check for magic numbers
echo "1️⃣  MAGIC NUMBERS CHECK"
echo "-----------------------------------------"
check_pattern "size={[0-9]+}" "Hardcoded size values" "ERROR"
check_pattern "borderRadius: [0-9]+" "Hardcoded border radius" "ERROR"
check_pattern "width: [0-9]+" "Hardcoded width values" "ERROR"
check_pattern "height: [0-9]+" "Hardcoded height values" "ERROR"
check_pattern "padding: [0-9]+" "Hardcoded padding values" "ERROR"
check_pattern "margin: [0-9]+" "Hardcoded margin values" "ERROR"
check_pattern "\.limit\([0-9]+\)" "Hardcoded limit values" "ERROR"
check_pattern "opacity: 0\.[0-9]+" "Hardcoded opacity values" "WARNING"

# Check for hardcoded status strings
echo "2️⃣  HARDCODED STRINGS CHECK"
echo "-----------------------------------------"
check_pattern "'paid'|'unpaid'|'pending'" "Hardcoded payment status" "ERROR"
check_pattern "'active'|'inactive'|'suspended'" "Hardcoded general status" "ERROR"
check_pattern "'success'|'failed'|'error'" "Hardcoded result status" "ERROR"
check_pattern "'cancelled'|'completed'|'processing'" "Hardcoded process status" "ERROR"

# Check for RGBA values
echo "3️⃣  HARDCODED COLORS CHECK"
echo "-----------------------------------------"
check_pattern "rgba\([0-9, .]+\)" "RGBA color values (should be in config)" "ERROR"
check_pattern "#[0-9a-fA-F]{6}" "Hex color values (should be in config)" "WARNING"

# Check for console.log usage
echo "4️⃣  LOGGING CHECK"
echo "-----------------------------------------"
check_pattern "console\.log" "console.log usage (should use logger)" "ERROR"
check_pattern "console\.error" "console.error usage (should use logger)" "ERROR"
check_pattern "console\.warn" "console.warn usage (should use logger)" "ERROR"

# Check for missing imports
echo "5️⃣  IMPORT VERIFICATION"
echo "-----------------------------------------"
for file in $STORY_FILES; do
    echo "Checking imports in $(basename $file):"
    
    # Check if file has code examples
    if grep -q "```typescript\|```javascript\|```tsx\|```jsx" "$file"; then
        # Check if it has any hardcoded values but missing config import
        if grep -E "size={[0-9]+}|borderRadius: [0-9]+|'paid'|'failed'" "$file" > /dev/null 2>&1; then
            if ! grep -q "import.*from.*config" "$file"; then
                echo "  ⚠️  Has hardcoded values but missing config imports"
                ((WARNINGS_FOUND++))
            else
                echo "  ✅ Config imports found"
            fi
        else
            echo "  ✅ No hardcoded values or has proper imports"
        fi
        
        # Check for logger import if logging is used
        if grep -q "logger\." "$file"; then
            if ! grep -q "import.*logger" "$file"; then
                echo "  ⚠️  Uses logger but missing logger import"
                ((WARNINGS_FOUND++))
            else
                echo "  ✅ Logger import found"
            fi
        fi
    else
        echo "  ℹ️  No code examples in file"
    fi
    echo ""
done

# Check for API naming consistency
echo "6️⃣  API NAMING CONSISTENCY"
echo "-----------------------------------------"
if grep -q "paymentApi\|paymentsApi" $STORY_FILES 2>/dev/null; then
    echo "Checking for API naming consistency:"
    
    # Count occurrences of each
    payment_api_count=$(grep -o "paymentApi" $STORY_FILES 2>/dev/null | wc -l)
    payments_api_count=$(grep -o "paymentsApi" $STORY_FILES 2>/dev/null | wc -l)
    
    if [ $payment_api_count -gt 0 ] && [ $payments_api_count -gt 0 ]; then
        echo "  ⚠️  Inconsistent API naming found:"
        echo "      'paymentApi': $payment_api_count occurrences"
        echo "      'paymentsApi': $payments_api_count occurrences"
        ((ERRORS_FOUND++))
    elif [ $payment_api_count -gt 0 ]; then
        echo "  ℹ️  Using 'paymentApi' consistently ($payment_api_count occurrences)"
    elif [ $payments_api_count -gt 0 ]; then
        echo "  ✅ Using 'paymentsApi' consistently ($payments_api_count occurrences)"
    fi
else
    echo "  ℹ️  No payment API references found"
fi
echo ""

# Check for common field name errors
echo "7️⃣  DATABASE FIELD NAME CHECK"
echo "-----------------------------------------"
check_pattern "member_id.*userId\|userId.*member_id" "Potential member_id/user_id confusion" "WARNING"
check_pattern "\.eq\('member_id'" "Using member_id (verify if should be user_id)" "WARNING"

# Summary
echo "========================================="
echo "📊 VALIDATION SUMMARY"
echo "========================================="
echo ""

if [ $ERRORS_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    echo "✅ SUCCESS: No issues found!"
    echo ""
    echo "Story documentation is clean and follows all guidelines."
    exit 0
elif [ $ERRORS_FOUND -eq 0 ]; then
    echo "⚠️  WARNINGS: $WARNINGS_FOUND warning(s) found"
    echo ""
    echo "Story has minor issues that should be reviewed."
    exit 0
else
    echo "❌ ERRORS: $ERRORS_FOUND error(s) found"
    echo "⚠️  WARNINGS: $WARNINGS_FOUND warning(s) found"
    echo ""
    echo "Story documentation has issues that MUST be fixed before development."
    echo ""
    echo "Next steps:"
    echo "1. Fix all ERROR items (hardcoded values, console.log, etc.)"
    echo "2. Review WARNING items and fix if applicable"
    echo "3. Run this script again to verify fixes"
    echo ""
    echo "Refer to /docs/dev-guidelines/po-story-preparation-checklist.md for guidance."
    exit 1
fi