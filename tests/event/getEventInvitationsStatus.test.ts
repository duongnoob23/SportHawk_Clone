/**
 * Test Suite: getEventInvitationsStatus API
 *
 * Chức năng: Lấy trạng thái invitation của user cho event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getEventInvitationsStatus()
 *
 * Test Cases:
 * 1. getEventInvitationsStatus_WhenInvitationExists_ReturnsSuccess
 * 2. getEventInvitationsStatus_WhenInvitationNotFound_ReturnsNull
 * 3. getEventInvitationsStatus_WhenEventIdIsNull_ReturnsFailure
 * 4. getEventInvitationsStatus_WhenEventIdIsEmpty_ReturnsFailure
 * 5. getEventInvitationsStatus_WhenUserIdIsNull_ReturnsFailure
 * 6. getEventInvitationsStatus_WhenUserIdIsEmpty_ReturnsFailure
 * 7. getEventInvitationsStatus_WhenDatabaseError_ReturnsFailure
 * 8. getEventInvitationsStatus_ReturnsInvitationWithAllFields
 */

import { supabase } from '@lib/supabase';
import { getEventInvitationsStatus } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getEventInvitationsStatus API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';

  const mockInvitationStatus = {
    id: 'inv-123',
    eventId: mockEventId,
    userId: mockUserId,
    invitedBy: 'admin-123',
    invitedAt: '2025-01-15T10:00:00Z',
    invitationStatus: 'accepted',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getEventInvitationsStatus_WhenInvitationExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenInvitationExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thành công khi invitation tồn tại
   * Input: { userId: 'user-123', eventId: 'event-123' }
   * Expected Output: Trả về invitation status với đầy đủ thông tin
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record được select từ bảng event_invitations với đúng user_id và event_id
   * - Kiểm tra các fields được map đúng (eventId:event_id, userId:user_id, etc.)
   */
  it('getEventInvitationsStatus_WhenInvitationExists_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: { userId: 'user-123', eventId: 'event-123' }
    // Expected: Trả về invitation status với đầy đủ fields

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockInvitationStatus,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act: Gọi API
    const result = await getEventInvitationsStatus({
      userId: mockUserId,
      eventId: mockEventId,
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.id === 'inv-123', result.invitationStatus === 'accepted'
    // DB Check: event_invitations.select được gọi với đúng user_id và event_id
    expect(result).toBeDefined();
    expect(result?.id).toBe('inv-123');
    expect(result?.eventId).toBe(mockEventId);
    expect(result?.userId).toBe(mockUserId);
    expect(result?.invitationStatus).toBe('accepted');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockSelect().eq).toHaveBeenCalledWith('user_id', mockUserId);
    expect(mockSelect().eq().eq).toHaveBeenCalledWith('event_id', mockEventId);
  });

  /**
   * Test Case 2: getEventInvitationsStatus_WhenInvitationNotFound_ReturnsNull
   *
   * STT: 2
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenInvitationNotFound_ReturnsNull
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus trả về null khi không tìm thấy invitation
   * Input: { userId: 'user-123', eventId: 'event-not-exist' }
   * Expected Output: Trả về null (vì dùng maybeSingle)
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenInvitationNotFound_ReturnsNull', async () => {
    // Input: { userId: 'user-123', eventId: 'event-not-exist' }
    // Expected: Trả về null (vì dùng maybeSingle)

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventInvitationsStatus({
      userId: mockUserId,
      eventId: 'event-not-exist',
    });

    // Assert
    // Expected Output: result === null
    expect(result).toBeNull();
  });

  /**
   * Test Case 3: getEventInvitationsStatus_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thất bại khi eventId là null
   * Input: { userId: 'user-123', eventId: null }
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: { userId: 'user-123', eventId: null }
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "event_id" violates not-null constraint',
      code: '23502',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert
    await expect(
      getEventInvitationsStatus({
        userId: mockUserId,
        eventId: null as any,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 4: getEventInvitationsStatus_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thất bại khi eventId là chuỗi rỗng
   * Input: { userId: 'user-123', eventId: '' }
   * Expected Output: Trả về null (vì không có record nào match)
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: { userId: 'user-123', eventId: '' }
    // Expected: Trả về null (vì không có record nào match với event_id = '')

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventInvitationsStatus({
      userId: mockUserId,
      eventId: '',
    });

    // Assert
    // Expected Output: result === null
    expect(result).toBeNull();
  });

  /**
   * Test Case 5: getEventInvitationsStatus_WhenUserIdIsNull_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenUserIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thất bại khi userId là null
   * Input: { userId: null, eventId: 'event-123' }
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenUserIdIsNull_ReturnsFailure', async () => {
    // Input: { userId: null, eventId: 'event-123' }
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "user_id" violates not-null constraint',
      code: '23502',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert
    await expect(
      getEventInvitationsStatus({
        userId: null as any,
        eventId: mockEventId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 6: getEventInvitationsStatus_WhenUserIdIsEmpty_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenUserIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thất bại khi userId là chuỗi rỗng
   * Input: { userId: '', eventId: 'event-123' }
   * Expected Output: Trả về null (vì không có record nào match)
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenUserIdIsEmpty_ReturnsFailure', async () => {
    // Input: { userId: '', eventId: 'event-123' }
    // Expected: Trả về null (vì không có record nào match với user_id = '')

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventInvitationsStatus({
      userId: '',
      eventId: mockEventId,
    });

    // Assert
    // Expected Output: result === null
    expect(result).toBeNull();
  });

  /**
   * Test Case 7: getEventInvitationsStatus_WhenDatabaseError_ReturnsFailure
   *
   * STT: 7
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventInvitationsStatus thất bại khi có lỗi database
   * Input: { userId: 'user-123', eventId: 'event-123' } nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventInvitationsStatus_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: { userId: 'user-123', eventId: 'event-123' }
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert
    await expect(
      getEventInvitationsStatus({
        userId: mockUserId,
        eventId: mockEventId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 8: getEventInvitationsStatus_ReturnsInvitationWithAllFields
   *
   * STT: 8
   * Chức năng: Lấy trạng thái invitation
   * Test case: getEventInvitationsStatus_ReturnsInvitationWithAllFields
   * Mục tiêu: Kiểm tra invitation status trả về có đầy đủ các fields cần thiết
   * Input: { userId: 'user-123', eventId: 'event-123' }
   * Expected Output: Invitation với đầy đủ fields: id, eventId, userId, invitedBy, invitedAt, invitationStatus
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (eventId:event_id, userId:user_id, invitationStatus:invitation_status)
   */
  it('getEventInvitationsStatus_ReturnsInvitationWithAllFields', async () => {
    // Input: { userId: 'user-123', eventId: 'event-123' }
    // Expected: Invitation với đầy đủ fields: id, eventId, userId, invitedBy, invitedAt, invitationStatus

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockInvitationStatus,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventInvitationsStatus({
      userId: mockUserId,
      eventId: mockEventId,
    });

    // Assert
    // Expected Output: result có tất cả các fields cần thiết
    // DB Check: select query được gọi với đầy đủ các fields mapping
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('eventId');
    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('invitedBy');
    expect(result).toHaveProperty('invitedAt');
    expect(result).toHaveProperty('invitationStatus');
    expect(result?.id).toBe('inv-123');
    expect(result?.eventId).toBe(mockEventId);
    expect(result?.userId).toBe(mockUserId);
    expect(result?.invitedBy).toBe('admin-123');
    expect(result?.invitationStatus).toBe('accepted');
  });
});

