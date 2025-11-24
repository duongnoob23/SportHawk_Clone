import { PaymentRequestStatus } from '../constants/paymentStatus';
import { PaymentStatusType, PaymentTypeOption } from './paymentTypes';

export type PaymentRequestStatusType =
  (typeof PaymentRequestStatus)[keyof typeof PaymentRequestStatus];

export interface PaymentRequestDBResult {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  amountPence: number;
  currency: string;
  dueDate: string | null;
  paymentType: PaymentTypeOption;
  requestStatus: PaymentRequestStatusType;
  totalMembers: number;
  paidMembers: number;
  totalCollectedPence: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  teams: {
    id: string;
    name: string;
    teamPhotoUrl: string | null;
    clubs: {
      id: string;
      name: string;
    };
  } | null;
  profiles: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhotoURI: string | null;
  } | null;
  paymentRequestMembers?: PaymentRequestWithProfile[];
}

export interface PaymentRequestWithProfile {
  id: string;
  paymentRequestId: string;
  userId: string;
  amountPaidPence: number;
  paymentStatus: PaymentStatusType;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  profiles: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhotoURI: string | null;
  } | null;
}

export interface CreatePaymentRequestData {
  title: string;
  description?: string;
  amountPence: number;
  dueDate: string;
  paymentType: PaymentTypeOption;
  teamId: string;
  totalMembers: number;
}

export interface UpdatePaymentRequestData {
  title?: string;
  description?: string;
  amountPence?: number;
  dueDate?: string;
  paymentType?: PaymentTypeOption;
}

export interface PaymentDetail {
  id: string;
  title: string;
  description: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: PaymentTypeOption;
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  team: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  paymentStatus: PaymentStatusType;
  userPaymentStatus?: PaymentStatusType;
  memberPaymentId?: string;
}
