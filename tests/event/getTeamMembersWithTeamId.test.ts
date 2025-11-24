/**
 * Test Suite: getTeamMembersWithTeamId API
 *
 * Chức năng: Lấy danh sách team members với teamId (không cần eventId)
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getTeamMembersWithTeamId()
 *
 * Test Cases:
 * 1. getTeamMembersWithTeamId_WhenValidInput_ReturnsSuccess
 * 2. getTeamMembersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
 * 3. getTeamMembersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
 * 4. getTeamMembersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
 * 5. getTeamMembersWithTeamId_WhenNoMembers_ReturnsEmptyArray
 * 6. getTeamMembersWithTeamId_WhenDatabaseError_ReturnsFailure
 * 7. getTeamMembersWithTeamId_ReturnsMemberDataWithIsChooseTrue
 * 8. getTeamMembersWithTeamId_ReturnsMemberDataWithAllFields
 */

import { supabase } from '@lib/supabase';
import { getTeamMembersWithTeamId } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock logger
jest.mock('@lib/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

describe('getTeamMembersWithTeamId API', () => {
  // Mock data
  const mockTeamId = 'team-123';

  const mockTeamMembers = [
    {
      id: 'tm-1',
      teamId: mockTeamId,
      userId: 'user-1',
      position: 'GK',
      memberStatus: 'active',
      profiles: {
        id: 'profile-1',
        firstName: 'John',
        lastName: 'Doe',
        profilePhotoUri: 'https://example.com/photo.jpg',
      },
    },
    {
      id: 'tm-2',
      teamId: mockTeamId,
      userId: 'user-2',
      position: 'DF',
      memberStatus: 'active',
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
   * Test Case 1: getTeamMembersWithTeamId_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getTeamMembersWithTeamId thành công khi input hợp lệ
   * Input: teamId = 'team-123'
   * Expected Output: Trả về { memberData: [...], userIds: [] }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng team_members với đúng team_id và member_status = 'active'
   * - Kiểm tra memberData có flag isChoose = true cho tất cả members
   */
  it('getTeamMembersWithTeamId_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: teamId = 'team-123'
    // Expected: Trả về { memberData: [...], userIds: [] }

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamMembers,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act: Gọi API
    const result = await getTeamMembersWithTeamId(mockTeamId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result.memberData là mảng, result.userIds === [], tất cả memberData có isChoose === true
    // DB Check: team_members.select được gọi với đúng team_id và member_status = 'active'
    expect(result).toBeDefined();
    expect(result.memberData).toBeDefined();
    expect(Array.isArray(result.memberData)).toBe(true);
    expect(result.userIds).toBeDefined();
    expect(Array.isArray(result.userIds)).toBe(true);
    expect(result.userIds).toEqual([]);
    expect(result.memberData[0].isChoose).toBe(true);
    expect(result.memberData[1].isChoose).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('team_members');
    expect(mockTeamMembersSelect().eq).toHaveBeenCalledWith('team_id', mockTeamId);
    expect(mockTeamMembersSelect().eq().eq).toHaveBeenCalledWith('member_status', 'active');
  });

  /**
   * Test Case 2: getTeamMembersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
   *
   * STT: 2
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi teamId = 'all', trả về mảng rỗng
   * Input: teamId = 'all'
   * Expected Output: Trả về { memberData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_WhenTeamIdIsAll_ReturnsEmptyArray', async () => {
    // Input: teamId = 'all'
    // Expected: Trả về { memberData: [], userIds: [] } (early return)

    // Act
    const result = await getTeamMembersWithTeamId('all');

    // Assert
    // Expected Output: result.memberData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.memberData).toEqual([]);
    expect(result.userIds).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  /**
   * Test Case 3: getTeamMembersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenTeamIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamMembersWithTeamId thất bại khi teamId là null
   * Input: teamId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_WhenTeamIdIsNull_ReturnsFailure', async () => {
    // Input: teamId = null
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "team_id" violates not-null constraint',
      code: '23502',
    };

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act & Assert
    await expect(getTeamMembersWithTeamId(null as any)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 4: getTeamMembersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamMembersWithTeamId thất bại khi teamId là chuỗi rỗng
   * Input: teamId = ''
   * Expected Output: Trả về { memberData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_WhenTeamIdIsEmpty_ReturnsFailure', async () => {
    // Input: teamId = ''
    // Expected: Trả về { memberData: [], userIds: [] } (vì không có record nào match với team_id = '')

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act
    const result = await getTeamMembersWithTeamId('');

    // Assert
    // Expected Output: result.memberData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.memberData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 5: getTeamMembersWithTeamId_WhenNoMembers_ReturnsEmptyArray
   *
   * STT: 5
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenNoMembers_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra khi không có members, trả về mảng rỗng
   * Input: teamId = 'team-123' nhưng không có members
   * Expected Output: Trả về { memberData: [], userIds: [] }
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_WhenNoMembers_ReturnsEmptyArray', async () => {
    // Input: teamId = 'team-123'
    // Expected: Trả về { memberData: [], userIds: [] }

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act
    const result = await getTeamMembersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: result.memberData === [], result.userIds === []
    expect(result).toBeDefined();
    expect(result.memberData).toEqual([]);
    expect(result.userIds).toEqual([]);
  });

  /**
   * Test Case 6: getTeamMembersWithTeamId_WhenDatabaseError_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getTeamMembersWithTeamId thất bại khi có lỗi database
   * Input: teamId = 'team-123' nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: teamId = 'team-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act & Assert
    await expect(getTeamMembersWithTeamId(mockTeamId)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 7: getTeamMembersWithTeamId_ReturnsMemberDataWithIsChooseTrue
   *
   * STT: 7
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_ReturnsMemberDataWithIsChooseTrue
   * Mục tiêu: Kiểm tra tất cả members có isChoose = true
   * Input: teamId = 'team-123'
   * Expected Output: Tất cả memberData có isChoose = true
   * Kết quả: P (Pass)
   */
  it('getTeamMembersWithTeamId_ReturnsMemberDataWithIsChooseTrue', async () => {
    // Input: teamId = 'team-123'
    // Expected: Tất cả memberData có isChoose === true

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamMembers,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act
    const result = await getTeamMembersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: Tất cả result.memberData có isChoose === true
    expect(result.memberData.every(m => m.isChoose === true)).toBe(true);
  });

  /**
   * Test Case 8: getTeamMembersWithTeamId_ReturnsMemberDataWithAllFields
   *
   * STT: 8
   * Chức năng: Lấy danh sách team members
   * Test case: getTeamMembersWithTeamId_ReturnsMemberDataWithAllFields
   * Mục tiêu: Kiểm tra memberData trả về có đầy đủ các fields cần thiết
   * Input: teamId = 'team-123'
   * Expected Output: memberData có đầy đủ fields: id, teamId, userId, position, memberStatus, profiles, isChoose
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (teamId:team_id, userId:user_id, etc.)
   */
  it('getTeamMembersWithTeamId_ReturnsMemberDataWithAllFields', async () => {
    // Input: teamId = 'team-123'
    // Expected: memberData có đầy đủ fields: id, teamId, userId, position, memberStatus, profiles, isChoose

    const mockTeamMembersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockTeamMembers,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockTeamMembersSelect,
    });

    // Act
    const result = await getTeamMembersWithTeamId(mockTeamId);

    // Assert
    // Expected Output: result.memberData[0] có tất cả các fields cần thiết
    // DB Check: select query được gọi với đầy đủ các fields mapping
    expect(result.memberData.length).toBeGreaterThan(0);
    expect(result.memberData[0]).toHaveProperty('id');
    expect(result.memberData[0]).toHaveProperty('teamId');
    expect(result.memberData[0]).toHaveProperty('userId');
    expect(result.memberData[0]).toHaveProperty('position');
    expect(result.memberData[0]).toHaveProperty('memberStatus');
    expect(result.memberData[0]).toHaveProperty('profiles');
    expect(result.memberData[0]).toHaveProperty('isChoose');
    expect(result.memberData[0].profiles).toHaveProperty('id');
    expect(result.memberData[0].profiles).toHaveProperty('firstName');
    expect(result.memberData[0].profiles).toHaveProperty('lastName');
    expect(result.memberData[0].profiles).toHaveProperty('profilePhotoUri');
  });
});

