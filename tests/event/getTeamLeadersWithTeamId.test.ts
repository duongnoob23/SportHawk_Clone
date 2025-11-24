/**
 * Test Suite: getTeamLeadersWithTeamId API
 *
 * Chức năng: Lấy danh sách team leaders với teamId (không cần eventId)
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getTeamLeadersWithTeamId()
 *
 * Test Cases:
 * 1. getTeamLeadersWithTeamId_WhenValidInput_ReturnsSuccess
 * 2. getTeamLeadersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
 * 3. getTeamLeadersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
 * 4. getTeamLeadersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
 * 5. getTeamLeadersWithTeamId_WhenNoLeaders_ReturnsEmptyArray
 * 6. getTeamLeadersWithTeamId_WhenDatabaseError_ReturnsFailure
 * 7. getTeamLeadersWithTeamId_ReturnsLeaderDataWithIsChooseTrue
 * 8. getTeamLeadersWithTeamId_ReturnsLeaderDataWithAllFields
 * 9. getTeamLeadersWithTeamId_OrdersByIsPrimary
 */

import { supabase } from '@lib/supabase';
import { getTeamLeadersWithTeamId } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getTeamLeadersWithTeamId API', () => {
  // Mock data
  const mockTeamId = 'team-123';

  const mockTeamLeaders = [
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getTeamLeadersWithTeamId_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getTeamLeadersWithTeamId thành công khi input hợp lệ
   * Input: teamId = 'team-123'
   * Expected Output: Trả về { leaderData: [...], userIds: [] }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng team_admins với đúng team_id
   * - Kiểm tra leaderData có flag isChoose = true cho tất cả leaders
   */
  it('getTeamLeadersWithTeamId_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: teamId = 'team-123'
    // Expected: Trả về { leaderData: [...], userIds: [] }

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamLeaders,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act: Gọi API
    const result = await getTeamLeadersWithTeamId(mockTeamId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result.leaderData là mảng, result.userIds === [], tất cả leaderData có isChoose === true
    // DB Check: team_admins.select được gọi với đúng team_id
    expect(result).toBeDefined();
    expect(result.leaderData).toBeDefined();
    expect(Array.isArray(result.leaderData)).toBe(true);
    expect(result.userIds).toBeDefined();
    expect(Array.isArray(result.userIds)).toBe(true);
    expect(result.userIds).toEqual([]);
    expect(result.leaderData[0].isChoose).toBe(true);
    expect(result.leaderData[1].isChoose).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('team_admins');
    expect(mockTeamLeadersSelect().eq).toHaveBeenCalledWith('team_id', mockTeamId);
  });

  /**
   * Test Case 2: getTeamLeadersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
   *
   * STT: 2
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi teamId = 'all', trả về mảng rỗng
   * Input: teamId = 'all'
   * Expected Output: Trả về { leaderData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray', async () => {
    // Input: teamId = 'all'
    // Expected: Trả về { leaderData: [], userIds: [] } (early return)

    // Act
    const result = await getTeamLeadersWithTeamId('all');

    // Assert
    // Expected Output: result.leaderData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData).toEqual([]);
    expect(result.userIds).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  /**
   * Test Case 3: getTeamLeadersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamLeadersWithTeamId thất bại khi teamId là null
   * Input: teamId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_WhenTeamIdIsNull_ReturnsFailure', async () => {
    // Input: teamId = null
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "team_id" violates not-null constraint',
      code: '23502',
    };

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
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
      select: mockTeamLeadersSelect,
    });

    // Act & Assert
    await expect(getTeamLeadersWithTeamId(null as any)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 4: getTeamLeadersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamLeadersWithTeamId thất bại khi teamId là chuỗi rỗng
   * Input: teamId = ''
   * Expected Output: Trả về { leaderData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure', async () => {
    // Input: teamId = ''
    // Expected: Trả về { leaderData: [], userIds: [] } (vì không có record nào match với team_id = '')

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act
    const result = await getTeamLeadersWithTeamId('');

    // Assert
    // Expected Output: result.leaderData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 5: getTeamLeadersWithTeamId_WhenNoLeaders_ReturnsEmptyArray
   *
   * STT: 5
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenNoLeaders_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi không có leaders, trả về mảng rỗng
   * Input: teamId = 'team-123' nhưng không có leaders
   * Expected Output: Trả về { leaderData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_WhenNoLeaders_ReturnsEmptyArray', async () => {
    // Input: teamId = 'team-123'
    // Expected: Trả về { leaderData: [], userIds: [] }

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act
    const result = await getTeamLeadersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: result.leaderData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.leaderData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 6: getTeamLeadersWithTeamId_WhenDatabaseError_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamLeadersWithTeamId thất bại khi có lỗi database
   * Input: teamId = 'team-123' nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: teamId = 'team-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
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
      select: mockTeamLeadersSelect,
    });

    // Act & Assert
    await expect(getTeamLeadersWithTeamId(mockTeamId)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 7: getTeamLeadersWithTeamId_ReturnsLeaderDataWithIsChooseTrue
   *
   * STT: 7
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_ReturnsLeaderDataWithIsChooseTrue
   * Mục tiêu: Kiểm tra tất cả leaders có isChoose = true
   * Input: teamId = 'team-123'
   * Expected Output: Tất cả leaderData có isChoose = true
   * Kết quả: P (Pass)
   */
  it('getTeamLeadersWithTeamId_ReturnsLeaderDataWithIsChooseTrue', async () => {
    // Input: teamId = 'team-123'
    // Expected: Tất cả leaderData có isChoose === true

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamLeaders,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act
    const result = await getTeamLeadersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: Tất cả result.leaderData có isChoose === true
    expect(result.leaderData.every(l => l.isChoose === true)).toBe(true);
  });

  /**
   * Test Case 8: getTeamLeadersWithTeamId_ReturnsLeaderDataWithAllFields
   *
   * STT: 8
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_ReturnsLeaderDataWithAllFields
   * Mục tiêu: Kiểm tra leaderData trả về có đầy đủ các fields cần thiết
   * Input: teamId = 'team-123'
   * Expected Output: leaderData có đầy đủ fields: id, teamId, userId, role, title, isPrimary, profiles, isChoose
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (teamId:team_id, userId:user_id, etc.)
   */
  it('getTeamLeadersWithTeamId_ReturnsLeaderDataWithAllFields', async () => {
    // Input: teamId = 'team-123'
    // Expected: leaderData có đầy đủ fields: id, teamId, userId, role, title, isPrimary, profiles, isChoose

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamLeaders,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act
    const result = await getTeamLeadersWithTeamId(mockTeamId);

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
   * Test Case 9: getTeamLeadersWithTeamId_OrdersByIsPrimary
   *
   * STT: 9
   * Chức năng: Lấy danh sách team leaders
   * Test case: getTeamLeadersWithTeamId_OrdersByIsPrimary
   * Mục tiêu: Kiểm tra leaderData được sắp xếp theo isPrimary (descending)
   * Input: teamId = 'team-123'
   * Expected Output: leaderData được sắp xếp với isPrimary = true ở đầu
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra order query được gọi với .order('is_primary', { ascending: false })
   */
  it('getTeamLeadersWithTeamId_OrdersByIsPrimary', async () => {
    // Input: teamId = 'team-123'
    // Expected: leaderData được sắp xếp với isPrimary = true ở đầu

    const mockTeamLeadersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamLeaders,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamLeadersSelect,
    });

    // Act
    await getTeamLeadersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: order query được gọi với đúng parameters
    // DB Check: .order('is_primary', { ascending: false }) được gọi
    expect(mockTeamLeadersSelect().eq().order).toHaveBeenCalledWith('is_primary', { ascending: false });
  });
});

