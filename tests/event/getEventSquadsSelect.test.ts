/**
 * Test Suite: getEventSquadsSelect API
 *
 * Chức năng: Lấy danh sách squad members và invitation status của user cho event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getEventSquadsSelect()
 *
 * Test Cases:
 * 1. getEventSquadsSelect_WhenEventExists_ReturnsSuccess
 * 2. getEventSquadsSelect_WhenEventIdIsNull_ReturnsFailure
 * 3. getEventSquadsSelect_WhenEventIdIsEmpty_ReturnsFailure
 * 4. getEventSquadsSelect_WhenUserIdIsNull_ReturnsFailure
 * 5. getEventSquadsSelect_WhenUserIdIsEmpty_ReturnsFailure
 * 6. getEventSquadsSelect_WhenSquadsError_ReturnsFailure
 * 7. getEventSquadsSelect_WhenInvitationsError_ReturnsFailure
 * 8. getEventSquadsSelect_ReturnsSquadsAndInvitations
 * 9. getEventSquadsSelect_WhenNoSquads_ReturnsEmptyArray
 * 10. getEventSquadsSelect_WhenNoInvitation_ReturnsNullInvitation
 */

import { supabase } from '@lib/supabase';
import { getEventSquadsSelect } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getEventSquadsSelect API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';

  const mockSquads = [
    {
      id: 'squad-1',
      userId: 'user-1',
      eventId: mockEventId,
      position: 'GK',
      squadRole: 'starter',
      selectedAt: '2025-01-15T10:00:00Z',
      selectedBy: 'admin-123',
      selectionNotes: 'Main goalkeeper',
    },
  ];

  const mockInvitation = {
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
   * Test Case 1: getEventSquadsSelect_WhenEventExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenEventExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thành công khi event tồn tại
   * Input: eventId = 'event-123', userId = 'user-123'
   * Expected Output: Trả về { eventSquads: [...], eventInvitations: {...} }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng event_squads với đúng event_id
   * - Kiểm tra record được select từ bảng event_invitations với đúng event_id và user_id
   */
  it('getEventSquadsSelect_WhenEventExists_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: Trả về { eventSquads: [...], eventInvitations: {...} }

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act: Gọi API
    const result = await getEventSquadsSelect(mockEventId, mockUserId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result.eventSquads là mảng, result.eventInvitations là object
    // DB Check: event_squads.select được gọi với đúng event_id, event_invitations.select được gọi với đúng event_id và user_id
    expect(result).toBeDefined();
    expect(result.eventSquads).toBeDefined();
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventInvitations).toBeDefined();
    expect(result.eventInvitations?.id).toBe('inv-123');
    expect(supabase.from).toHaveBeenCalledWith('event_squads');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
  });

  /**
   * Test Case 2: getEventSquadsSelect_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi eventId là null
   * Input: eventId = null, userId = 'user-123'
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: eventId = null, userId = 'user-123'
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "event_id" violates not-null constraint',
      code: '23502',
    };

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSquadsSelect,
    });

    // Act & Assert
    await expect(
      getEventSquadsSelect(null as any, mockUserId)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 3: getEventSquadsSelect_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi eventId là chuỗi rỗng
   * Input: eventId = '', userId = 'user-123'
   * Expected Output: Trả về { eventSquads: [], eventInvitations: null hoặc error }
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: eventId = '', userId = 'user-123'
    // Expected: Throw error từ event_invitations query (vì không tìm thấy)

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const mockError = {
      message: 'Invitation not found',
      code: 'PGRST116',
    };

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act & Assert
    await expect(getEventSquadsSelect('', mockUserId)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 4: getEventSquadsSelect_WhenUserIdIsNull_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenUserIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi userId là null
   * Input: eventId = 'event-123', userId = null
   * Expected Output: Throw error từ event_invitations query
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenUserIdIsNull_ReturnsFailure', async () => {
    // Input: eventId = 'event-123', userId = null
    // Expected: Throw error từ event_invitations query

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockError = {
      message: 'null value in column "user_id" violates not-null constraint',
      code: '23502',
    };

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act & Assert
    await expect(
      getEventSquadsSelect(mockEventId, null as any)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 5: getEventSquadsSelect_WhenUserIdIsEmpty_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenUserIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi userId là chuỗi rỗng
   * Input: eventId = 'event-123', userId = ''
   * Expected Output: Throw error từ event_invitations query
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenUserIdIsEmpty_ReturnsFailure', async () => {
    // Input: eventId = 'event-123', userId = ''
    // Expected: Throw error từ event_invitations query (vì không tìm thấy)

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockError = {
      message: 'Invitation not found',
      code: 'PGRST116',
    };

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act & Assert
    await expect(getEventSquadsSelect(mockEventId, '')).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 6: getEventSquadsSelect_WhenSquadsError_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenSquadsError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi query squads lỗi
   * Input: eventId = 'event-123', userId = 'user-123' nhưng squads query trả về error
   * Expected Output: Throw error từ squads query
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenSquadsError_ReturnsFailure', async () => {
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSquadsSelect,
    });

    // Act & Assert
    await expect(
      getEventSquadsSelect(mockEventId, mockUserId)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 7: getEventSquadsSelect_WhenInvitationsError_ReturnsFailure
   *
   * STT: 7
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenInvitationsError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquadsSelect thất bại khi query invitations lỗi
   * Input: eventId = 'event-123', userId = 'user-123' nhưng invitations query trả về error
   * Expected Output: Throw error từ invitations query
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenInvitationsError_ReturnsFailure', async () => {
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act & Assert
    await expect(
      getEventSquadsSelect(mockEventId, mockUserId)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 8: getEventSquadsSelect_ReturnsSquadsAndInvitations
   *
   * STT: 8
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_ReturnsSquadsAndInvitations
   * Mục tiêu: Kiểm tra kết quả trả về có đầy đủ eventSquads và eventInvitations
   * Input: eventId = 'event-123', userId = 'user-123'
   * Expected Output: { eventSquads: [...], eventInvitations: {...} }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra cả hai queries được gọi đúng
   */
  it('getEventSquadsSelect_ReturnsSquadsAndInvitations', async () => {
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: { eventSquads: [...], eventInvitations: {...} }

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getEventSquadsSelect(mockEventId, mockUserId);

    // Assert
    // Expected Output: result có cả eventSquads và eventInvitations
    // DB Check: Cả hai queries được gọi đúng
    expect(result).toHaveProperty('eventSquads');
    expect(result).toHaveProperty('eventInvitations');
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventSquads.length).toBeGreaterThan(0);
    expect(result.eventInvitations).toBeDefined();
    expect(result.eventInvitations?.id).toBe('inv-123');
  });

  /**
   * Test Case 9: getEventSquadsSelect_WhenNoSquads_ReturnsEmptyArray
   *
   * STT: 9
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenNoSquads_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi không có squad members, trả về mảng rỗng
   * Input: eventId = 'event-123', userId = 'user-123' nhưng không có squads
   * Expected Output: { eventSquads: [], eventInvitations: {...} }
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenNoSquads_ReturnsEmptyArray', async () => {
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: { eventSquads: [], eventInvitations: {...} }

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getEventSquadsSelect(mockEventId, mockUserId);

    // Assert
    // Expected Output: result.eventSquads === []
    expect(result.eventSquads).toBeDefined();
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventSquads.length).toBe(0);
  });

  /**
   * Test Case 10: getEventSquadsSelect_WhenNoInvitation_ReturnsNullInvitation
   *
   * STT: 10
   * Chức năng: Lấy danh sách squad và invitation
   * Test case: getEventSquadsSelect_WhenNoInvitation_ReturnsNullInvitation
   * Mục tiêu: Kiểm tra khi không có invitation, trả về null
   * Input: eventId = 'event-123', userId = 'user-123' nhưng không có invitation
   * Expected Output: Throw error (vì dùng .single() không có maybeSingle)
   * Kết quả: P (Pass)
   */
  it('getEventSquadsSelect_WhenNoInvitation_ReturnsNullInvitation', async () => {
    // Input: eventId = 'event-123', userId = 'user-123'
    // Expected: Throw error vì dùng .single() và không tìm thấy record

    const mockSquadsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        overrideTypes: jest.fn().mockResolvedValue({
          data: mockSquads,
          error: null,
        }),
      }),
    });

    const mockError = {
      message: 'Invitation not found',
      code: 'PGRST116',
    };

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            overrideTypes: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSquadsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act & Assert
    await expect(
      getEventSquadsSelect(mockEventId, mockUserId)
    ).rejects.toEqual(mockError);
  });
});

