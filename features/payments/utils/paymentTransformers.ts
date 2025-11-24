import { PaymentStatus } from '@top/features/payments/constants';
import {
  PaymentDetail,
  PaymentRequestDBResult,
} from '@top/features/payments/types';
import { PaymentRequestMemberDBResult } from '@top/features/payments/types/paymentRequestMemeber';
import { paymentCaculationStripeFee } from './paymentCaculationiStripeFee';

export const transformPaymentRequestToDetail = (
  paymentRequest: PaymentRequestDBResult,
  memberPayment?: PaymentRequestMemberDBResult | null
): PaymentDetail => {
  const { amountInPounds, transactionFee, total } = paymentCaculationStripeFee(
    paymentRequest.amountPence,
    true
  );
  return {
    id: paymentRequest.id,
    title: paymentRequest.title,
    description: paymentRequest.description || '',
    amountPence: memberPayment?.amountPence || Math.round(total),
    dueDate: paymentRequest.dueDate,
    paymentType: paymentRequest.paymentType,
    createdBy: {
      id: paymentRequest.profiles?.id || '',
      name: paymentRequest.profiles
        ? `${paymentRequest.profiles.firstName || ''} ${paymentRequest.profiles.lastName || ''}`.trim() ||
          'Unknown'
        : 'Unknown',
      avatarUrl: paymentRequest.profiles?.profilePhotoURI || undefined,
    },
    team: {
      id: paymentRequest.teams?.id || '',
      name: paymentRequest.teams?.name || 'Unknown Team',
      imageUrl: paymentRequest.teams?.teamPhotoUrl || undefined,
    },
    paymentStatus: (() => {
      if (paymentRequest.requestStatus === 'active')
        return PaymentStatus.PENDING;
      if (paymentRequest.requestStatus === 'cancelled')
        return PaymentStatus.CANCELLED;
      return PaymentStatus.PENDING;
    })(),
    userPaymentStatus:
      memberPayment?.paymentStatus === PaymentStatus.PROCESSING
        ? PaymentStatus.PENDING
        : memberPayment?.paymentStatus,
    memberPaymentId: memberPayment?.id,
  };
};
