import { supabase } from '@lib/supabase';
import { getSupabaseClient } from '@lib/supabase-dev';
import { logger } from '@lib/utils/logger';
import { MemberData1 } from '@top/features/event/types';
import { PaymentMemberStatus } from '@top/features/payments/constants/paymentStatus';
import {
  CreatePaymentRequestMembersData,
  GetPaymentRequestMemberType,
  PaymentRequestMemberDBResult,
  PaymentStatusType,
  UpdatePaymentRequestData,
  UpdatePaymentRequestMemberData,
  UpdatePaymentRequestMembersData,
} from '@top/features/payments/types';
import { Database } from '@typ/database';

type PaymentRequestMemberInsert =
  Database['public']['Tables']['payment_request_members']['Insert'];
type PaymentRequestMemberUpdate =
  Database['public']['Tables']['payment_request_members']['Update'];

export const getPaymentRequestMemberByPaymentAndUser = async (
  paymentRequestId: string,
  userId: string
): Promise<PaymentRequestMemberDBResult | null> => {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('payment_request_members')
    .select(
      `
      id,
      paymentRequestId:payment_request_id,
      userId:user_id,
      paymentStatus:payment_status,
      amountPence:amount_pence,
      currency,
      paidAt:paid_at,
      paymentMethod:payment_method,
      stripePaymentIntentId:stripe_payment_intent_id,
      failureReason:failure_reason,
      paymentId:payment_id,
      createdAt:created_at,
      updatedAt:updated_at
    `
    )
    .eq('payment_request_id', paymentRequestId)
    .eq('user_id', userId)
    .maybeSingle<PaymentRequestMemberDBResult>(); // Use maybeSingle() to handle no data

  if (error) {
    if (error.code === 'PGRST116') {
      logger.log('No payment member record found for user:', userId);
      return null;
    }
    logger.error('Failed to get payment member:', error);
    throw error;
  }

  return data;
};

export const createPaymentRequestMembers = async (
  data: CreatePaymentRequestMembersData
): Promise<void> => {
  try {
    logger.log('Creating payment request members for:', data.paymentRequestId);

    const memberInserts: PaymentRequestMemberInsert[] = data.memberIds.map(
      memberId => ({
        payment_request_id: data.paymentRequestId,
        user_id: memberId,
        payment_status: 'unpaid',
        amount_pence: data.amountPence,
        currency: 'GBP',
      })
    );

    const client = getSupabaseClient();
    const { error: membersError } = await client
      .from('payment_request_members')
      .insert(memberInserts);

    if (membersError) {
      logger.error('Failed to create payment request members:', membersError);
      throw membersError;
    }

    logger.log('Payment request members created successfully');
  } catch (error) {
    logger.error('Error in createPaymentRequestMembers:', error);
    throw error;
  }
};

export const updatePaymentRequestMembers = async (
  dataId: UpdatePaymentRequestMembersData,
  data: UpdatePaymentRequestData
): Promise<void> => {
  try {
    logger.log(
      'Creating payment request members for:',
      dataId.paymentRequestId
    );

    // const memberInsert: PaymentRequestMemberInsert[] = dataId.addMember.map(
    //   memberId => ({
    //     payment_request_id: data.paymentRequestId,
    //     user_id: memberId,
    //     payment_status: 'unpaid',
    //     amount_pence: data.amountPence,
    //     currency: 'GBP',
    //   })
    // );
    // const { error: membersError } = await supabase
    //   .from('payment_request_members')
    //   .insert(memberInsert);

    // if (membersError) {
    //   logger.error('Failed to create payment request members:', membersError);
    //   throw membersError;
    // }

    logger.log('Payment request members created successfully');
  } catch (error) {
    logger.error('Error in createPaymentRequestMembers:', error);
    throw error;
  }
};

export const updatePaymentRequestMemberStatus = async (
  paymentRequestMemberId: string,
  status: PaymentStatusType
): Promise<void> => {
  const updateData: any = {
    payment_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === PaymentMemberStatus.PAID) {
    updateData.paid_at = new Date().toISOString();
  }

  const client = getSupabaseClient();
  const { error } = await client
    .from('payment_request_members')
    .update(updateData)
    .eq('id', paymentRequestMemberId);

  if (error) {
    logger.error('Failed to update payment status:', error);
    throw error;
  }

  logger.log('Payment status updated successfully');
};

export const updatePaymentRequestMember = async (
  id: string,
  data: UpdatePaymentRequestMemberData
): Promise<PaymentRequestMemberDBResult> => {
  try {
    logger.log('Updating payment request member:', { id, data });

    // Convert camelCase to snake_case for database
    const updateData: PaymentRequestMemberUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (data.amountPence !== undefined)
      updateData.amount_pence = data.amountPence;
    if (data.paymentStatus !== undefined)
      updateData.payment_status = data.paymentStatus;
    if (data.paymentMethod !== undefined)
      updateData.payment_method = data.paymentMethod;
    if (data.stripePaymentIntentId !== undefined)
      updateData.stripe_payment_intent_id = data.stripePaymentIntentId;
    if (data.failureReason !== undefined)
      updateData.failure_reason = data.failureReason;
    // Note: payment_id field doesn't exist in payment_request_members table

    // Set paid_at if status is being updated to paid
    if (data.paymentStatus === PaymentMemberStatus.PAID) {
      updateData.paid_at = new Date().toISOString();
    }

    const client = getSupabaseClient();
    const { data: updatedMember, error } = await client
      .from('payment_request_members')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        id,
        paymentRequestId:payment_request_id,
        userId:user_id,
        paymentStatus:payment_status,
        amountPence:amount_pence,
        currency,
        paidAt:paid_at,
        paymentMethod:payment_method,
        stripePaymentIntentId:stripe_payment_intent_id,
        failureReason:failure_reason,
        createdAt:created_at,
        updatedAt:updated_at
      `
      )
      .maybeSingle<PaymentRequestMemberDBResult>(); // Use maybeSingle() to handle no data

    if (error) {
      logger.error('Failed to update payment request member:', error);
      throw error;
    }

    logger.log(
      'Payment request member updated successfully:',
      updatedMember.id
    );
    return updatedMember;
  } catch (error) {
    logger.error('Error in updatePaymentRequestMember:', error);
    throw error;
  }
};

export const updatePaymentRequestMembersByPaymentId = async (
  paymentRequestId: string,
  data: Partial<UpdatePaymentRequestMemberData>
): Promise<void> => {
  try {
    logger.log('Updating payment request members by payment ID:', {
      paymentRequestId,
      data,
    });

    // Convert camelCase to snake_case for database
    const updateData: PaymentRequestMemberUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (data.amountPence !== undefined)
      updateData.amount_pence = data.amountPence;
    if (data.paymentStatus !== undefined)
      updateData.payment_status = data.paymentStatus;
    if (data.paymentMethod !== undefined)
      updateData.payment_method = data.paymentMethod;
    if (data.stripePaymentIntentId !== undefined)
      updateData.stripe_payment_intent_id = data.stripePaymentIntentId;
    if (data.failureReason !== undefined)
      updateData.failure_reason = data.failureReason;

    // Set paid_at if status is being updated to paid
    if (data.paymentStatus === PaymentMemberStatus.PAID) {
      updateData.paid_at = new Date().toISOString();
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('payment_request_members')
      .update(updateData)
      .eq('payment_request_id', paymentRequestId);

    if (error) {
      logger.error('Failed to update payment request members:', error);
      throw error;
    }

    logger.log(
      'Payment request members updated successfully for payment:',
      paymentRequestId
    );
  } catch (error) {
    logger.error('Error in updatePaymentRequestMembersByPaymentId:', error);
    throw error;
  }
};

export const getUserPaymentRequestMembers = async (
  userId?: string,
  teamId?: string
): Promise<PaymentRequestMemberDBResult[]> => {
  try {
    const client = getSupabaseClient();
    let query = client.from('payment_request_members').select(
      `
        id,
        paymentRequestId:payment_request_id,
        userId:user_id,
        paymentStatus:payment_status,
        amountPence:amount_pence,
        currency,
        paidAt:paid_at,
        paymentMethod:payment_method,
        stripePaymentIntentId:stripe_payment_intent_id,
        failureReason:failure_reason,
        paymentId:payment_id,
        createdAt:created_at,
        updatedAt:updated_at,
        paymentRequests:payment_requests!inner(
          id,
          title,
          description,
          dueDate:due_date,
          paymentType:payment_type,
          requestStatus:request_status,
          teams(
            id,
            name
          )
        )
      `
    );

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (teamId) {
      query = query.eq('payment_requests.team_id', teamId);
    }

    const { data, error } = await query
      .order('created_at', {
        ascending: false,
      })
      .overrideTypes<PaymentRequestMemberDBResult[], { merge: true }>();

    if (error) {
      logger.error('Failed to get user payment request members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getUserPaymentRequestMembers:', error);
    throw error;
  }
};

export const getPaymentRequestMemberSimple = async (
  payload: GetPaymentRequestMemberType
): Promise<{ memberData: MemberData1[]; userIds: string[] }> => {
  try {
    const { teamId, paymentRequestId } = payload;
    const client = getSupabaseClient();
    const { data: teamMemberData, error } = await client
      .from('team_members')
      .select(
        `
        id,
        teamId:team_id,
        userId:user_id,
        position,
        memberStatus:member_status,
        profiles:profiles!team_members_user_id_fkey1 (
          id,
          firstName:first_name,
          lastName:last_name,
          profilePhotoUri:profile_photo_uri
        )
      `
      )
      .eq('team_id', teamId)
      .eq('member_status', 'active')
      .overrideTypes<MemberData1[]>();

    const { data: userPaymemtRequestMember } = await client
      .from('payment_request_members')
      .select('*')
      .eq('payment_request_id', paymentRequestId);

    const userIds = userPaymemtRequestMember?.map(item => item.user_id) ?? [];
    if (error) throw error;

    const memberDataWithFlag = teamMemberData.map(member => ({
      ...member,
      isChoose: userIds.includes(member.userId),
    }));

    return { memberData: memberDataWithFlag, userIds };
  } catch (error) {
    logger.error('Error in getTeamMembersSimple:', error);
    throw error;
  }
};
