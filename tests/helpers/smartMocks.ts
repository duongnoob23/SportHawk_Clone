/**
 * Smart Mocks - Mocks tự động kiểm tra constraints
 * 
 * Các functions này tạo mocks thông minh - LUÔN kiểm tra constraints
 * và trả về error khi vi phạm, đảm bảo tests thực sự bắt được lỗi
 */

import {
  validateEndTimeAfterStartTime,
  validateEventStatus,
  validateEventType,
  validateEventInvitationUnique,
  validateEventSquadUnique,
  validateCancelledReasonRequired,
} from './constraintValidators';

/**
 * Tạo mock insert cho events table với constraint validation
 */
export function createEventInsertMock(
  mockSuccessData: any,
  existingInvitations: Array<{ event_id: string; user_id: string }> = []
) {
  return jest.fn().mockImplementation((data: any) => {
    // Validate end_time > start_time
    const endTimeValidation = validateEndTimeAfterStartTime(
      data.start_time,
      data.end_time
    );
    if (!endTimeValidation.valid) {
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: endTimeValidation.error,
          }),
        }),
      };
    }

    // Validate event_status
    const eventStatusValidation = validateEventStatus(data.event_status);
    if (!eventStatusValidation.valid) {
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: eventStatusValidation.error,
          }),
        }),
      };
    }

    // Validate event_type
    const eventTypeValidation = validateEventType(data.event_type);
    if (!eventTypeValidation.valid) {
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: eventTypeValidation.error,
          }),
        }),
      };
    }

    // Nếu tất cả constraints đều valid, trả về success
    return {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockSuccessData,
          error: null,
        }),
      }),
    };
  });
}

/**
 * Tạo mock update cho events table với constraint validation
 */
export function createEventUpdateMock(mockSuccessData: any) {
  return jest.fn().mockImplementation((data: any) => {
    // Validate end_time > start_time (nếu có cả hai)
    if (data.start_time && data.end_time) {
      const endTimeValidation = validateEndTimeAfterStartTime(
        data.start_time,
        data.end_time
      );
      if (!endTimeValidation.valid) {
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: endTimeValidation.error,
              }),
            }),
          }),
        };
      }
    }

    // Validate event_status (nếu có)
    if (data.event_status) {
      const eventStatusValidation = validateEventStatus(data.event_status);
      if (!eventStatusValidation.valid) {
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: eventStatusValidation.error,
              }),
            }),
          }),
        };
      }
    }

    // Validate event_type (nếu có)
    if (data.event_type) {
      const eventTypeValidation = validateEventType(data.event_type);
      if (!eventTypeValidation.valid) {
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: eventTypeValidation.error,
              }),
            }),
          }),
        };
      }
    }

    // Nếu tất cả constraints đều valid, trả về success
    return {
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSuccessData,
            error: null,
          }),
        }),
      }),
    };
  });
}

/**
 * Tạo mock insert cho event_invitations table với UNIQUE constraint validation
 */
export function createInvitationInsertMock(
  existingInvitations: Array<{ event_id: string; user_id: string }>
) {
  return jest.fn().mockImplementation((invitations: any[]) => {
    // Kiểm tra UNIQUE constraint cho mỗi invitation
    for (const inv of invitations) {
      const validation = validateEventInvitationUnique(existingInvitations, {
        event_id: inv.event_id,
        user_id: inv.user_id,
      });
      if (!validation.valid) {
        return Promise.resolve({
          data: null,
          error: validation.error,
        });
      }
      // Thêm vào existing invitations
      existingInvitations.push({
        event_id: inv.event_id,
        user_id: inv.user_id,
      });
    }
    return Promise.resolve({
      data: null,
      error: null,
    });
  });
}

/**
 * Tạo mock insert cho event_squads table với UNIQUE constraint validation
 */
export function createSquadInsertMock(
  existingSquads: Array<{ event_id: string; user_id: string }>
) {
  return jest.fn().mockImplementation((squads: any[]) => {
    // Kiểm tra UNIQUE constraint cho mỗi squad
    for (const squad of squads) {
      const validation = validateEventSquadUnique(existingSquads, {
        event_id: squad.event_id,
        user_id: squad.user_id,
      });
      if (!validation.valid) {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: validation.error,
          }),
        };
      }
      // Thêm vào existing squads
      existingSquads.push({
        event_id: squad.event_id,
        user_id: squad.user_id,
      });
    }
    return {
      select: jest.fn().mockResolvedValue({
        data: squads.map((s, i) => ({ id: `squad-${i}`, ...s })),
        error: null,
      }),
    };
  });
}

/**
 * Tạo mock update cho events table khi deleteEvent (cancel event)
 * Kiểm tra constraints:
 * - cancelled_reason required khi event_status = 'cancelled'
 * - cancelled_by NOT NULL
 */
export function createDeleteEventUpdateMock(mockSuccessData: any) {
  return jest.fn().mockImplementation((data: any) => {
    // Validate cancelled_reason required khi event_status = 'cancelled'
    if (data.event_status === 'cancelled') {
      const cancelledReasonValidation = validateCancelledReasonRequired(
        data.event_status,
        data.cancelled_reason
      );
      if (!cancelledReasonValidation.valid) {
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: cancelledReasonValidation.error,
              }),
            }),
          }),
        };
      }
    }

    // Validate cancelled_by NOT NULL
    if (data.cancelled_by === null || data.cancelled_by === undefined) {
      return {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {
                message: 'null value in column "cancelled_by" violates not-null constraint',
                code: '23502',
                details: 'Failing row contains (..., cancelled_by=null).',
              },
            }),
          }),
        }),
      };
    }

    // Nếu tất cả constraints đều valid, trả về success
    return {
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSuccessData,
            error: null,
          }),
        }),
      }),
    };
  });
}

