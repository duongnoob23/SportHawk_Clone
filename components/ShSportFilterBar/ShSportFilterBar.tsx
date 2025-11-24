import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { styles } from './ShSportFilterBar.styles';

interface ShSportFilterBarProps {
  sports?: string[];
  selectedSport: string;
  onSportSelect: (sport: string) => void;
}

const DEFAULT_SPORTS = ['Football', 'Rugby', 'Netball', 'Basketball'];

// Map sport names to icon names
const SPORT_ICONS: Record<string, IconName> = {
  All: IconName.Team,
  Football: IconName.Football,
  Rugby: IconName.Rugby,
  Basketball: IconName.Basketball,
  Netball: IconName.Netball,
  Cricket: IconName.Bowling, // Using Bowling as Cricket not available
  Tennis: IconName.Tennis,
  Hockey: IconName.Trophy, // Using Trophy as Hockey not available
  Athletics: IconName.TrendingUp, // Using TrendingUp as Running not available
};

export const ShSportFilterBar: React.FC<ShSportFilterBarProps> = ({
  sports = DEFAULT_SPORTS,
  selectedSport,
  onSportSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sports.map(sport => {
          const isSelected = sport === selectedSport;
          return (
            <TouchableOpacity
              key={sport}
              style={[
                styles.sportButton,
                isSelected && styles.sportButtonSelected,
              ]}
              onPress={() => onSportSelect(sport)}
              activeOpacity={0.7}
            >
              <View style={styles.sportButtonContent}>
                <ShIcon
                  name={SPORT_ICONS[sport] || IconName.Football}
                  size={24}
                  color={colorPalette.primaryGold}
                />
                <ShText
                  variant={ShTextVariant.Small}
                  style={[
                    styles.sportText,
                    isSelected && styles.sportTextSelected,
                  ]}
                >
                  {sport}
                </ShText>
                {isSelected && <View style={styles.selectedIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
