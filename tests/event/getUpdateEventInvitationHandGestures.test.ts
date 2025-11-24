/**
 * Test Suite: getUpdateEventInvitationHandGestures API
 *
 * Chức năng: Cập nhật trạng thái invitation của user cho event (multiple)
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getUpdateEventInvitationHandGestures()
 *
 * Test Cases:
 * 1. getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess
 * 2. getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ReturnsFailure
 * 3. getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ReturnsFailure
 * 4. getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ReturnsFailure
 * 5. getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ReturnsFailure
 * 6. getUpdateEventInvitationHandGestures_WhenResponseIsYes_UpdatesToAccepted
 * 7. getUpdateEventInvitationHandGestures_WhenResponseIsNo_UpdatesToDeclined
 * 8. getUpdateEventInvitationHandGestures_WhenResponseIsMaybe_UpdatesToMaybe
 * 9. getUpdateEventInvitationHandGestures_WhenDatabaseError_ReturnsFailure
 * 10. getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp
 */

import { supabase } from '@lib/supabase';
import { getUpdateEventInvitationHandGestures } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock mapRsvpToInvitationStatus
jest.mock('@top/features/event/utils', () => ({
  mapRsvpToInvitationStatus: jest.fn((response) => {
    switch (response) {
      case 'yes':
        return 'accepted';
      case 'no':
        return 'declined';
      case 'maybe':
        return 'maybe';
      default:
        return 'pending';
    }
  }),
}));

describe('getUpdateEventInvitationHandGestures API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';

  const mockUpdatedData = [
    {
      id: 'inv-123',
      event_id: mockEventId,
      user_id: mockUserId,
      invitation_status: 'accepted',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thành công khi input hợp lệ
   * Input: UpdateEventInvitationHandGesturesType với đầy đủ thông tin hợp lệ
   * Expected Output: Trả về mảng updated invitations
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records trong bảng event_invitations được update với:
   *   + user_id = userId
   *   + event_id = eventId
   *   + invitation_status = status được map từ response
   *   + invited_at = timestamp mới
   */
  it('getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: UpdateEventInvitationHandGesturesType với eventId, userId, response = 'yes'
    // Expected: Trả về mảng updated invitations

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: mockUpdatedData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act: Gọi API
    const result = await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: mockUserId,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result là mảng, result[0].invitation_status === 'accepted'
    // DB Check: event_invitations.update được gọi với invitation_status = 'accepted', invited_at = timestamp
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].invitation_status).toBe('accepted');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'accepted',
      invited_at: expect.any(String),
    });
    expect(mockUpdate().eq).toHaveBeenCalledWith('user_id', mockUserId);
    expect(mockUpdate().eq().eq).toHaveBeenCalledWith('event_id', mockEventId);
  });

  /**
   * Test Case 2: getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thất bại khi eventId là null
   * Input: UpdateEventInvitationHandGesturesType với eventId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGesturesType với eventId = null
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "event_id" violates not-null constraint',
      code: '23502',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGestures({
        eventId: null as any,
        userId: mockUserId,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 3: getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thất bại khi eventId là chuỗi rỗng
   * Input: UpdateEventInvitationHandGesturesType với eventId = ''
   * Expected Output: Trả về mảng rỗng hoặc throw error
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGesturesType với eventId = ''
    // Expected: Trả về mảng rỗng [] (vì không có record nào match với event_id = '')

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await getUpdateEventInvitationHandGestures({
      eventId: '',
      userId: mockUserId,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result === []
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 4: getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thất bại khi userId là null
   * Input: UpdateEventInvitationHandGesturesType với userId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGesturesType với userId = null
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "user_id" violates not-null constraint',
      code: '23502',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGestures({
        eventId: mockEventId,
        userId: null as any,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 5: getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thất bại khi userId là chuỗi rỗng
   * Input: UpdateEventInvitationHandGesturesType với userId = ''
   * Expected Output: Trả về mảng rỗng hoặc throw error
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGesturesType với userId = ''
    // Expected: Trả về mảng rỗng [] (vì không có record nào match với user_id = '')

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: '',
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result === []
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 6: getUpdateEventInvitationHandGestures_WhenResponseIsYes_UpdatesToAccepted
   *
   * STT: 6
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenResponseIsYes_UpdatesToAccepted
   * Mục tiêu: Kiểm tra khi response = 'yes', status được map thành 'accepted'
   * Input: UpdateEventInvitationHandGesturesType với response = 'yes'
   * Expected Output: invitation_status = 'accepted'
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenResponseIsYes_UpdatesToAccepted', async () => {
    // Input: UpdateEventInvitationHandGesturesType với response = 'yes'
    // Expected: invitation_status = 'accepted'

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: mockUpdatedData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: mockUserId,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'accepted'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'accepted',
      invited_at: expect.any(String),
    });
  });

  /**
   * Test Case 7: getUpdateEventInvitationHandGestures_WhenResponseIsNo_UpdatesToDeclined
   *
   * STT: 7
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenResponseIsNo_UpdatesToDeclined
   * Mục tiêu: Kiểm tra khi response = 'no', status được map thành 'declined'
   * Input: UpdateEventInvitationHandGesturesType với response = 'no'
   * Expected Output: invitation_status = 'declined'
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenResponseIsNo_UpdatesToDeclined', async () => {
    // Input: UpdateEventInvitationHandGesturesType với response = 'no'
    // Expected: invitation_status = 'declined'

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: mockUpdatedData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: mockUserId,
      response: 'no' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'declined'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'declined',
      invited_at: expect.any(String),
    });
  });

  /**
   * Test Case 8: getUpdateEventInvitationHandGestures_WhenResponseIsMaybe_UpdatesToMaybe
   *
   * STT: 8
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenResponseIsMaybe_UpdatesToMaybe
   * Mục tiêu: Kiểm tra khi response = 'maybe', status được map thành 'maybe'
   * Input: UpdateEventInvitationHandGesturesType với response = 'maybe'
   * Expected Output: invitation_status = 'maybe'
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenResponseIsMaybe_UpdatesToMaybe', async () => {
    // Input: UpdateEventInvitationHandGesturesType với response = 'maybe'
    // Expected: invitation_status = 'maybe'

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: mockUpdatedData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: mockUserId,
      response: 'maybe' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'maybe'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'maybe',
      invited_at: expect.any(String),
    });
  });

  /**
   * Test Case 9: getUpdateEventInvitationHandGestures_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGestures thất bại khi có lỗi database
   * Input: UpdateEventInvitationHandGesturesType hợp lệ nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGestures_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGesturesType hợp lệ
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGestures({
        eventId: mockEventId,
        userId: mockUserId,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp
   *
   * STT: 10
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp
   * Mục tiêu: Kiểm tra invited_at được update với timestamp mới
   * Input: UpdateEventInvitationHandGesturesType hợp lệ
   * Expected Output: invited_at có giá trị timestamp mới
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra update được gọi với invited_at = timestamp hiện tại
   */
  it('getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp', async () => {
    // Input: UpdateEventInvitationHandGesturesType hợp lệ
    // Expected: invited_at được update với timestamp mới

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: mockUpdatedData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGestures({
      eventId: mockEventId,
      userId: mockUserId,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invited_at là string timestamp
    // DB Check: invited_at có giá trị timestamp hợp lệ
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'accepted',
      invited_at: expect.any(String),
    });
    const calledWith = mockUpdate.mock.calls[0][0];
    expect(calledWith.invited_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  /**
   * EDGE CASE TEST: getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: event_id không tồn tại (Foreign key constraint)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ShouldFail', async () => {
    const nonExistentEventId = 'event-not-exist';
    const mockError = {
      message: 'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_event_id_fkey1"',
      code: '23503',
    };

    // Mock cho update().eq().eq().select() - sẽ trả về foreign key error
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    await expect(
      getUpdateEventInvitationHandGestures({
        eventId: nonExistentEventId,
        userId: mockUserId,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: user_id không tồn tại (Foreign key constraint)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';
    const mockError = {
      message: 'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_user_id_fkey1"',
      code: '23503',
    };

    // Mock cho update().eq().eq().select() - sẽ trả về foreign key error
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    await expect(
      getUpdateEventInvitationHandGestures({
        eventId: mockEventId,
        userId: nonExistentUserId,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });
});

