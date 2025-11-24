/**
 * Test Suite: upsertInvitations API
 *
 * Chức năng: Thêm hoặc xóa invitations cho event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: upsertInvitations()
 *
 * Test Cases:
 * 1. upsertInvitations_WhenAddMembers_InsertsInvitations
 * 2. upsertInvitations_WhenRemoveMembers_DeletesInvitations
 * 3. upsertInvitations_WhenAddAndRemove_InsertsAndDeletes
 * 4. upsertInvitations_WhenEmptyArrays_ReturnsSuccess
 * 5. upsertInvitations_WhenEventIdIsNull_ReturnsFailure
 * 6. upsertInvitations_WhenEventIdIsEmpty_ReturnsFailure
 * 7. upsertInvitations_WhenInvitedByIsNull_ReturnsFailure
 * 8. upsertInvitations_WhenDeleteError_ReturnsFailure
 * 9. upsertInvitations_WhenInsertError_ReturnsFailure
 */

import { supabase } from '@lib/supabase';
import { upsertInvitations } from '@top/features/event/api/event';
import { validateEventInvitationUnique } from '../helpers/constraintValidators';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('upsertInvitations API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockInvitedBy = 'admin-123';
  const mockAddedMembers = ['user-1', 'user-2'];
  const mockRemovedMembers = ['user-3', 'user-4'];

  // Track existing invitations để kiểm tra UNIQUE constraint
  let existingInvitations: Array<{ event_id: string; user_id: string }> = [];

  beforeEach(() => {
    jest.clearAllMocks();
    existingInvitations = []; // Reset existing invitations
  });

  /**
   * Test Case 1: upsertInvitations_WhenAddMembers_InsertsInvitations
   *
   * STT: 1
   * Chức năng: Thêm invitations
   * Test case: upsertInvitations_WhenAddMembers_InsertsInvitations
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thành công khi thêm members
   * Input: InvitationInput với addedMembers = ['user-1', 'user-2']
   * Expected Output: Trả về { success: true }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được insert vào bảng event_invitations với:
   *   + event_id = eventId
   *   + user_id trong addedMembers
   *   + invited_by = invitedBy
   *   + invitation_status = 'pending'
   */
  it('upsertInvitations_WhenAddMembers_InsertsInvitations', async () => {
    // Arrange: Setup mocks
    // Input: InvitationInput với addedMembers = ['user-1', 'user-2'], removedMembers = []
    // Expected: Trả về { success: true }

    // Mock insert với UNIQUE constraint validation
    const mockInsert = jest.fn().mockImplementation((invitations: any[]) => {
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

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act: Gọi API
    const result = await upsertInvitations({
      eventId: mockEventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: mockInvitedBy,
      addedMembers: mockAddedMembers,
      removedMembers: [],
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.success === true
    // DB Check: event_invitations.insert được gọi với array chứa user-1 và user-2
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-1',
          invited_by: mockInvitedBy,
          invitation_status: 'pending',
        }),
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-2',
          invited_by: mockInvitedBy,
          invitation_status: 'pending',
        }),
      ])
    );
  });

  /**
   * Test Case 2: upsertInvitations_WhenRemoveMembers_DeletesInvitations
   *
   * STT: 2
   * Chức năng: Xóa invitations
   * Test case: upsertInvitations_WhenRemoveMembers_DeletesInvitations
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thành công khi xóa members
   * Input: InvitationInput với removedMembers = ['user-3', 'user-4']
   * Expected Output: Trả về { success: true }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được delete từ bảng event_invitations với:
   *   + event_id = eventId
   *   + user_id trong removedMembers
   */
  it('upsertInvitations_WhenRemoveMembers_DeletesInvitations', async () => {
    // Input: InvitationInput với addedMembers = [], removedMembers = ['user-3', 'user-4']
    // Expected: Trả về { success: true }

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act
    const result = await upsertInvitations({
      eventId: mockEventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: mockInvitedBy,
      addedMembers: [],
      removedMembers: mockRemovedMembers,
    });

    // Assert
    // Expected Output: result.success === true
    // DB Check: event_invitations.delete được gọi với .eq('event_id', eventId).in('user_id', removedMembers)
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockDelete().eq).toHaveBeenCalledWith('event_id', mockEventId);
    expect(mockDelete().eq().in).toHaveBeenCalledWith(
      'user_id',
      mockRemovedMembers
    );
  });

  /**
   * Test Case 3: upsertInvitations_WhenAddAndRemove_InsertsAndDeletes
   *
   * STT: 3
   * Chức năng: Thêm và xóa invitations
   * Test case: upsertInvitations_WhenAddAndRemove_InsertsAndDeletes
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thành công khi vừa thêm vừa xóa
   * Input: InvitationInput với addedMembers và removedMembers đều có giá trị
   * Expected Output: Trả về { success: true }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được insert và delete đúng
   */
  it('upsertInvitations_WhenAddAndRemove_InsertsAndDeletes', async () => {
    // Input: InvitationInput với addedMembers = ['user-1'], removedMembers = ['user-3']
    // Expected: Trả về { success: true }

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert });

    // Act
    const result = await upsertInvitations({
      eventId: mockEventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: mockInvitedBy,
      addedMembers: ['user-1'],
      removedMembers: ['user-3'],
    });

    // Assert
    // Expected Output: result.success === true
    // DB Check: delete được gọi trước, sau đó insert được gọi
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(mockDelete().eq).toHaveBeenCalledWith('event_id', mockEventId);
    expect(mockInsert).toHaveBeenCalled();
  });

  /**
   * Test Case 4: upsertInvitations_WhenEmptyArrays_ReturnsSuccess
   *
   * STT: 4
   * Chức năng: Thêm hoặc xóa invitations
   * Test case: upsertInvitations_WhenEmptyArrays_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thành công khi cả hai array đều rỗng
   * Input: InvitationInput với addedMembers = [], removedMembers = []
   * Expected Output: Trả về { success: true }
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenEmptyArrays_ReturnsSuccess', async () => {
    // Input: InvitationInput với addedMembers = [], removedMembers = []
    // Expected: Trả về { success: true } (không có insert hoặc delete nào được gọi)

    // Act
    const result = await upsertInvitations({
      eventId: mockEventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: mockInvitedBy,
      addedMembers: [],
      removedMembers: [],
    });

    // Assert
    // Expected Output: result.success === true
    // DB Check: Không có insert hoặc delete nào được gọi
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  /**
   * Test Case 5: upsertInvitations_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Thêm hoặc xóa invitations
   * Test case: upsertInvitations_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi eventId là null
   * Input: InvitationInput với eventId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: InvitationInput với eventId = null, addedMembers = ['user-1']
    // Expected: Throw error với code '23502' (null value constraint)

    const mockError = {
      message: 'null value in column "event_id" violates not-null constraint',
      code: '23502',
    };

    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    await expect(
      upsertInvitations({
        eventId: null as any,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: ['user-1'],
        removedMembers: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 6: upsertInvitations_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Thêm hoặc xóa invitations
   * Test case: upsertInvitations_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi eventId là chuỗi rỗng
   * Input: InvitationInput với eventId = ''
   * Expected Output: Throw error hoặc không tìm thấy records để delete
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: InvitationInput với eventId = '', removedMembers = ['user-1']
    // Expected: Throw error hoặc không tìm thấy records

    const mockError = {
      message: 'No rows found to delete',
      code: 'PGRST116',
    };

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act & Assert
    await expect(
      upsertInvitations({
        eventId: '',
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: [],
        removedMembers: ['user-1'],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 7: upsertInvitations_WhenInvitedByIsNull_ReturnsFailure
   *
   * STT: 7
   * Chức năng: Thêm invitations
   * Test case: upsertInvitations_WhenInvitedByIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi invitedBy là null
   * Input: InvitationInput với invitedBy = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenInvitedByIsNull_ReturnsFailure', async () => {
    // Input: InvitationInput với invitedBy = null, addedMembers = ['user-1']
    // Expected: Throw error với code '23502' (null value constraint)

    const mockError = {
      message: 'null value in column "invited_by" violates not-null constraint',
      code: '23502',
    };

    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: null as any,
        addedMembers: ['user-1'],
        removedMembers: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 8: upsertInvitations_WhenDeleteError_ReturnsFailure
   *
   * STT: 8
   * Chức năng: Xóa invitations
   * Test case: upsertInvitations_WhenDeleteError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi delete lỗi
   * Input: InvitationInput với removedMembers nhưng database trả về error
   * Expected Output: Throw error từ delete
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenDeleteError_ReturnsFailure', async () => {
    // Input: InvitationInput với removedMembers = ['user-1']
    // Expected: Throw error với code 'PGRST201' (Delete error)

    const mockError = {
      message: 'Failed to delete invitations',
      code: 'PGRST201',
    };

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act & Assert
    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: [],
        removedMembers: ['user-1'],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 9: upsertInvitations_WhenInsertError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Thêm invitations
   * Test case: upsertInvitations_WhenInsertError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi insert lỗi
   * Input: InvitationInput với addedMembers nhưng database trả về error
   * Expected Output: Throw error từ insert
   * Kết quả: P (Pass)
   */
  it('upsertInvitations_WhenInsertError_ReturnsFailure', async () => {
    // Input: InvitationInput với addedMembers = ['user-1']
    // Expected: Throw error với code 'PGRST201' (Insert error)

    const mockError = {
      message: 'Failed to insert invitations',
      code: 'PGRST201',
    };

    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: ['user-1'],
        removedMembers: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: upsertInvitations_WhenDuplicateInvitation_ReturnsFailure
   *
   * STT: 10
   * Chức năng: Thêm invitations
   * Test case: upsertInvitations_WhenDuplicateInvitation_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức upsertInvitations thất bại khi insert duplicate invitation
   * Input: InvitationInput với addedMembers = ['user-1'] (user-1 đã có invitation)
   * Expected Output: Báo lỗi UNIQUE constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có invitation nào được insert vào bảng event_invitations
   */
  it('upsertInvitations_WhenDuplicateInvitation_ReturnsFailure', async () => {
    // Arrange: Setup mocks với UNIQUE constraint error
    // Input: InvitationInput với addedMembers = ['user-1'] (user-1 đã có invitation)
    // Expected: Throw error với message "violates unique constraint "event_invitations_unique""

    // Simulate existing invitation
    existingInvitations.push({
      event_id: mockEventId,
      user_id: 'user-1',
    });

    // Mock insert với UNIQUE constraint validation
    const mockInsert = jest.fn().mockImplementation((invitations: any[]) => {
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
      }
      return Promise.resolve({
        data: null,
        error: null,
      });
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với UNIQUE constraint violation
    // DB Check: Không có invitation nào được insert vào bảng event_invitations
    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: ['user-1'], // Duplicate
        removedMembers: [],
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: '23505', // UNIQUE constraint violation
      })
    );
  });

  /**
   * EDGE CASE TEST: upsertInvitations_WhenEventIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: event_id không tồn tại (Foreign key constraint)
   */
  it('upsertInvitations_WhenEventIdDoesNotExist_ShouldFail', async () => {
    const nonExistentEventId = 'event-not-exist';
    const mockError = {
      message: 'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_event_id_fkey1"',
      code: '23503',
    };

    // Mock cho insert() - sẽ trả về foreign key error
    // insert() là function trả về promise với error
    const mockInsertEdgeCase = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Vì removedMembers = [], delete() không được gọi
    // Chỉ cần mock insert()
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsertEdgeCase,
    });

    await expect(
      upsertInvitations({
        eventId: nonExistentEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: ['user-1'],
        removedMembers: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: upsertInvitations_WhenUserIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: user_id không tồn tại (Foreign key constraint)
   */
  it('upsertInvitations_WhenUserIdDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';
    const mockError = {
      message: 'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_user_id_fkey1"',
      code: '23503',
    };

    // Mock cho insert() - sẽ trả về foreign key error
    // insert() là function trả về promise với error
    const mockInsertEdgeCase2 = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Vì removedMembers = [], delete() không được gọi
    // Chỉ cần mock insert()
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsertEdgeCase2,
    });

    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: mockInvitedBy,
        addedMembers: [nonExistentUserId],
        removedMembers: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: upsertInvitations_WhenInvitedByDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: invited_by không tồn tại (Foreign key constraint)
   */
  it('upsertInvitations_WhenInvitedByDoesNotExist_ShouldFail', async () => {
    const nonExistentInvitedBy = 'user-not-exist';
    const mockError = {
      message: 'insert or update on table "event_invitations" violates foreign key constraint "event_invitations_invited_by_fkey"',
      code: '23503',
      details: `Key (invited_by)=(${nonExistentInvitedBy}) is not present in table "auth.users".`,
    };

    // Mock cho insert() - sẽ trả về foreign key error
    // insert() là function trả về promise với error
    const mockInsertEdgeCase3 = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Vì removedMembers = [], delete() không được gọi
    // Chỉ cần mock insert()
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsertEdgeCase3,
    });

    await expect(
      upsertInvitations({
        eventId: mockEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: nonExistentInvitedBy,
        addedMembers: ['user-1'],
        removedMembers: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });
});
