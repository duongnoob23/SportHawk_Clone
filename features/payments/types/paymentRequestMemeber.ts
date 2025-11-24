import { PaymentStatusType } from '@top/features/payments';

export interface PaymentRequestMemberDBResult {
  id: string;
  paymentRequestId: string;
  userId: string;
  paymentStatus: PaymentStatusType;
  amountPence: number;
  currency: string;
  paidAt: string | null;
  paymentMethod: string | null;
  stripePaymentIntentId: string | null;
  failureReason: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  paymentRequests?: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    paymentType: string;
    requestStatus: string;
    teams: {
      id: string;
      name: string;
    } | null;
  };
}

export interface CreatePaymentRequestMembersData {
  paymentRequestId: string;
  memberIds: string[];
  amountPence: number;
}
export interface UpdatePaymentRequestMembersData {
  paymentRequestId: string;
  addMember: string[];
  removeMember: string[];
  amountPence: number;
}

export interface UpdatePaymentRequestMemberData {
  amountPence?: number;
  paymentStatus?: PaymentStatusType;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  failureReason?: string;
}

export interface GetPaymentRequestMemberType {
  teamId?: string;
  paymentRequestId?: string;
}
