import { ShIcon, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { EventDetailData } from '../types';
import { parseEventNotes } from '../utils';

type Props = {
  eventItem?: EventDetailData;
};

const AnswerBySection = ({ eventItem }: Props) => {
  const result = parseEventNotes(eventItem?.notes);
  return (
    <View style={styles.answerByCard}>
      <View style={styles.answerByRow}>
        <View style={styles.answerByLeft}>
          <ShIcon
            name={IconName.Clock}
            size={spacing.iconSizeSmall}
            color={colorPalette.primaryGold}
          />
          <ShText variant={ShTextVariant.Body} style={styles.answerByLabel}>
            Answer by
          </ShText>
        </View>
        <ShText variant={ShTextVariant.Body} style={styles.answerByDate}>
          {`${result?.answerBy?.slice(0, 10)} • ${result?.answerBy?.slice(10)}`}
        </ShText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  answerByCard: {
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(234, 189, 34, 0.2)`,
    borderRadius: spacing.borderRadiusMedium,
    padding: spacing.lg,
    backgroundColor: colorPalette.primaryBlack,
  },
  answerByRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerByLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  answerByLabel: {
    color: colorPalette.primaryGold,
  },
  answerByDate: {
    color: colorPalette.primaryGold,
  },
});

export default AnswerBySection;
