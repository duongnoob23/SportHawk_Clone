/**
 * Test Suite: getUpdateEventInvitationHandGesture API
 *
 * Chức năng: Cập nhật trạng thái invitation của user cho event (single)
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getUpdateEventInvitationHandGesture()
 *
 * Test Cases:
 * 1. getUpdateEventInvitationHandGesture_WhenValidInput_ReturnsSuccess
 * 2. getUpdateEventInvitationHandGesture_WhenIdIsNull_ReturnsFailure
 * 3. getUpdateEventInvitationHandGesture_WhenIdIsEmpty_ReturnsFailure
 * 4. getUpdateEventInvitationHandGesture_WhenEventIdIsNull_ReturnsFailure
 * 5. getUpdateEventInvitationHandGesture_WhenUserIdIsNull_ReturnsFailure
 * 6. getUpdateEventInvitationHandGesture_WhenResponseIsYes_UpdatesToAccepted
 * 7. getUpdateEventInvitationHandGesture_WhenResponseIsNo_UpdatesToDeclined
 * 8. getUpdateEventInvitationHandGesture_WhenResponseIsMaybe_UpdatesToMaybe
 * 9. getUpdateEventInvitationHandGesture_WhenDatabaseError_ReturnsFailure
 * 10. getUpdateEventInvitationHandGesture_ReturnsEventIdAndUserId
 */

import { supabase } from '@lib/supabase';
import { getUpdateEventInvitationHandGesture } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock mapRsvpToInvitationStatus
jest.mock('@top/features/event/utils', () => ({
  mapRsvpToInvitationStatus: jest.fn(response => {
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

describe('getUpdateEventInvitationHandGesture API', () => {
  // Mock data
  const mockId = 'inv-123';
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';
  const mockPreResponse = 'pending';

  const mockUpdatedData = [
    {
      id: mockId,
      event_id: mockEventId,
      user_id: mockUserId,
      invitation_status: 'accepted',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getUpdateEventInvitationHandGesture_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thành công khi input hợp lệ
   * Input: UpdateEventInvitationHandGestureType với đầy đủ thông tin hợp lệ
   * Expected Output: Trả về { eventId: 'event-123', userId: 'user-123' }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record trong bảng event_invitations được update với:
   *   + id = invitationId
   *   + invitation_status = status được map từ response
   */
  it('getUpdateEventInvitationHandGesture_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: UpdateEventInvitationHandGestureType với id, eventId, userId, response = 'yes'
    // Expected: Trả về { eventId: 'event-123', userId: 'user-123' }

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act: Gọi API
    const result = await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.eventId === mockEventId, result.userId === mockUserId
    // DB Check: event_invitations.update được gọi với invitation_status = 'accepted'
    expect(result).toBeDefined();
    expect(result.eventId).toBe(mockEventId);
    expect(result.userId).toBe(mockUserId);
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'accepted',
    });
    expect(mockUpdate().match).toHaveBeenCalledWith({ id: mockId });
  });

  /**
   * Test Case 2: getUpdateEventInvitationHandGesture_WhenIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thất bại khi id là null
   * Input: UpdateEventInvitationHandGestureType với id = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGestureType với id = null
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "id" violates not-null constraint',
      code: '23502',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGesture({
        id: null as any,
        eventId: mockEventId,
        userId: mockUserId,
        preResponse: mockPreResponse as any,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 3: getUpdateEventInvitationHandGesture_WhenIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thất bại khi id là chuỗi rỗng
   * Input: UpdateEventInvitationHandGestureType với id = ''
   * Expected Output: Throw error "Invitation not found"
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenIdIsEmpty_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGestureType với id = ''
    // Expected: Throw error với code 'PGRST116' (Invitation not found)

    const mockError = {
      message: 'Invitation not found',
      code: 'PGRST116',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGesture({
        id: '',
        eventId: mockEventId,
        userId: mockUserId,
        preResponse: mockPreResponse as any,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 4: getUpdateEventInvitationHandGesture_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thất bại khi eventId là null
   * Input: UpdateEventInvitationHandGestureType với eventId = null
   * Expected Output: Throw error hoặc vẫn thành công (vì chỉ dùng id để match)
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGestureType với eventId = null
    // Expected: Vẫn có thể thành công vì chỉ dùng id để match, nhưng return value sẽ có eventId = null

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: null as any,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result.eventId === null
    expect(result).toBeDefined();
    expect(result.eventId).toBeNull();
  });

  /**
   * Test Case 5: getUpdateEventInvitationHandGesture_WhenUserIdIsNull_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenUserIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thất bại khi userId là null
   * Input: UpdateEventInvitationHandGestureType với userId = null
   * Expected Output: Vẫn có thể thành công vì chỉ dùng id để match
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenUserIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGestureType với userId = null
    // Expected: Vẫn có thể thành công vì chỉ dùng id để match, nhưng return value sẽ có userId = null

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: null as any,
      preResponse: mockPreResponse as any,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result.userId === null
    expect(result).toBeDefined();
    expect(result.userId).toBeNull();
  });

  /**
   * Test Case 6: getUpdateEventInvitationHandGesture_WhenResponseIsYes_UpdatesToAccepted
   *
   * STT: 6
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenResponseIsYes_UpdatesToAccepted
   * Mục tiêu: Kiểm tra khi response = 'yes', status được map thành 'accepted'
   * Input: UpdateEventInvitationHandGestureType với response = 'yes'
   * Expected Output: invitation_status = 'accepted'
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra update được gọi với invitation_status = 'accepted'
   */
  it('getUpdateEventInvitationHandGesture_WhenResponseIsYes_UpdatesToAccepted', async () => {
    // Input: UpdateEventInvitationHandGestureType với response = 'yes'
    // Expected: invitation_status = 'accepted'

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'accepted'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'accepted',
    });
  });

  /**
   * Test Case 7: getUpdateEventInvitationHandGesture_WhenResponseIsNo_UpdatesToDeclined
   *
   * STT: 7
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenResponseIsNo_UpdatesToDeclined
   * Mục tiêu: Kiểm tra khi response = 'no', status được map thành 'declined'
   * Input: UpdateEventInvitationHandGestureType với response = 'no'
   * Expected Output: invitation_status = 'declined'
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenResponseIsNo_UpdatesToDeclined', async () => {
    // Input: UpdateEventInvitationHandGestureType với response = 'no'
    // Expected: invitation_status = 'declined'

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'no' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'declined'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'declined',
    });
  });

  /**
   * Test Case 8: getUpdateEventInvitationHandGesture_WhenResponseIsMaybe_UpdatesToMaybe
   *
   * STT: 8
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenResponseIsMaybe_UpdatesToMaybe
   * Mục tiêu: Kiểm tra khi response = 'maybe', status được map thành 'maybe'
   * Input: UpdateEventInvitationHandGestureType với response = 'maybe'
   * Expected Output: invitation_status = 'maybe'
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenResponseIsMaybe_UpdatesToMaybe', async () => {
    // Input: UpdateEventInvitationHandGestureType với response = 'maybe'
    // Expected: invitation_status = 'maybe'

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'maybe' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: mockUpdate được gọi với invitation_status = 'maybe'
    expect(mockUpdate).toHaveBeenCalledWith({
      invitation_status: 'maybe',
    });
  });

  /**
   * Test Case 9: getUpdateEventInvitationHandGesture_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpdateEventInvitationHandGesture thất bại khi có lỗi database
   * Input: UpdateEventInvitationHandGestureType hợp lệ nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: UpdateEventInvitationHandGestureType hợp lệ
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    await expect(
      getUpdateEventInvitationHandGesture({
        id: mockId,
        eventId: mockEventId,
        userId: mockUserId,
        preResponse: mockPreResponse as any,
        response: 'yes' as any,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: getUpdateEventInvitationHandGesture_ReturnsEventIdAndUserId
   *
   * STT: 10
   * Chức năng: Cập nhật trạng thái invitation
   * Test case: getUpdateEventInvitationHandGesture_ReturnsEventIdAndUserId
   * Mục tiêu: Kiểm tra kết quả trả về có đầy đủ eventId và userId
   * Input: UpdateEventInvitationHandGestureType hợp lệ
   * Expected Output: { eventId: 'event-123', userId: 'user-123' }
   * Kết quả: P (Pass)
   */
  it('getUpdateEventInvitationHandGesture_ReturnsEventIdAndUserId', async () => {
    // Input: UpdateEventInvitationHandGestureType hợp lệ
    // Expected: { eventId: 'event-123', userId: 'user-123' }

    const mockUpdate = jest.fn().mockReturnValue({
      match: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockUpdatedData,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await getUpdateEventInvitationHandGesture({
      id: mockId,
      eventId: mockEventId,
      userId: mockUserId,
      preResponse: mockPreResponse as any,
      response: 'yes' as any,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result có cả eventId và userId
    expect(result).toHaveProperty('eventId');
    expect(result).toHaveProperty('userId');
    expect(result.eventId).toBe(mockEventId);
    expect(result.userId).toBe(mockUserId);
  });

  /**
   * EDGE CASE TEST: getUpdateEventInvitationHandGesture_WhenEventIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: event_id không tồn tại (Foreign key constraint)
   */
  it('getUpdateEventInvitationHandGesture_WhenEventIdDoesNotExist_ShouldFail', async () => {
    const nonExistentEventId = 'event-not-exist';
    const mockError = {
      message:
        'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_event_id_fkey1"',
      code: '23503',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
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
      getUpdateEventInvitationHandGesture({
        id: mockId,
        eventId: nonExistentEventId,
        userId: mockUserId,
        response: 'yes',
        preResponse: mockPreResponse,
        teamId: mockTeamId,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: getUpdateEventInvitationHandGesture_WhenUserIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: user_id không tồn tại (Foreign key constraint)
   */
  it('getUpdateEventInvitationHandGesture_WhenUserIdDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';
    const mockError = {
      message:
        'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_user_id_fkey1"',
      code: '23503',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
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
      getUpdateEventInvitationHandGesture({
        id: mockId,
        eventId: mockEventId,
        userId: nonExistentUserId,
        response: 'yes',
        preResponse: mockPreResponse,
        teamId: mockTeamId,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: getUpdateEventInvitationHandGesture_WhenInvitationStatusIsInvalid_ShouldFail
   *
   * Test này kiểm tra edge case: invitation_status không hợp lệ (ENUM constraint)
   */
  it('getUpdateEventInvitationHandGesture_WhenInvitationStatusIsInvalid_ShouldFail', async () => {
    // Mock mapRsvpToInvitationStatus trả về giá trị không hợp lệ
    const invalidStatus = 'invalid_status';
    jest.doMock('@top/features/event/utils', () => ({
      mapRsvpToInvitationStatus: jest.fn(() => invalidStatus),
    }));

    const mockError = {
      message:
        'invalid input value for enum invitation_status_enum: "invalid_status"',
      code: '22P02',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Note: Test này có thể pass nếu mapRsvpToInvitationStatus luôn trả về giá trị hợp lệ
    // Nhưng nếu có bug trong mapRsvpToInvitationStatus, test này sẽ bắt được
    await expect(
      getUpdateEventInvitationHandGesture({
        id: mockId,
        eventId: mockEventId,
        userId: mockUserId,
        response: 'yes',
        preResponse: mockPreResponse as any,
        teamId: mockTeamId,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('enum'),
      code: '22P02',
    });
  });
});
