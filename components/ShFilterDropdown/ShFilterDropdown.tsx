import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface FilterOption<T = string> {
  label: string;
  value: T;
}

interface ShFilterDropdownProps<T = string> {
  /** Current selected filter value */
  currentFilter: T;
  /** Array of filter options */
  options: FilterOption<T>[];
  /** Callback when filter changes */
  onFilterChange: (value: T) => void;
  /** Whether dropdown is open */
  isOpen: boolean;
  /** Callback to toggle dropdown */
  onToggle: () => void;
  /** Optional placeholder text when no filter selected */
  placeholder?: string;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Reusable filter dropdown component
 * Displays a button that toggles a dropdown menu with filter options
 */
export function ShFilterDropdown<T = string>({
  currentFilter,
  options,
  onFilterChange,
  isOpen,
  onToggle,
  placeholder = 'Filter',
  testID,
}: ShFilterDropdownProps<T>) {
  const currentOption = options.find(opt => opt.value === currentFilter);
  const displayLabel = currentOption?.label;

  const handleSelectFilter = (value: T) => {
    onFilterChange(value);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onToggle}
        testID={testID}
      >
        <ShText variant={ShTextVariant.Body} style={styles.filterText}>
          {displayLabel}
        </ShText>
        <ShIcon
          name={isOpen ? IconName.ChevronUp : IconName.ChevronDown}
          size={spacing.iconSizeSmall}
          color={colorPalette.textSecondary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.filterDropdown}>
          {options.map((option, index) => {
            const isActive = option.value === currentFilter;
            const isLast = index === options.length - 1;

            return (
              <TouchableOpacity
                key={String(option.value)}
                style={[
                  styles.filterDropdownItem,
                  isLast && styles.filterDropdownItemLast,
                ]}
                onPress={() => handleSelectFilter(option.value)}
                testID={`${testID}-option-${String(option.value)}`}
              >
                <ShText
                  variant={ShTextVariant.Body}
                  style={[
                    styles.filterDropdownItemText,
                    isActive && styles.filterDropdownItemTextActive,
                  ]}
                >
                  {option.label}
                </ShText>
                {isActive && (
                  <ShIcon
                    name={IconName.Checkmark}
                    size={spacing.iconSizeSmall}
                    color={colorPalette.primaryGold}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // minWidth: 120,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xsm,
  },
  filterText: {
    color: colorPalette.stoneGrey,
  },

  filterDropdown: {
    position: 'absolute',
    top: spacing.xxxl + spacing.sm,
    // alignSelf: 'flex-start',
    right: 0,
    backgroundColor: colorPalette.baseDark,
    // backgroundColor: colorPalette.error,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    zIndex: 1000,
    width: '100%',
    minWidth: 180,
    // maxWidth: 300,
    shadowColor: colorPalette.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  filterDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    width: '100%',
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  filterDropdownItemLast: {
    borderBottomWidth: 0,
  },
  filterDropdownItemText: {
    color: colorPalette.textLight,
  },
  filterDropdownItemTextActive: {
    color: colorPalette.primaryGold,
    fontWeight: '600',
  },
});
