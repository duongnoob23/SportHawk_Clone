import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { PaymentStatus } from '../constants/paymentStatus';
import { PaymentStatusType } from './paymentTypes';

/**
 * Payment status display configuration
 */
export const PaymentStatusConfig: Record<
  PaymentStatusType,
  {
    backgroundColor: string;
    textColor: string;
    icon: IconName;
    label: string;
  }
> = {
  [PaymentStatus.PAID]: {
    backgroundColor: colorPalette.paymentStatusPaidBg,
    textColor: colorPalette.paymentStatusPaid,
    icon: IconName.CheckmarkCircle,
    label: 'Paid',
  },
  [PaymentStatus.FAILED]: {
    backgroundColor: colorPalette.paymentStatusFailedBg,
    textColor: colorPalette.paymentStatusFailed,
    icon: IconName.CheckboxCross,
    label: 'Failed',
  },
  [PaymentStatus.CANCELLED]: {
    backgroundColor: colorPalette.paymentStatusCancelledBg,
    textColor: colorPalette.paymentStatusCancelled,
    icon: IconName.CheckboxCross,
    label: 'Cancelled',
  },
  [PaymentStatus.PROCESSING]: {
    backgroundColor: colorPalette.paymentStatusProcessingBg,
    textColor: colorPalette.paymentStatusProcessing,
    icon: IconName.Clock,
    label: 'Processing',
  },
  [PaymentStatus.PENDING]: {
    backgroundColor: colorPalette.paymentDueDateBannerBg,
    textColor: colorPalette.warning,
    icon: IconName.Clock,
    label: 'Pending',
  },
  [PaymentStatus.OVERDUE]: {
    backgroundColor: colorPalette.errorLight,
    textColor: colorPalette.error,
    icon: IconName.AlertCircleOutline,
    label: 'Overdue',
  },
};
