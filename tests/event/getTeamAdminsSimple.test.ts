/**
 * Test Suite: getTeamAdminsSimple API
 *
 * Chức năng: Lấy danh sách team admins đơn giản với flag isChoose
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getTeamAdminsSimple()
 *
 * Test Cases:
 * 1. getTeamAdminsSimple_WhenValidInput_ReturnsSuccess
 * 2. getTeamAdminsSimple_WhenTeamIdIsNull_ReturnsFailure
 * 3. getTeamAdminsSimple_WhenTeamIdIsEmpty_ReturnsFailure
 * 4. getTeamAdminsSimple_WhenEventIdIsNull_ReturnsSuccess
 * 5. getTeamAdminsSimple_WhenEventIdIsEmpty_ReturnsSuccess
 * 6. getTeamAdminsSimple_WhenNoAdmins_ReturnsEmptyArray
 * 7. getTeamAdminsSimple_WhenAdminsHaveInvitations_SetsIsChooseTrue
 * 8. getTeamAdminsSimple_WhenAdminsNoInvitations_SetsIsChooseFalse
 * 9. getTeamAdminsSimple_WhenDatabaseError_ReturnsFailure
 * 10. getTeamAdminsSimple_ReturnsLeaderDataWithAllFields
 * 11. getTeamAdminsSimple_OrdersByIsPrimary
 */

import { supabase } from '@lib/supabase';
import { getTeamAdminsSimple } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getTeamAdminsSimple API', () => {
  // Mock data
  const mockTeamId = 'team-123';
  const mockEventId = 'event-123';

  const mockTeamAdmins = [
    {
      id: 'ta-1',
      teamId: mockTeamId,
      userId: 'admin-1',
      role: 'coach',
      title: 'Head Coach',
      isPrimary: true,
      profiles: {
        id: 'profile-1',
        firstName: 'John',
        lastName: 'Doe',
        profilePhotoUri: 'https://example.com/photo.jpg',
      },
    },
    {
      id: 'ta-2',
      teamId: mockTeamId,
      userId: 'admin-2',
      role: 'manager',
      title: 'Team Manager',
      isPrimary: false,
      profiles: {
        id: 'profile-2',
        firstName: 'Jane',
        lastName: 'Smith',
        profilePhotoUri: null,
      },
    },
  ];

  const mockInvitations = [
    { user_id: 'admin-1' },
    { user_id: 'admin-3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getTeamAdminsSimple_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thành công khi input hợp lệ
   * Input: teamId = 'team-123', eventId = 'event-123'
   * Expected Output: Trả về { leaderData: [...], userIds: [...] }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng team_admins với đúng team_id
   * - Kiểm tra records được select từ bảng event_invitations với đúng event_id
   * - Kiểm tra leaderData có flag isChoose được set đúng dựa trên userIds
   */
  it('getTeamAdminsSimple_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: Trả về { leaderData: [...], userIds: ['admin-1', 'admin-3'] }

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockInvitations,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act: Gọi API
    const result = await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result.leaderData là mảng, result.userIds là mảng, leaderData[0].isChoose === true
    // DB Check: team_admins.select được gọi với đúng team_id, event_invitations.select được gọi với đúng event_id
    expect(result).toBeDefined();
    expect(result.leaderData).toBeDefined();
    expect(Array.isArray(result.leaderData)).toBe(true);
    expect(result.userIds).toBeDefined();
    expect(Array.isArray(result.userIds)).toBe(true);
    expect(result.userIds).toEqual(['admin-1', 'admin-3']);
    expect(result.leaderData[0].isChoose).toBe(true);
    expect(result.leaderData[1].isChoose).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('team_admins');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
  });

  /**
   * Test Case 2: getTeamAdminsSimple_WhenTeamIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenTeamIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thất bại khi teamId là null
   * Input: teamId = null, eventId = 'event-123'
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenTeamIdIsNull_ReturnsFailure', async () => {
    // Input: teamId = null, eventId = 'event-123'
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "team_id" violates not-null constraint',
      code: '23502',
    };

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamAdminsSelect,
    });

    // Act & Assert
    await expect(
      getTeamAdminsSimple(null as any, mockEventId)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 3: getTeamAdminsSimple_WhenTeamIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenTeamIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thất bại khi teamId là chuỗi rỗng
   * Input: teamId = '', eventId = 'event-123'
   * Expected Output: Trả về { leaderData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenTeamIdIsEmpty_ReturnsFailure', async () => {
    // Input: teamId = '', eventId = 'event-123'
    // Expected: Trả về { leaderData: [], userIds: [] } (vì không có record nào match với team_id = '')

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple('', mockEventId);

    // Assert
    // Expected Output: result.leaderData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 4: getTeamAdminsSimple_WhenEventIdIsNull_ReturnsSuccess
   *
   * STT: 4
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenEventIdIsNull_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thành công khi eventId là null
   * Input: teamId = 'team-123', eventId = null
   * Expected Output: Trả về { leaderData: [...], userIds: [] } (vì không có invitations)
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenEventIdIsNull_ReturnsSuccess', async () => {
    // Input: teamId = 'team-123', eventId = null
    // Expected: Trả về { leaderData: [...], userIds: [] } (vì không query được invitations)

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, null as any);

    // Assert
    // Expected Output: result.leaderData là mảng, result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData.length).toBeGreaterThan(0);
    expect(result.userIds).toEqual([]);
    expect(result.leaderData[0].isChoose).toBe(false);
  });

  /**
   * Test Case 5: getTeamAdminsSimple_WhenEventIdIsEmpty_ReturnsSuccess
   *
   * STT: 5
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenEventIdIsEmpty_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thành công khi eventId là chuỗi rỗng
   * Input: teamId = 'team-123', eventId = ''
   * Expected Output: Trả về { leaderData: [...], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenEventIdIsEmpty_ReturnsSuccess', async () => {
    // Input: teamId = 'team-123', eventId = ''
    // Expected: Trả về { leaderData: [...], userIds: [] } (vì không có invitations với event_id = '')

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, '');

    // Assert
    // Expected Output: result.leaderData là mảng, result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData.length).toBeGreaterThan(0);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 6: getTeamAdminsSimple_WhenNoAdmins_ReturnsEmptyArray
   *
   * STT: 6
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenNoAdmins_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi không có admins, trả về mảng rỗng
   * Input: teamId = 'team-123', eventId = 'event-123' nhưng không có admins
   * Expected Output: Trả về { leaderData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenNoAdmins_ReturnsEmptyArray', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: Trả về { leaderData: [], userIds: [] }

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert
    // Expected Output: result.leaderData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 7: getTeamAdminsSimple_WhenAdminsHaveInvitations_SetsIsChooseTrue
   *
   * STT: 7
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenAdminsHaveInvitations_SetsIsChooseTrue
   * Mục tiêu: Kiểm tra khi admin có invitation, isChoose được set thành true
   * Input: teamId = 'team-123', eventId = 'event-123' với admins có trong invitations
   * Expected Output: leaderData có isChoose = true cho admins có trong invitations
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenAdminsHaveInvitations_SetsIsChooseTrue', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: leaderData[0].isChoose === true (vì admin-1 có trong invitations)

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ user_id: 'admin-1' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert
    // Expected Output: result.leaderData[0].isChoose === true, result.leaderData[1].isChoose === false
    expect(result.leaderData[0].isChoose).toBe(true);
    expect(result.leaderData[1].isChoose).toBe(false);
  });

  /**
   * Test Case 8: getTeamAdminsSimple_WhenAdminsNoInvitations_SetsIsChooseFalse
   *
   * STT: 8
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenAdminsNoInvitations_SetsIsChooseFalse
   * Mục tiêu: Kiểm tra khi admin không có invitation, isChoose được set thành false
   * Input: teamId = 'team-123', eventId = 'event-123' với admins không có trong invitations
   * Expected Output: leaderData có isChoose = false cho tất cả admins
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenAdminsNoInvitations_SetsIsChooseFalse', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: Tất cả leaderData có isChoose === false

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert
    // Expected Output: Tất cả result.leaderData có isChoose === false
    expect(result.leaderData.every(l => l.isChoose === false)).toBe(true);
  });

  /**
   * Test Case 9: getTeamAdminsSimple_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamAdminsSimple thất bại khi có lỗi database
   * Input: teamId = 'team-123', eventId = 'event-123' nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getTeamAdminsSimple_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamAdminsSelect,
    });

    // Act & Assert
    await expect(
      getTeamAdminsSimple(mockTeamId, mockEventId)
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: getTeamAdminsSimple_ReturnsLeaderDataWithAllFields
   *
   * STT: 10
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_ReturnsLeaderDataWithAllFields
   * Mục tiêu: Kiểm tra leaderData trả về có đầy đủ các fields cần thiết
   * Input: teamId = 'team-123', eventId = 'event-123'
   * Expected Output: leaderData có đầy đủ fields: id, teamId, userId, role, title, isPrimary, profiles, isChoose
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (teamId:team_id, userId:user_id, etc.)
   */
  it('getTeamAdminsSimple_ReturnsLeaderDataWithAllFields', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: leaderData có đầy đủ fields: id, teamId, userId, role, title, isPrimary, profiles, isChoose

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    const result = await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert
    // Expected Output: result.leaderData[0] có tất cả các fields cần thiết
    // DB Check: select query được gọi với đầy đủ các fields mapping
    expect(result.leaderData.length).toBeGreaterThan(0);
    expect(result.leaderData[0]).toHaveProperty('id');
    expect(result.leaderData[0]).toHaveProperty('teamId');
    expect(result.leaderData[0]).toHaveProperty('userId');
    expect(result.leaderData[0]).toHaveProperty('role');
    expect(result.leaderData[0]).toHaveProperty('title');
    expect(result.leaderData[0]).toHaveProperty('isPrimary');
    expect(result.leaderData[0]).toHaveProperty('profiles');
    expect(result.leaderData[0]).toHaveProperty('isChoose');
    expect(result.leaderData[0].profiles).toHaveProperty('id');
    expect(result.leaderData[0].profiles).toHaveProperty('firstName');
    expect(result.leaderData[0].profiles).toHaveProperty('lastName');
    expect(result.leaderData[0].profiles).toHaveProperty('profilePhotoUri');
  });

  /**
   * Test Case 11: getTeamAdminsSimple_OrdersByIsPrimary
   *
   * STT: 11
   * Chức năng: Lấy danh sách team admins
   * Test case: getTeamAdminsSimple_OrdersByIsPrimary
   * Mục tiêu: Kiểm tra leaderData được sắp xếp theo isPrimary (descending)
   * Input: teamId = 'team-123', eventId = 'event-123'
   * Expected Output: leaderData được sắp xếp với isPrimary = true ở đầu
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra order query được gọi với .order('is_primary', { ascending: false })
   */
  it('getTeamAdminsSimple_OrdersByIsPrimary', async () => {
    // Input: teamId = 'team-123', eventId = 'event-123'
    // Expected: leaderData được sắp xếp với isPrimary = true ở đầu

    const mockTeamAdminsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamAdmins,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockTeamAdminsSelect })
      .mockReturnValueOnce({ select: mockInvitationsSelect });

    // Act
    await getTeamAdminsSimple(mockTeamId, mockEventId);

    // Assert
    // Expected Output: order query được gọi với đúng parameters
    // DB Check: .order('is_primary', { ascending: false }) được gọi
    expect(mockTeamAdminsSelect().eq().order).toHaveBeenCalledWith('is_primary', { ascending: false });
  });
});

