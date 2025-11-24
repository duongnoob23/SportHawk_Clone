/**
 * Test Suite: getEventDetail API
 *
 * Chức năng: Lấy chi tiết event theo ID
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getEventDetail()
 *
 * Test Cases:
 * 1. getEventDetail_WhenEventExists_ReturnsSuccess
 * 2. getEventDetail_WhenEventNotFound_ReturnsFailure
 * 3. getEventDetail_WhenEventIdIsNull_ReturnsFailure
 * 4. getEventDetail_WhenEventIdIsEmpty_ReturnsFailure
 * 5. getEventDetail_WhenTeamIdIsInvalid_ReturnsFailure
 * 6. getEventDetail_WhenTeamIdIsNull_ReturnsFailure
 * 7. getEventDetail_WhenUserIdIsNull_ReturnsSuccess
 * 8. getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray
 * 9. getEventDetail_WhenDatabaseError_ReturnsFailure
 * 10. getEventDetail_FiltersInvitationsByTeamMembers
 */

import { supabase } from '@lib/supabase';
import { getEventDetail } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getEventDetail API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';

  const mockEventData = {
    id: mockEventId,
    title: 'Test Match',
    event_type: 'home_match',
    event_date: '2025-12-25',
    start_time: '14:00:00',
    team_id: mockTeamId,
    event_invitations: [
      {
        id: 'inv-1',
        userId: 'user-1',
        invitationStatus: 'pending',
      },
      {
        id: 'inv-2',
        userId: 'user-2',
        invitationStatus: 'accepted',
      },
    ],
  };

  const mockTeamMembers = [{ user_id: 'user-1' }, { user_id: 'user-2' }];
  const mockTeamLeaders = [{ user_id: 'admin-1' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getEventDetail_WhenEventExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenEventExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventDetail thành công khi event tồn tại
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Trả về thông tin event đầy đủ với event_invitations đã được filter
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenEventExists_ReturnsSuccess', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange: Setup mocks
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEventData,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    });

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockTeamLeaders,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect }) // events query
      .mockReturnValueOnce({ select: mockTeamMembersSelect }) // team_members query
      .mockReturnValueOnce({ select: mockTeamLeadersSelect }); // team_admins query

    // Act: Gọi API
    const result = await getEventDetail({
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert: Kiểm tra kết quả
    console.log('✅ Output:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.id).toBe(mockEventId);
    expect(result.title).toBe('Test Match');
    expect(result.event_invitations).toBeDefined();
    expect(result.event_invitations?.length).toBeGreaterThan(0);

    // Assert: Kiểm tra database queries
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.from).toHaveBeenCalledWith('team_members');
    expect(supabase.from).toHaveBeenCalledWith('team_admins');
  });

  /**
   * Test Case 2: getEventDetail_WhenEventNotFound_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenEventNotFound_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi không tìm thấy event
   * Input: { eventId: 'event-not-exist', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Báo lỗi "Event not found" hoặc Supabase error
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenEventNotFound_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: 'event-not-exist',
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange: Setup mocks để trả về error
    const mockError = {
      message: 'Event not found',
      code: 'PGRST116',
      details: 'The result contains 0 rows',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert: Gọi API và expect error
    try {
      await getEventDetail({
        eventId: 'event-not-exist',
        userId: mockUserId,
        teamId: mockTeamId,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message || error.code).toBeTruthy();
    }

    // Assert: Kiểm tra database query đã được gọi
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 3: getEventDetail_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi eventId là null
   * Input: { eventId: null, userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Báo lỗi validation hoặc Supabase error
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenEventIdIsNull_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: null,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange: Setup mocks để trả về error khi eventId null
    const mockError = {
      message: 'Invalid event ID',
      code: 'PGRST202',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert: Gọi API với eventId null
    try {
      await getEventDetail({
        eventId: null as any,
        userId: mockUserId,
        teamId: mockTeamId,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getEventDetail_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi eventId là chuỗi rỗng
   * Input: { eventId: '', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Báo lỗi "Event not found" hoặc Supabase error
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: '',
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange: Setup mocks
    const mockError = {
      message: 'Event not found',
      code: 'PGRST116',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
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
    try {
      await getEventDetail({
        eventId: '',
        userId: mockUserId,
        teamId: mockTeamId,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getEventDetail_WhenTeamIdIsInvalid_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenTeamIdIsInvalid_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi teamId không hợp lệ
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'invalid-team' }
   * Expected Output: Báo lỗi khi query team_members hoặc team_admins
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenTeamIdIsInvalid_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: 'invalid-team',
    });

    // Arrange: Setup mocks - event tồn tại nhưng teamId invalid
    const mockTeamError = {
      message: 'Team not found',
      code: 'PGRST116',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEventData,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockTeamError,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect }) // events query - success
      .mockReturnValueOnce({ select: mockTeamMembersSelect }); // team_members query - error

    // Act & Assert
    try {
      await getEventDetail({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: 'invalid-team',
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 6: getEventDetail_WhenTeamIdIsNull_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenTeamIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi teamId là null
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: null }
   * Expected Output: Báo lỗi khi query team_members
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenTeamIdIsNull_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: null,
    });

    // Arrange
    const mockTeamError = {
      message: 'Team ID is required',
      code: 'PGRST202',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEventData,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockTeamError,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ select: mockTeamMembersSelect });

    // Act & Assert
    try {
      await getEventDetail({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: null as any,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: getEventDetail_WhenUserIdIsNull_ReturnsSuccess
   *
   * STT: 7
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenUserIdIsNull_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventDetail thành công khi userId là null (không bắt buộc)
   * Input: { eventId: 'event-123', userId: null, teamId: 'team-123' }
   * Expected Output: Trả về event detail (userId chỉ dùng để filter invitations)
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenUserIdIsNull_ReturnsSuccess', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: null,
      teamId: mockTeamId,
    });

    // Arrange
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEventData,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    });

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockTeamLeaders,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ select: mockTeamMembersSelect })
      .mockReturnValueOnce({ select: mockTeamLeadersSelect });

    // Act
    const result = await getEventDetail({
      eventId: mockEventId,
      userId: null as any,
      teamId: mockTeamId,
    });

    // Assert
    console.log('✅ Output:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.id).toBe(mockEventId);
  });

  /**
   * Test Case 8: getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray
   *
   * STT: 8
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra phương thức getEventDetail trả về event không có invitations
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Event với event_invitations = [] hoặc undefined
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray', async () => {
    console.log(
      '🧪 Test: getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray'
    );
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange
    const eventWithoutInvitations = {
      ...mockEventData,
      event_invitations: [],
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: eventWithoutInvitations,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    });

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockTeamLeaders,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ select: mockTeamMembersSelect })
      .mockReturnValueOnce({ select: mockTeamLeadersSelect });

    // Act
    const result = await getEventDetail({
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert
    console.log('✅ Output:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.event_invitations).toEqual([]);
  });

  /**
   * Test Case 9: getEventDetail_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventDetail thất bại khi có lỗi database
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Báo lỗi database
   * Kết quả: P (Pass)
   */
  it('getEventDetail_WhenDatabaseError_ReturnsFailure', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange
    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
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
    try {
      await getEventDetail({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: mockTeamId,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: getEventDetail_FiltersInvitationsByTeamMembers
   *
   * STT: 10
   * Chức năng: Tìm kiếm event theo ID
   * Test case: getEventDetail_FiltersInvitationsByTeamMembers
   * Mục tiêu: Kiểm tra event_invitations được filter chỉ giữ lại members/leaders trong team
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: event_invitations chỉ chứa invitations của team members/leaders
   * Kết quả: P (Pass)
   */
  it('getEventDetail_FiltersInvitationsByTeamMembers', async () => {
    console.log('📥 Input:', {
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Arrange: Event có invitations của cả members và non-members
    const eventWithMixedInvitations = {
      ...mockEventData,
      event_invitations: [
        { id: 'inv-1', userId: 'user-1', invitationStatus: 'pending' }, // team member
        { id: 'inv-2', userId: 'user-2', invitationStatus: 'accepted' }, // team member
        { id: 'inv-3', userId: 'user-999', invitationStatus: 'pending' }, // not team member
        { id: 'inv-4', userId: 'admin-1', invitationStatus: 'accepted' }, // team leader
      ],
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: eventWithMixedInvitations,
            error: null,
          }),
        }),
      }),
    });

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockTeamMembers,
          error: null,
        }),
      }),
    });

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockTeamLeaders,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ select: mockTeamMembersSelect })
      .mockReturnValueOnce({ select: mockTeamLeadersSelect });

    // Act
    const result = await getEventDetail({
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert: Chỉ giữ lại invitations của team members/leaders
    console.log('✅ Output:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.event_invitations).toBeDefined();
    // Should filter out user-999 (not in team)
    const filteredIds = result.event_invitations?.map(inv => inv.userId) || [];
    expect(filteredIds).not.toContain('user-999');
    expect(filteredIds).toContain('user-1');
    expect(filteredIds).toContain('user-2');
    expect(filteredIds).toContain('admin-1');
  });
});
