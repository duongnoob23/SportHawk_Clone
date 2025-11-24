import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.6,
  },
  infoRow: {
    marginVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  teamName: {
    fontSize: spacing.xl,
    marginBottom: spacing.xs / 2,
  },
  actionContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64615F',
  },
  teamType: {
    fontSize: spacing.lg,
  },
});
