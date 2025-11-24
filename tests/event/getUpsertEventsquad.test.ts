/**
 * Test Suite: getUpsertEventsquad API
 *
 * Chức năng: Thêm hoặc xóa squad members cho event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getUpsertEventsquad()
 *
 * Test Cases:
 * 1. getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers
 * 2. getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers
 * 3. getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes
 * 4. getUpsertEventsquad_WhenEventIdIsNull_ReturnsFailure
 * 5. getUpsertEventsquad_WhenEventIdIsEmpty_ReturnsFailure
 * 6. getUpsertEventsquad_WhenNoChanges_ReturnsNoChange
 * 7. getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates
 * 8. getUpsertEventsquad_WhenDatabaseError_ReturnsFailure
 * 9. getUpsertEventsquad_WhenDeleteError_ReturnsFailure
 * 10. getUpsertEventsquad_WhenInsertError_ReturnsFailure
 * 11. getUpsertEventsquad_ReturnsCorrectCounts
 * 12. getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange
 */

import { supabase } from '@lib/supabase';
import { getUpsertEventsquad } from '@top/features/event/api/event';
import { validateEventSquadUnique } from '../helpers/constraintValidators';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getUpsertEventsquad API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';
  const mockSelectedBy = 'admin-123';
  const mockPreMatchMessage = 'Test message';

  const mockCurrentRecords = [{ user_id: 'user-1' }, { user_id: 'user-2' }];

  const mockInsertedSquadMembers = [
    {
      id: 'squad-3',
      event_id: mockEventId,
      user_id: 'user-3',
      selected_by: mockSelectedBy,
      selected_at: '2025-01-15T10:00:00Z',
      position: null,
      squad_role: null,
      selection_notes: mockPreMatchMessage,
    },
  ];

  const mockFinalRecords = [
    { id: 'squad-1' },
    { id: 'squad-2' },
    { id: 'squad-3' },
  ];

  // Track existing squads để kiểm tra UNIQUE constraint
  let existingSquads: Array<{ event_id: string; user_id: string }> = [];

  beforeEach(() => {
    jest.clearAllMocks();
    existingSquads = []; // Reset existing squads
    // Initialize với current records
    mockCurrentRecords.forEach(record => {
      existingSquads.push({
        event_id: mockEventId,
        user_id: record.user_id,
      });
    });
  });

  /**
   * Test Case 1: getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers
   *
   * STT: 1
   * Chức năng: Thêm squad members
   * Test case: getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thành công khi thêm members
   * Input: UpsertEventsquadType với addMember = ['user-3']
   * Expected Output: Trả về { success: true, updated: 'changed', addedCount: 1, ... }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng event_squads để lấy currentIds
   * - Kiểm tra records được insert vào bảng event_squads với đúng event_id, user_id, selected_by
   * - Kiểm tra records được select lại để lấy finalCount
   */
  it('getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers', async () => {
    // Arrange: Setup mocks
    // Input: UpsertEventsquadType với addMember = ['user-3'], removeMember = []
    // Expected: Trả về { success: true, updated: 'changed', addedCount: 1, removedCount: 0, totalCount: 3 }

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    // Mock insert với UNIQUE constraint validation
    const mockInsert = jest.fn().mockImplementation((squads: any[]) => {
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
          data: mockInsertedSquadMembers,
          error: null,
        }),
      };
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockFinalRecords,
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ insert: mockInsert })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act: Gọi API
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: ['user-3'],
      removeMember: [],
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.success === true, result.addedCount === 1, result.removedCount === 0
    // DB Check: event_squads.insert được gọi với array chứa user-3
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.updated).toBe('changed');
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(0);
    expect(result.totalCount).toBe(3);
    expect(result.previousCount).toBe(2);
    expect(supabase.from).toHaveBeenCalledWith('event_squads');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-3',
          selected_by: mockSelectedBy,
          selection_notes: mockPreMatchMessage,
        }),
      ])
    );
  });

  /**
   * Test Case 2: getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers
   *
   * STT: 2
   * Chức năng: Xóa squad members
   * Test case: getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thành công khi xóa members
   * Input: UpsertEventsquadType với removeMember = ['user-1']
   * Expected Output: Trả về { success: true, updated: 'changed', removedCount: 1, ... }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được delete từ bảng event_squads với đúng event_id và user_id
   */
  it('getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers', async () => {
    // Input: UpsertEventsquadType với addMember = [], removeMember = ['user-1']
    // Expected: Trả về { success: true, updated: 'changed', removedCount: 1, addedCount: 0 }

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: null,
          count: 1,
        }),
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ id: 'squad-2' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: [],
      removeMember: ['user-1'],
    });

    // Assert
    // Expected Output: result.success === true, result.removedCount === 1, result.addedCount === 0
    // DB Check: event_squads.delete được gọi với .eq('event_id', eventId).in('user_id', ['user-1'])
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.updated).toBe('changed');
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(0);
    expect(mockDelete().eq).toHaveBeenCalledWith('event_id', mockEventId);
    expect(mockDelete().eq().in).toHaveBeenCalledWith('user_id', ['user-1']);
  });

  /**
   * Test Case 3: getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes
   *
   * STT: 3
   * Chức năng: Thêm và xóa squad members
   * Test case: getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thành công khi vừa thêm vừa xóa
   * Input: UpsertEventsquadType với addMember và removeMember đều có giá trị
   * Expected Output: Trả về { success: true, updated: 'changed', addedCount > 0, removedCount > 0 }
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes', async () => {
    // Input: UpsertEventsquadType với addMember = ['user-3'], removeMember = ['user-1']
    // Expected: Trả về { success: true, updated: 'changed', addedCount: 1, removedCount: 1 }

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: null,
          count: 1,
        }),
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: mockInsertedSquadMembers,
        error: null,
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ id: 'squad-2' }, { id: 'squad-3' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: ['user-3'],
      removeMember: ['user-1'],
    });

    // Assert
    // Expected Output: result.success === true, result.addedCount === 1, result.removedCount === 1
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.updated).toBe('changed');
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(1);
  });

  /**
   * Test Case 4: getUpsertEventsquad_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi eventId là null
   * Input: UpsertEventsquadType với eventId = null
   * Expected Output: Throw error "eventId is required"
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: UpsertEventsquadType với eventId = null
    // Expected: Throw error với message "eventId is required"

    // Act & Assert
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: null as any,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: [],
        removeMember: [],
      })
    ).rejects.toThrow('eventId is required');
  });

  /**
   * Test Case 5: getUpsertEventsquad_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi eventId là chuỗi rỗng
   * Input: UpsertEventsquadType với eventId = ''
   * Expected Output: Throw error "eventId is required"
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: UpsertEventsquadType với eventId = ''
    // Expected: Throw error với message "eventId is required"

    // Act & Assert
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: '',
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: [],
        removeMember: [],
      })
    ).rejects.toThrow('eventId is required');
  });

  /**
   * Test Case 6: getUpsertEventsquad_WhenNoChanges_ReturnsNoChange
   *
   * STT: 6
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_WhenNoChanges_ReturnsNoChange
   * Mục tiêu: Kiểm tra khi không có thay đổi, trả về no-change
   * Input: UpsertEventsquadType với addMember = [], removeMember = []
   * Expected Output: Trả về { success: false, updated: 'no-change', addedCount: 0, removedCount: 0 }
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenNoChanges_ReturnsNoChange', async () => {
    // Input: UpsertEventsquadType với addMember = [], removeMember = []
    // Expected: Trả về { success: false, updated: 'no-change', addedCount: 0, removedCount: 0 }

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockFinalRecords.slice(0, 2),
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: [],
      removeMember: [],
    });

    // Assert
    // Expected Output: result.success === false, result.updated === 'no-change'
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.updated).toBe('no-change');
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.message).toBe('⚪ No changes detected');
  });

  /**
   * Test Case 7: getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates
   *
   * STT: 7
   * Chức năng: Thêm squad members
   * Test case: getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates
   * Mục tiêu: Kiểm tra khi thêm members đã tồn tại, hệ thống skip duplicates
   * Input: UpsertEventsquadType với addMember = ['user-1'] (đã tồn tại)
   * Expected Output: Trả về { success: false, updated: 'no-change', addedCount: 0 }
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates', async () => {
    // Input: UpsertEventsquadType với addMember = ['user-1'] (đã có trong currentIds)
    // Expected: Trả về { success: false, updated: 'no-change', addedCount: 0 } (vì filter ra duplicates)

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockFinalRecords.slice(0, 2),
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: ['user-1'],
      removeMember: [],
    });

    // Assert
    // Expected Output: result.success === false, result.addedCount === 0 (vì user-1 đã tồn tại)
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.updated).toBe('no-change');
    expect(result.addedCount).toBe(0);
  });

  /**
   * Test Case 8: getUpsertEventsquad_WhenDatabaseError_ReturnsFailure
   *
   * STT: 8
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi có lỗi database
   * Input: UpsertEventsquadType hợp lệ nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: UpsertEventsquadType hợp lệ
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockCurrentSelect,
    });

    // Act & Assert
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: mockEventId,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: [],
        removeMember: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 9: getUpsertEventsquad_WhenDeleteError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Xóa squad members
   * Test case: getUpsertEventsquad_WhenDeleteError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi delete lỗi
   * Input: UpsertEventsquadType với removeMember nhưng database trả về error
   * Expected Output: Throw error từ delete
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenDeleteError_ReturnsFailure', async () => {
    // Input: UpsertEventsquadType với removeMember = ['user-1']
    // Expected: Throw error với code 'PGRST201' (Delete error)

    const mockError = {
      message: 'Failed to delete squad members',
      code: 'PGRST201',
    };

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
          count: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ delete: mockDelete });

    // Act & Assert
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: mockEventId,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: [],
        removeMember: ['user-1'],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: getUpsertEventsquad_WhenInsertError_ReturnsFailure
   *
   * STT: 10
   * Chức năng: Thêm squad members
   * Test case: getUpsertEventsquad_WhenInsertError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi insert lỗi
   * Input: UpsertEventsquadType với addMember nhưng database trả về error
   * Expected Output: Throw error từ insert
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenInsertError_ReturnsFailure', async () => {
    // Input: UpsertEventsquadType với addMember = ['user-3']
    // Expected: Throw error với code 'PGRST201' (Insert error)

    const mockError = {
      message: 'Failed to insert squad members',
      code: 'PGRST201',
    };

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ insert: mockInsert });

    // Act & Assert
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: mockEventId,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: ['user-3'],
        removeMember: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 11: getUpsertEventsquad_ReturnsCorrectCounts
   *
   * STT: 11
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_ReturnsCorrectCounts
   * Mục tiêu: Kiểm tra các counts được tính đúng
   * Input: UpsertEventsquadType với addMember và removeMember
   * Expected Output: Trả về đúng previousCount, addedCount, removedCount, totalCount
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_ReturnsCorrectCounts', async () => {
    // Input: UpsertEventsquadType với addMember = ['user-3'], removeMember = ['user-1']
    // Expected: previousCount = 2, addedCount = 1, removedCount = 1, totalCount = 2

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: null,
          count: 1,
        }),
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: mockInsertedSquadMembers,
        error: null,
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ id: 'squad-2' }, { id: 'squad-3' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: ['user-3'],
      removeMember: ['user-1'],
    });

    // Assert
    // Expected Output: result.previousCount === 2, result.addedCount === 1, result.removedCount === 1, result.totalCount === 2
    expect(result.previousCount).toBe(2);
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(1);
    expect(result.totalCount).toBe(2);
  });

  /**
   * Test Case 12: getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange
   *
   * STT: 12
   * Chức năng: Thêm hoặc xóa squad members
   * Test case: getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange
   * Mục tiêu: Kiểm tra khi cả addMember và removeMember đều rỗng hoặc undefined
   * Input: UpsertEventsquadType với addMember = [], removeMember = undefined
   * Expected Output: Trả về { success: false, updated: 'no-change' }
   * Kết quả: P (Pass)
   */
  it('getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange', async () => {
    // Input: UpsertEventsquadType với addMember = [], removeMember = undefined
    // Expected: Trả về { success: false, updated: 'no-change' }

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockCurrentRecords,
        error: null,
      }),
    });

    const mockFinalSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockFinalRecords.slice(0, 2),
        error: null,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ select: mockFinalSelect });

    // Act
    const result = await getUpsertEventsquad({
      userId: mockUserId,
      teamId: mockTeamId,
      eventId: mockEventId,
      selectedMembers: [],
      preMatchMessage: mockPreMatchMessage,
      selectedBy: mockSelectedBy,
      addMember: [],
      removeMember: undefined,
    });

    // Assert
    // Expected Output: result.success === false, result.updated === 'no-change'
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.updated).toBe('no-change');
  });

  /**
   * Test Case 13: getUpsertEventsquad_WhenDuplicateSquadMember_ReturnsFailure
   *
   * STT: 13
   * Chức năng: Thêm squad members
   * Test case: getUpsertEventsquad_WhenDuplicateSquadMember_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getUpsertEventsquad thất bại khi insert duplicate squad member (race condition)
   * Input: UpsertEventsquadType với addMember = ['user-1'] (user-1 không có trong currentIds nhưng database đã có - race condition)
   * Expected Output: Throw error UNIQUE constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có squad member nào được insert vào bảng event_squads
   *
   * Lưu ý: Code filter duplicates ở line 828: `const newIds = addMember.filter(id => !currentIds.includes(id));`
   * Test này mô phỏng race condition - currentIds không có user-1 nhưng database đã có (do race condition)
   */
  it('getUpsertEventsquad_WhenDuplicateSquadMember_ReturnsFailure', async () => {
    // Arrange: Setup mocks với UNIQUE constraint error
    // Input: UpsertEventsquadType với addMember = ['user-1']
    // Simulate race condition: currentIds = [] (không có user-1) nhưng database đã có user-1
    // Expected: Throw error với message "violates unique constraint "event_squads_unique""

    const mockCurrentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [], // Simulate: current select returns empty (race condition - user-1 chưa có trong currentIds)
        error: null,
      }),
    });

    // Mock insert với UNIQUE constraint validation
    // Simulate: Database đã có user-1 (race condition - another process inserted it between currentSelect and insert)
    const mockInsert = jest.fn().mockImplementation((squads: any[]) => {
      // Simulate existing squad in database (race condition)
      const dbExistingSquads = [
        {
          event_id: mockEventId,
          user_id: 'user-1', // Database đã có user-1 (race condition)
        },
      ];

      for (const squad of squads) {
        const validation = validateEventSquadUnique(dbExistingSquads, {
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
      }
      return {
        select: jest.fn().mockResolvedValue({
          data: mockInsertedSquadMembers,
          error: null,
        }),
      };
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockCurrentSelect })
      .mockReturnValueOnce({ insert: mockInsert });

    // Act & Assert
    // Expected: Throw error với UNIQUE constraint violation
    // DB Check: Không có squad member nào được insert vào bảng event_squads
    // Race condition: currentIds = [] (code sẽ không filter user-1), nhưng database reject với UNIQUE constraint
    await expect(
      getUpsertEventsquad({
        userId: mockUserId,
        teamId: mockTeamId,
        eventId: mockEventId,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        selectedBy: mockSelectedBy,
        addMember: ['user-1'], // Code không filter vì currentIds = [], nhưng database reject
        removeMember: [],
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: '23505', // UNIQUE constraint violation
      })
    );
  });

  /**
   * EDGE CASE TEST: getUpsertEventsquad_WhenEventIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: event_id không tồn tại (Foreign key constraint)
   */
  it('getUpsertEventsquad_WhenEventIdDoesNotExist_ShouldFail', async () => {
    const nonExistentEventId = 'event-not-exist';
    const mockError = {
      message: 'insert or update on table "event_squads" violates foreign key constraint "event_squads_event_id_fkey1"',
      code: '23503',
    };

    const mockSelect = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ delete: jest.fn().mockResolvedValue({ data: null, error: null }) })
      .mockReturnValueOnce({ insert: mockInsert });

    await expect(
      getUpsertEventsquad({
        eventId: nonExistentEventId,
        userId: mockUserId,
        teamId: mockTeamId,
        selectedBy: mockSelectedBy,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        addMember: ['user-not-exist'],
        removeMember: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: getUpsertEventsquad_WhenUserIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: user_id không tồn tại (Foreign key constraint)
   */
  it('getUpsertEventsquad_WhenUserIdDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';
    const mockError = {
      message: 'insert or update on table "event_squads" violates foreign key constraint "event_squads_user_id_fkey1"',
      code: '23503',
    };

    const mockSelect = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ delete: jest.fn().mockResolvedValue({ data: null, error: null }) })
      .mockReturnValueOnce({ insert: mockInsert });

    await expect(
      getUpsertEventsquad({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: mockTeamId,
        selectedBy: mockSelectedBy,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        addMember: [nonExistentUserId],
        removeMember: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: getUpsertEventsquad_WhenSelectedByDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: selected_by không tồn tại (Foreign key constraint)
   */
  it('getUpsertEventsquad_WhenSelectedByDoesNotExist_ShouldFail', async () => {
    const nonExistentSelectedBy = 'user-not-exist';
    const mockError = {
      message: 'insert or update on table "event_squads" violates foreign key constraint "event_squads_selected_by_fkey"',
      code: '23503',
      details: `Key (selected_by)=(${nonExistentSelectedBy}) is not present in table "auth.users".`,
    };

    const mockSelect = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ delete: jest.fn().mockResolvedValue({ data: null, error: null }) })
      .mockReturnValueOnce({ insert: mockInsert });

    await expect(
      getUpsertEventsquad({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: mockTeamId,
        selectedBy: nonExistentSelectedBy,
        selectedMembers: [],
        preMatchMessage: mockPreMatchMessage,
        addMember: ['user-1'],
        removeMember: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });
});
