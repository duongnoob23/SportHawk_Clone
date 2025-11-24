import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { PaymentRequestStatus } from '@top/features/payments/constants/paymentStatus';
import {
  CreatePaymentRequestData,
  PaymentRequestDBResult,
  UpdatePaymentRequestData,
} from '@top/features/payments/types';
import { Database } from '@typ/database';

type PaymentRequestInsert =
  Database['public']['Tables']['payment_requests']['Insert'];
type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
type PaymentRequestUpdate =
  Database['public']['Tables']['payment_requests']['Update'];

export const getPaymentRequestById = async (
  id: string
): Promise<PaymentRequestDBResult> => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select(
      `
          id,
          teamId:team_id,
          title,
          description,
          amountPence:amount_pence,
          currency,
          dueDate:due_date,
          paymentType:payment_type,
          requestStatus:request_status,
          totalMembers:total_members,
          paidMembers:paid_members,
          totalCollectedPence:total_collected_pence,
          createdAt:created_at,
          updatedAt:updated_at,
          createdBy:created_by,
          teams (
            id,
            name,
            teamPhotoUrl:team_photo_url
          ),
          profiles!payment_requests_created_by_fkey (
            id,
            firstName:first_name,
            lastName:last_name,
            profilePhotoURI:profile_photo_uri
          )
        `
    )
    .eq('id', id)
    .single<PaymentRequestDBResult>();

  if (error) {
    logger.error('Failed to get payment detail:', error);
    throw error;
  }
  return data;
};

export const getPaymentRequestsWithMembers = async (paymentId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(
        `
          id,
          teamId:team_id,
          title,
          description,
          amountPence:amount_pence,
          currency,
          dueDate:due_date,
          paymentType:payment_type,
          requestStatus:request_status,
          totalMembers:total_members,
          paidMembers:paid_members,
          totalCollectedPence:total_collected_pence,
          createdAt:created_at,
          updatedAt:updated_at,
          createdBy:created_by,
          teams (
            id,
            name,
            teamPhotoUrl:team_photo_url,
            clubs (
              id,
              name
            )
          ),
          profiles!payment_requests_created_by_fkey (
            id,
            firstName:first_name,
            lastName:last_name,
            profilePhotoURI:profile_photo_uri
          ),
          paymentRequestMembers:payment_request_members (
            id,
            paymentRequestId:payment_request_id,
            userId:user_id,
            paymentStatus:payment_status,
            amountPaidPence:amount_pence,
            paidAt:paid_at,
            createdAt:created_at,
            updatedAt:updated_at,
            profiles (
              id,
              firstName:first_name,
              lastName:last_name,
              profilePhotoURI:profile_photo_uri
            )
          )
        `
      )
      .eq('id', paymentId)
      .single<PaymentRequestDBResult>();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    logger.error('Error in getPaymentRequestsWithMembers:', error);
    throw error;
  }
};

export const createPaymentRequest = async (
  data: CreatePaymentRequestData
): Promise<PaymentRequest> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    logger.log('Creating payment request:', data.title);

    const paymentRequestInsert: PaymentRequestInsert = {
      team_id: data.teamId,
      created_by: user.id,
      title: data.title,
      description: data.description || null,
      amount_pence: data.amountPence,
      due_date: data.dueDate,
      payment_type: data.paymentType,
      request_status: PaymentRequestStatus.ACTIVE,
      total_members: data.totalMembers,
      paid_members: 0,
      total_collected_pence: 0,
    };

    const { data: paymentRequest, error: requestError } = await supabase
      .from('payment_requests')
      .insert(paymentRequestInsert)
      .select()
      .single();

    if (requestError) {
      logger.error('Failed to create payment request:', requestError);
      throw requestError;
    }

    logger.log('Payment request created successfully:', paymentRequest.id);
    return paymentRequest;
  } catch (error) {
    logger.error('Error in createPaymentRequest:', error);
    throw error;
  }
};

export const updatePaymentRequest = async (
  id: string,
  data: UpdatePaymentRequestData
): Promise<PaymentRequestDBResult> => {
  try {
    logger.log('Updating payment request:', { id, data });

    // Convert camelCase to snake_case for database
    const updateData: PaymentRequestUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.amountPence !== undefined)
      updateData.amount_pence = data.amountPence;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.paymentType !== undefined)
      updateData.payment_type = data.paymentType;

    const { data: updatedPayment, error } = await supabase
      .from('payment_requests')
      .update(updateData)
      .eq('id', id)
      .select(
        `
          id,
          teamId:team_id,
          title,
          description,
          amountPence:amount_pence,
          currency,
          dueDate:due_date,
          paymentType:payment_type,
          requestStatus:request_status,
          totalMembers:total_members,
          paidMembers:paid_members,
          totalCollectedPence:total_collected_pence,
          createdAt:created_at,
          updatedAt:updated_at,
          createdBy:created_by,
          teams (
            id,
            name,
            teamPhotoUrl:team_photo_url
          ),
          profiles!payment_requests_created_by_fkey (
            id,
            firstName:first_name,
            lastName:last_name,
            profilePhotoURI:profile_photo_uri
          )
        `
      )
      .single<PaymentRequestDBResult>();

    if (error) {
      logger.error('Failed to update payment request:', error);
      throw error;
    }

    logger.log('Payment request updated successfully:', updatedPayment.id);
    return updatedPayment;
  } catch (error) {
    logger.error('Error in updatePaymentRequest:', error);
    throw error;
  }
};

export const getTeamPaymentRequests =async (teamId:string) => {
  try {
        // Fetch payment requests with member counts
        const { data, error } = await supabase
          .from('payment_requests')
          .select(
            `
            *,
            payment_request_members!inner(
              id,
              payment_status
            ),
            teams:team_id (
              id,
              name,
              team_photo_url
            )
          `
          )
          .eq('team_id', teamId)
          .neq('request_status', PaymentRequestStatus.CANCELLED)
          .order('due_date', { ascending: true });
        if (error) throw error;
        const processedData =
          data?.map(request => {
            const members = request.payment_request_members || [];
            const paidCount = members.filter(
              (m: any) => m.payment_status === 'paid'
            ).length;
            const totalCount = members.length;
  
            return {
              ...request,
              paid_count: paidCount,
              total_count: totalCount,
            };
          }) || [];
        return processedData;
      } catch (error: any) {
        console.error('[PAY-007] Failed to fetch payment requests:', error);
        
      }
}
