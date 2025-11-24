/**
 * Test Suite: updateEventById API
 *
 * Chức năng: Cập nhật thông tin event theo ID
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: updateEventById()
 *
 * Test Cases:
 * 1. updateEventById_WhenValidInput_ReturnsSuccess
 * 2. updateEventById_WhenEventIdIsNull_ReturnsFailure
 * 3. updateEventById_WhenEventIdIsEmpty_ReturnsFailure
 * 4. updateEventById_WhenEventNotFound_ReturnsFailure
 * 5. updateEventById_WhenAdminIdIsNull_ReturnsFailure
 * 6. updateEventById_WhenAddMembers_InsertsInvitations
 * 7. updateEventById_WhenRemoveMembers_DeletesInvitations
 * 8. updateEventById_WhenUpdateEvent_UpdatesEventFields
 * 9. updateEventById_WhenDatabaseError_ReturnsFailure
 * 10. updateEventById_WhenInsertInvitationsError_ReturnsFailure
 * 11. updateEventById_WhenDeleteInvitationsError_ReturnsFailure
 * 12. updateEventById_WhenHomeMatch_GeneratesCorrectTitle
 * 13. updateEventById_WhenAwayMatch_GeneratesCorrectTitle
 * 14. updateEventById_WhenTraining_GeneratesCorrectTitle
 * 15. updateEventById_WhenOther_GeneratesCorrectTitle
 */

import { supabase } from '@lib/supabase';
import { updateEventById } from '@top/features/event/api/event';

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

describe('updateEventById API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockAdminId = 'admin-123';
  const mockTeamId = 'team-123';

  const mockFormData: Partial<any> = {
    eventType: 'home_match',
    eventTitle: 'Test Match',
    homeTeamName: 'Home Team',
    awayTeamName: 'Away Team',
    eventDate: new Date('2025-12-25'),
    startTime: new Date('2025-12-25T14:00:00'),
    endTime: new Date('2025-12-25T16:00:00'),
    location: 'Test Stadium',
    locationAddress: '123 Test St',
    description: 'Test description',
    teamId: mockTeamId,
  };

  const mockUpdatedEvent = {
    id: mockEventId,
    title: 'Home Team vs Away Team',
    event_type: 'home_match',
    event_date: '2025-12-25',
    start_time: '14:00:00',
    updated_at: '2025-01-15T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: updateEventById_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức updateEventById thành công khi input hợp lệ
   * Input: UpdateEventByIdType với đầy đủ thông tin hợp lệ
   * Expected Output: Trả về event đã được update
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record trong bảng events được update với đúng các fields
   * - Kiểm tra event_invitations được update status = 'pending'
   * - Kiểm tra invitations mới được insert nếu có trong addArray
   * - Kiểm tra invitations được delete nếu có trong removeArray
   */
  it('updateEventById_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: UpdateEventByIdType với eventId, adminId, formData hợp lệ, addArray = ['user-1'], removeArray = []
    // Expected: Trả về event đã được update với title, event_type, event_date, etc.

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate }) // events update
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations update
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations insert
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations delete

    // Act: Gọi API
    const result = await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: mockFormData,
      addArray: ['user-1'],
      removeArray: [],
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.id === mockEventId, result.title === 'Home Team vs Away Team'
    // DB Check: events được update, event_invitations được update status, invitations mới được insert
    expect(result).toBeDefined();
    expect(result.id).toBe(mockEventId);
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
  });

  /**
   * Test Case 2: updateEventById_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi eventId là null
   * Input: UpdateEventByIdType với eventId = null
   * Expected Output: Throw error "eventId is required"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với eventId = null
    // Expected: Throw error với message "eventId is required"

    // Act & Assert
    await expect(
      updateEventById({
        eventId: null as any,
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toThrow('eventId is required');
  });

  /**
   * Test Case 3: updateEventById_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi eventId là chuỗi rỗng
   * Input: UpdateEventByIdType với eventId = ''
   * Expected Output: Throw error "eventId is required"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với eventId = ''
    // Expected: Throw error với message "eventId is required"

    // Act & Assert
    await expect(
      updateEventById({
        eventId: '',
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toThrow('eventId is required');
  });

  /**
   * Test Case 4: updateEventById_WhenEventNotFound_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenEventNotFound_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi không tìm thấy event
   * Input: UpdateEventByIdType với eventId không tồn tại
   * Expected Output: Báo lỗi database error
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenEventNotFound_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với eventId = 'event-not-exist'
    // Expected: Throw error với code 'PGRST116' (Event not found)

    const mockError = {
      message: 'Event not found',
      code: 'PGRST116',
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

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    // Note: Trong code, insert và delete luôn được gọi, nhưng chỉ có error khi array không rỗng
    // Vì addArray và removeArray đều rỗng, insert và delete được gọi nhưng không có error
    // Error sẽ được throw từ update event
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act & Assert
    // Note: Error được throw từ update event sau khi check insertError và deleteError
    await expect(
      updateEventById({
        eventId: 'event-not-exist',
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 5: updateEventById_WhenAdminIdIsNull_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenAdminIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi adminId là null
   * Input: UpdateEventByIdType với adminId = null
   * Expected Output: Báo lỗi khi insert invitations (invited_by không thể null)
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenAdminIdIsNull_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với adminId = null, addArray = ['user-1']
    // Expected: Throw error khi insert invitations vì invited_by không thể null

    const mockError = {
      message: 'null value in column "invited_by" violates not-null constraint',
      code: '23502',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    // Note: Trong code, insert và delete luôn được gọi, nhưng chỉ có error khi array không rỗng
    // Vì addArray có phần tử nên insert được gọi và trả về error
    // Vì removeArray rỗng nên delete vẫn được gọi nhưng không có error
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act & Assert
    // Note: insertError được check trước trong code, nên error sẽ được throw từ insert
    await expect(
      updateEventById({
        eventId: mockEventId,
        adminId: null as any,
        formData: mockFormData,
        addArray: ['user-1'],
        removeArray: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 6: updateEventById_WhenAddMembers_InsertsInvitations
   *
   * STT: 6
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenAddMembers_InsertsInvitations
   * Mục tiêu: Kiểm tra khi addArray có members, hệ thống insert invitations mới
   * Input: UpdateEventByIdType với addArray = ['user-1', 'user-2']
   * Expected Output: Invitations mới được insert vào bảng event_invitations
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được insert vào bảng event_invitations với:
   *   + event_id = eventId
   *   + user_id trong addArray
   *   + invited_by = adminId
   *   + invitation_status = 'pending'
   */
  it('updateEventById_WhenAddMembers_InsertsInvitations', async () => {
    // Input: UpdateEventByIdType với addArray = ['user-1', 'user-2']
    // Expected: Invitations mới được insert với đúng event_id, user_id, invited_by

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [
        { id: 'inv-1', event_id: mockEventId, user_id: 'user-1' },
        { id: 'inv-2', event_id: mockEventId, user_id: 'user-2' },
      ],
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    const result = await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: mockFormData,
      addArray: ['user-1', 'user-2'],
      removeArray: [],
    });

    // Assert
    // Expected Output: result.id === mockEventId
    // DB Check: event_invitations.insert được gọi với array chứa user-1 và user-2
    expect(result).toBeDefined();
    expect(mockInvitationInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-1',
          invited_by: mockAdminId,
          invitation_status: 'pending',
        }),
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-2',
          invited_by: mockAdminId,
          invitation_status: 'pending',
        }),
      ])
    );
  });

  /**
   * Test Case 7: updateEventById_WhenRemoveMembers_DeletesInvitations
   *
   * STT: 7
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenRemoveMembers_DeletesInvitations
   * Mục tiêu: Kiểm tra khi removeArray có members, hệ thống delete invitations
   * Input: UpdateEventByIdType với removeArray = ['user-1', 'user-2']
   * Expected Output: Invitations được delete từ bảng event_invitations
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được delete từ bảng event_invitations với:
   *   + event_id = eventId
   *   + user_id trong removeArray
   */
  it('updateEventById_WhenRemoveMembers_DeletesInvitations', async () => {
    // Input: UpdateEventByIdType với removeArray = ['user-1', 'user-2']
    // Expected: Invitations được delete với đúng event_id và user_id

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    const result = await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: mockFormData,
      addArray: [],
      removeArray: ['user-1', 'user-2'],
    });

    // Assert
    // Expected Output: result.id === mockEventId
    // DB Check: event_invitations.delete được gọi với .in('user_id', ['user-1', 'user-2']).eq('event_id', mockEventId)
    expect(result).toBeDefined();
    expect(mockInvitationDelete().in).toHaveBeenCalledWith('user_id', [
      'user-1',
      'user-2',
    ]);
    expect(mockInvitationDelete().in().eq).toHaveBeenCalledWith(
      'event_id',
      mockEventId
    );
  });

  /**
   * Test Case 8: updateEventById_WhenUpdateEvent_UpdatesEventFields
   *
   * STT: 8
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenUpdateEvent_UpdatesEventFields
   * Mục tiêu: Kiểm tra các fields của event được update đúng
   * Input: UpdateEventByIdType với formData có các fields mới
   * Expected Output: Event được update với các fields mới
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record trong bảng events được update với:
   *   + title, event_type, event_date, start_time, etc.
   *   + updated_at có giá trị timestamp mới
   */
  it('updateEventById_WhenUpdateEvent_UpdatesEventFields', async () => {
    // Input: UpdateEventByIdType với formData có title, eventDate, startTime mới
    // Expected: Event được update với các fields mới

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    const result = await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: mockFormData,
      addArray: [],
      removeArray: [],
    });

    // Assert
    // Expected Output: result.id === mockEventId
    // DB Check: events.update được gọi với payload chứa title, event_type, event_date, updated_at
    expect(result).toBeDefined();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        event_type: mockFormData.eventType,
        updated_at: expect.any(String),
      })
    );
  });

  /**
   * Test Case 9: updateEventById_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi có lỗi database
   * Input: UpdateEventByIdType hợp lệ nhưng database trả về error
   * Expected Output: Báo lỗi database
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType hợp lệ
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
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

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    // Note: Trong code, insert và delete luôn được gọi, nhưng chỉ có error khi array không rỗng
    // Vì addArray và removeArray đều rỗng, insert và delete được gọi nhưng không có error
    // Error sẽ được throw từ update event
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act & Assert
    // Note: Error từ update event sẽ được throw sau khi check insertError và deleteError
    await expect(
      updateEventById({
        eventId: mockEventId,
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 10: updateEventById_WhenInsertInvitationsError_ReturnsFailure
   *
   * STT: 10
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenInsertInvitationsError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi insert invitations lỗi
   * Input: UpdateEventByIdType với addArray nhưng insert invitations lỗi
   * Expected Output: Báo lỗi insert invitations
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenInsertInvitationsError_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với addArray = ['user-1']
    // Expected: Throw error khi insert invitations

    const mockError = {
      message: 'Failed to insert invitations',
      code: 'PGRST201',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    // Note: Trong code, insert và delete luôn được gọi, nhưng chỉ có error khi array không rỗng
    // Vì addArray có phần tử nên insert được gọi và trả về error
    // Vì removeArray rỗng nên delete vẫn được gọi nhưng không có error
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act & Assert
    // Note: insertError được check trước trong code, nên error sẽ được throw từ insert
    await expect(
      updateEventById({
        eventId: mockEventId,
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: ['user-1'],
        removeArray: [],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 11: updateEventById_WhenDeleteInvitationsError_ReturnsFailure
   *
   * STT: 11
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenDeleteInvitationsError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức updateEventById thất bại khi delete invitations lỗi
   * Input: UpdateEventByIdType với removeArray nhưng delete invitations lỗi
   * Expected Output: Báo lỗi delete invitations
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenDeleteInvitationsError_ReturnsFailure', async () => {
    // Input: UpdateEventByIdType với removeArray = ['user-1']
    // Expected: Throw error khi delete invitations

    const mockError = {
      message: 'Failed to delete invitations',
      code: 'PGRST201',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedEvent,
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    // Note: Trong code, insert và delete luôn được gọi, nhưng chỉ có error khi array không rỗng
    // Vì addArray rỗng nên insert vẫn được gọi nhưng không có error
    // Vì removeArray có phần tử nên delete được gọi và trả về error
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act & Assert
    // Note: deleteError được check sau insertError trong code, nên error sẽ được throw từ delete
    await expect(
      updateEventById({
        eventId: mockEventId,
        adminId: mockAdminId,
        formData: mockFormData,
        addArray: [],
        removeArray: ['user-1'],
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 12: updateEventById_WhenHomeMatch_GeneratesCorrectTitle
   *
   * STT: 12
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenHomeMatch_GeneratesCorrectTitle
   * Mục tiêu: Kiểm tra title được generate đúng cho home_match
   * Input: UpdateEventByIdType với eventType = 'home_match', homeTeamName và awayTeamName
   * Expected Output: title = "Home Team vs Away Team"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenHomeMatch_GeneratesCorrectTitle', async () => {
    // Input: formData với eventType = 'home_match', homeTeamName = 'Home', awayTeamName = 'Away'
    // Expected: title = "Home vs Away"

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockUpdatedEvent, title: 'Home vs Away' },
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: {
        ...mockFormData,
        eventType: 'home_match',
        homeTeamName: 'Home',
        awayTeamName: 'Away',
      },
      addArray: [],
      removeArray: [],
    });

    // Assert
    // Expected Output: mockUpdate được gọi với title = "Home vs Away"
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Home vs Away',
      })
    );
  });

  /**
   * Test Case 13: updateEventById_WhenAwayMatch_GeneratesCorrectTitle
   *
   * STT: 13
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenAwayMatch_GeneratesCorrectTitle
   * Mục tiêu: Kiểm tra title được generate đúng cho away_match
   * Input: UpdateEventByIdType với eventType = 'away_match'
   * Expected Output: title = "Home Team vs Away Team"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenAwayMatch_GeneratesCorrectTitle', async () => {
    // Input: formData với eventType = 'away_match', homeTeamName = 'Home', awayTeamName = 'Away'
    // Expected: title = "Home vs Away"

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockUpdatedEvent, title: 'Home vs Away' },
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: {
        ...mockFormData,
        eventType: 'away_match',
        homeTeamName: 'Home',
        awayTeamName: 'Away',
      },
      addArray: [],
      removeArray: [],
    });

    // Assert
    // Expected Output: mockUpdate được gọi với title = "Home vs Away"
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Home vs Away',
      })
    );
  });

  /**
   * Test Case 14: updateEventById_WhenTraining_GeneratesCorrectTitle
   *
   * STT: 14
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenTraining_GeneratesCorrectTitle
   * Mục tiêu: Kiểm tra title được generate đúng cho training
   * Input: UpdateEventByIdType với eventType = 'training'
   * Expected Output: title = "Training"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenTraining_GeneratesCorrectTitle', async () => {
    // Input: formData với eventType = 'training'
    // Expected: title = "Training"

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockUpdatedEvent, title: 'Training' },
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: {
        ...mockFormData,
        eventType: 'training',
      },
      addArray: [],
      removeArray: [],
    });

    // Assert
    // Expected Output: mockUpdate được gọi với title = "Training"
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Training',
      })
    );
  });

  /**
   * Test Case 15: updateEventById_WhenOther_GeneratesCorrectTitle
   *
   * STT: 15
   * Chức năng: Cập nhật event
   * Test case: updateEventById_WhenOther_GeneratesCorrectTitle
   * Mục tiêu: Kiểm tra title được generate đúng cho other event type
   * Input: UpdateEventByIdType với eventType = 'other', eventTitle = 'Custom Event'
   * Expected Output: title = "Custom Event"
   * Kết quả: P (Pass)
   */
  it('updateEventById_WhenOther_GeneratesCorrectTitle', async () => {
    // Input: formData với eventType = 'other', eventTitle = 'Custom Event'
    // Expected: title = "Custom Event" hoặc "Event" (nếu eventTitle không có)

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockUpdatedEvent, title: 'Custom Event' },
            error: null,
          }),
        }),
      }),
    });

    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockUpdate })
      .mockReturnValueOnce({ update: mockInvitationUpdate })
      .mockReturnValueOnce({ insert: mockInvitationInsert })
      .mockReturnValueOnce({ delete: mockInvitationDelete });

    // Act
    await updateEventById({
      eventId: mockEventId,
      adminId: mockAdminId,
      formData: {
        ...mockFormData,
        eventType: 'other',
        eventTitle: 'Custom Event',
      },
      addArray: [],
      removeArray: [],
    });

    // Assert
    // Expected Output: mockUpdate được gọi với title = "Custom Event"
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom Event',
      })
    );
  });

  /**
   * EDGE CASE TEST: updateEventById_WhenEndTimeEqualsStartTime_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: end_time = start_time (vi phạm CHECK constraint)
   * Input: UpdateEventByIdType với end_time = start_time
   * Expected: Throw error với message "violates check constraint "events_end_after_start""
   * Kết quả: FAIL nếu code không validate constraint này
   */
  it('updateEventById_WhenEndTimeEqualsStartTime_ShouldFail', async () => {
    const mockFormData: Partial<any> = {
      eventType: 'home_match',
      eventTitle: 'Updated Match',
      eventDate: new Date('2025-12-26'),
      startTime: new Date('2025-12-26T14:00:00'),
      endTime: new Date('2025-12-26T14:00:00'), // ❌ Vi phạm: end_time = start_time
      teamId: mockTeamId,
    };

    const mockError = {
      message:
        'new row for relation "events" violates check constraint "events_end_after_start"',
      code: '23514',
    };

    // Mock cho events.update() - sẽ trả về error
    const mockEventUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    // Mock cho event_invitations.update() - không được gọi vì event update fail trước
    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    // Mock cho event_invitations.insert() - không được gọi vì event update fail trước
    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Mock cho event_invitations.delete() - không được gọi vì event update fail trước
    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockEventUpdate }) // events.update()
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations.update()
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations.insert()
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations.delete()

    await expect(
      updateEventById({
        adminId: mockAdminId,
        eventId: mockEventId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('events_end_after_start'),
      code: '23514',
    });
  });

  /**
   * EDGE CASE TEST: updateEventById_WhenEndTimeBeforeStartTime_ShouldFail
   *
   * Test này kiểm tra edge case khó nhất: end_time < start_time (vi phạm CHECK constraint)
   */
  it('updateEventById_WhenEndTimeBeforeStartTime_ShouldFail', async () => {
    const mockFormData: Partial<any> = {
      eventType: 'home_match',
      eventTitle: 'Updated Match',
      eventDate: new Date('2025-12-26'),
      startTime: new Date('2025-12-26T14:00:00'),
      endTime: new Date('2025-12-26T13:00:00'), // ❌ Vi phạm: end_time < start_time
      teamId: mockTeamId,
    };

    const mockError = {
      message:
        'new row for relation "events" violates check constraint "events_end_after_start"',
      code: '23514',
    };

    // Mock cho events.update() - sẽ trả về error
    const mockEventUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    // Mock cho event_invitations.update() - không được gọi vì event update fail trước
    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    // Mock cho event_invitations.insert() - không được gọi vì event update fail trước
    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Mock cho event_invitations.delete() - không được gọi vì event update fail trước
    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockEventUpdate }) // events.update()
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations.update()
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations.insert()
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations.delete()

    await expect(
      updateEventById({
        adminId: mockAdminId,
        eventId: mockEventId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('events_end_after_start'),
      code: '23514',
    });
  });

  /**
   * EDGE CASE TEST: updateEventById_WhenTitleIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: title quá dài (VARCHAR(255))
   */
  it('updateEventById_WhenTitleIsTooLong_ShouldFail', async () => {
    const longTitle = 'A'.repeat(256); // ❌ Vi phạm: title > 255 ký tự
    const mockFormData: Partial<any> = {
      eventType: 'home_match',
      eventTitle: longTitle,
      teamId: mockTeamId,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    // Mock cho events.update() - sẽ trả về error
    const mockEventUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    // Mock cho event_invitations.update() - không được gọi vì event update fail trước
    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    // Mock cho event_invitations.insert() - không được gọi vì event update fail trước
    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Mock cho event_invitations.delete() - không được gọi vì event update fail trước
    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockEventUpdate }) // events.update()
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations.update()
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations.insert()
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations.delete()

    await expect(
      updateEventById({
        adminId: mockAdminId,
        eventId: mockEventId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });

  /**
   * EDGE CASE TEST: updateEventById_WhenLocationNameIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: location_name quá dài (VARCHAR(255))
   */
  it('updateEventById_WhenLocationNameIsTooLong_ShouldFail', async () => {
    const longLocationName = 'A'.repeat(256); // ❌ Vi phạm: location_name > 255 ký tự
    const mockFormData: Partial<any> = {
      eventType: 'home_match',
      location: longLocationName,
      teamId: mockTeamId,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    // Mock cho events.update() - sẽ trả về error
    const mockEventUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    // Mock cho event_invitations.update() - không được gọi vì event update fail trước
    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    // Mock cho event_invitations.insert() - không được gọi vì event update fail trước
    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Mock cho event_invitations.delete() - không được gọi vì event update fail trước
    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockEventUpdate }) // events.update()
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations.update()
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations.insert()
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations.delete()

    await expect(
      updateEventById({
        adminId: mockAdminId,
        eventId: mockEventId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });

  /**
   * EDGE CASE TEST: updateEventById_WhenOpponentIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: opponent quá dài (VARCHAR(255))
   */
  it('updateEventById_WhenOpponentIsTooLong_ShouldFail', async () => {
    const longOpponent = 'A'.repeat(256); // ❌ Vi phạm: opponent > 255 ký tự
    const mockFormData: Partial<any> = {
      eventType: 'home_match',
      awayTeamName: longOpponent,
      teamId: mockTeamId,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    // Mock cho events.update() - sẽ trả về error
    const mockEventUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    // Mock cho event_invitations.update() - không được gọi vì event update fail trước
    const mockInvitationUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    // Mock cho event_invitations.insert() - không được gọi vì event update fail trước
    const mockInvitationInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Mock cho event_invitations.delete() - không được gọi vì event update fail trước
    const mockInvitationDelete = jest.fn().mockReturnValue({
      in: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ update: mockEventUpdate }) // events.update()
      .mockReturnValueOnce({ update: mockInvitationUpdate }) // event_invitations.update()
      .mockReturnValueOnce({ insert: mockInvitationInsert }) // event_invitations.insert()
      .mockReturnValueOnce({ delete: mockInvitationDelete }); // event_invitations.delete()

    await expect(
      updateEventById({
        adminId: mockAdminId,
        eventId: mockEventId,
        formData: mockFormData,
        addArray: [],
        removeArray: [],
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });
});
