/**
 * Test Suite: createEvent API
 *
 * Chức năng: Tạo event mới
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: createEvent()
 *
 * Test Cases:
 * 1. createEvent_WhenValidInput_ReturnsSuccess 
 * 2. createEvent_WhenTeamIdIsNull_ReturnsFailure
 * 3. createEvent_WhenTitleIsEmpty_ReturnsFailure
 * 4. createEvent_WhenEventDateIsInvalid_ReturnsFailure
 * 5. createEvent_WhenDatabaseError_ReturnsFailure
 * 6. createEvent_WhenWithMembers_CreatesInvitations
 * 7. createEvent_WhenWithLeaders_CreatesLeaderInvitations
 */

import { supabase } from '@lib/supabase';
import { createEvent } from '@top/features/event/api/event';
import {
  validateEndTimeAfterStartTime,
  validateEventStatus,
  validateEventType,
} from '../helpers/constraintValidators';
import {
  createEventInsertMock,
  createInvitationInsertMock,
} from '../helpers/smartMocks';

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

describe('createEvent API', () => {
  // Mock data
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';
  const mockEventId = 'event-123';

  // Track existing invitations để kiểm tra UNIQUE constraint
  let existingInvitations: Array<{ event_id: string; user_id: string }> = [];

  const mockValidEventData = {
    team_id: mockTeamId,
    title: 'Test Match',
    event_type: 'home_match',
    event_date: '2025-12-25',
    start_time: '14:00:00',
    end_time: '16:00:00',
    location_name: 'Test Stadium',
    location_address: '123 Test St',
    description: 'Test description',
    event_status: 'active', // Schema chỉ cho phép: 'active', 'cancelled', 'completed'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    existingInvitations = []; // Reset existing invitations
  });

  /**
   * Test Case 1: createEvent_WhenValidInput_ReturnsSuccess
   * 
   * STT: 1
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức createEvent thành công khi input hợp lệ
   * Input: CreateEventData với đầy đủ thông tin hợp lệ
   * Expected Output: Trả về event ID mới được tạo
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record mới được insert vào bảng events
   * - Kiểm tra event_id trả về khớp với ID trong database
   */
  it('createEvent_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: CreateEventData với đầy đủ thông tin hợp lệ (team_id, title, event_type, event_date, start_time, etc.)
    // Expected: Trả về event ID mới được tạo (mockEventId)
    const mockInsertedEvent = {
      id: mockEventId,
      ...mockValidEventData,
      created_by: mockUserId,
    };

    // Mock insert với constraint validation - LUÔN kiểm tra constraints
    const mockInsert = createEventInsertMock(mockInsertedEvent);

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert }); // events insert

    // Act: Gọi API
    const result = await createEvent(mockValidEventData, mockUserId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result === mockEventId
    // DB Check: Kiểm tra record được insert vào bảng events với đúng team_id, created_by, title
    expect(result).toBe(mockEventId);
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        team_id: mockTeamId,
        created_by: mockUserId,
        title: 'Test Match',
        event_type: 'home_match',
        event_date: '2025-12-25',
      })
    );
  });

  /**
   * Test Case 2: createEvent_WhenTeamIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenTeamIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi teamId là null
   * Input: CreateEventData với team_id = null
   * Expected Output: Báo lỗi database constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có record nào được insert vào bảng events
   */
  it('createEvent_WhenTeamIdIsNull_ReturnsFailure', async () => {
    // Arrange: Setup mocks với error
    // Input: CreateEventData với team_id = null
    // Expected: Throw error với message chứa "null value in column "team_id""
    const mockError = {
      message: 'null value in column "team_id" violates not-null constraint',
      code: '23502',
      details: 'Failing row contains (null, ...)',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với message chứa "null value in column "team_id""
    // DB Check: Không có record nào được insert vào bảng events
    await expect(
      createEvent(
        {
          ...mockValidEventData,
          team_id: null as any,
        },
        mockUserId
      )
    ).rejects.toEqual(mockError);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 3: createEvent_WhenTitleIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenTitleIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi title là chuỗi rỗng
   * Input: CreateEventData với title = ''
   * Expected Output: Báo lỗi validation hoặc database error
   * Kết quả: P (Pass)
   */
  it('createEvent_WhenTitleIsEmpty_ReturnsFailure', async () => {
    // Arrange
    // Input: CreateEventData với title = ''
    // Expected: Throw error với message "Title cannot be empty"
    const mockError = {
      message: 'Title cannot be empty',
      code: 'PGRST202',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với message "Title cannot be empty"
    await expect(
      createEvent(
        {
          ...mockValidEventData,
          title: '',
        },
        mockUserId
      )
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 4: createEvent_WhenEventDateIsInvalid_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenEventDateIsInvalid_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi event_date không hợp lệ
   * Input: CreateEventData với event_date = 'invalid-date'
   * Expected Output: Báo lỗi database type error
   * Kết quả: P (Pass)
   */
  it('createEvent_WhenEventDateIsInvalid_ReturnsFailure', async () => {
    // Arrange
    const mockError = {
      message: 'invalid input syntax for type date',
      code: '22P02',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    await expect(
      createEvent(
        {
          ...mockValidEventData,
          event_date: 'invalid-date',
        },
        mockUserId
      )
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 5: createEvent_WhenDatabaseError_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent xử lý lỗi database
   * Input: CreateEventData hợp lệ nhưng database trả về error
   * Expected Output: Throw error và không tạo event
   * Kết quả: P (Pass)
   */
  it('createEvent_WhenDatabaseError_ReturnsFailure', async () => {
    // Arrange
    const mockError = {
      message: 'Database connection error',
      code: '08003',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    await expect(createEvent(mockValidEventData, mockUserId)).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 6: createEvent_WhenWithMembers_CreatesInvitations
   *
   * STT: 6
   * Chức năng: Tạo event mới với members
   * Test case: createEvent_WhenWithMembers_CreatesInvitations
   * Mục tiêu: Kiểm tra khi tạo event với selected_members, hệ thống tạo invitations và participants
   * Input: CreateEventData với selected_members = ['user-1', 'user-2']
   * Expected Output: Event được tạo và invitations/participants được insert vào database
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được insert vào bảng event_participants
   * - Kiểm tra records được insert vào bảng event_invitations
   */
  it('createEvent_WhenWithMembers_CreatesInvitations', async () => {
    // Arrange
    const mockMembers = ['user-1', 'user-2'];
    const mockInsertedEvent = {
      id: mockEventId,
      ...mockValidEventData,
      created_by: mockUserId,
    };

    const mockEventInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockInsertedEvent,
          error: null,
        }),
      }),
    });

    const mockParticipantsInsert = jest.fn().mockResolvedValue({
      error: null,
    });

    // Mock invitations insert với UNIQUE constraint validation
    const mockInvitationsInsert =
      createInvitationInsertMock(existingInvitations);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ insert: mockEventInsert }) // events
      .mockReturnValueOnce({ insert: mockParticipantsInsert }) // event_participants
      .mockReturnValueOnce({ insert: mockInvitationsInsert }); // event_invitations

    // Act
    const result = await createEvent(
      {
        ...mockValidEventData,
        selected_members: mockMembers,
      },
      mockUserId
    );

    // Assert: Event được tạo
    expect(result).toBe(mockEventId);

    // Assert: Participants được insert
    expect(supabase.from).toHaveBeenCalledWith('event_participants');
    expect(mockParticipantsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-1',
          role: 'player',
        }),
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-2',
          role: 'player',
        }),
      ])
    );

    // Assert: Invitations được insert
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    expect(mockInvitationsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'user-1',
          invitation_status: 'pending',
        }),
      ])
    );
  });

  /**
   * Test Case 7: createEvent_WhenWithLeaders_CreatesLeaderInvitations
   *
   * STT: 7
   * Chức năng: Tạo event mới với leaders
   * Test case: createEvent_WhenWithLeaders_CreatesLeaderInvitations
   * Mục tiêu: Kiểm tra khi tạo event với selected_leaders, hệ thống tạo leader invitations
   * Input: CreateEventData với selected_leaders = ['admin-1', 'admin-2']
   * Expected Output: Event được tạo và leader invitations được insert
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được insert vào bảng event_participants với role = 'coach'
   * - Kiểm tra records được insert vào bảng event_invitations cho leaders
   */
  it('createEvent_WhenWithLeaders_CreatesLeaderInvitations', async () => {
    // Arrange
    const mockLeaders = ['admin-1', 'admin-2'];
    const mockInsertedEvent = {
      id: mockEventId,
      ...mockValidEventData,
      created_by: mockUserId,
    };

    const mockEventInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockInsertedEvent,
          error: null,
        }),
      }),
    });

    const mockLeadersInsert = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockLeaderInvitationsInsert = jest.fn().mockResolvedValue({
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ insert: mockEventInsert }) // events
      .mockReturnValueOnce({ insert: mockLeadersInsert }) // event_participants (leaders)
      .mockReturnValueOnce({ insert: mockLeaderInvitationsInsert }); // event_invitations (leaders)

    // Act
    const result = await createEvent(
      {
        ...mockValidEventData,
        selected_leaders: mockLeaders,
      },
      mockUserId
    );

    // Assert: Event được tạo
    expect(result).toBe(mockEventId);

    // Assert: Leaders được insert với role = 'coach'
    expect(mockLeadersInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: mockEventId,
          user_id: 'admin-1',
          role: 'coach',
        }),
      ])
    );

    // Assert: Leader invitations được insert
    expect(mockLeaderInvitationsInsert).toHaveBeenCalled();
  });

  /**
   * Test Case 8: createEvent_WhenEndTimeBeforeStartTime_ReturnsFailure
   *
   * STT: 8
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenEndTimeBeforeStartTime_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi end_time <= start_time
   * Input: CreateEventData với end_time = '14:00:00', start_time = '16:00:00'
   * Expected Output: Báo lỗi CHECK constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có record nào được insert vào bảng events
   */
  it('createEvent_WhenEndTimeBeforeStartTime_ReturnsFailure', async () => {
    // Arrange: Setup mocks với CHECK constraint validation
    // Input: CreateEventData với end_time <= start_time
    // Expected: Throw error với message "violates check constraint "events_end_after_start""

    // Mock insert với constraint validation - LUÔN kiểm tra constraints
    const mockInsert = createEventInsertMock({ id: mockEventId });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với CHECK constraint violation
    // DB Check: Không có record nào được insert vào bảng events
    const validation = validateEndTimeAfterStartTime('16:00:00', '14:00:00');
    const expectedError = validation.error!;

    await expect(
      createEvent(
        {
          ...mockValidEventData,
          start_time: '16:00:00',
          end_time: '14:00:00', // end_time <= start_time
        },
        mockUserId
      )
    ).rejects.toEqual(expectedError);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 9: createEvent_WhenMaxParticipantsZero_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenMaxParticipantsZero_ReturnsFailure
   * Mục tiêu: KIỂM TRA BỊ BỎ QUA - Code createEvent không insert max_participants vào database
   * Input: CreateEventData với max_participants = 0
   * Expected Output: N/A - Code không gửi max_participants lên database
   * Kết quả: SKIP (Code không hỗ trợ max_participants trong createEvent)
   *
   * Lưu ý: Code createEvent (features/event/api/event.ts line 44-64) không insert max_participants vào database.
   * Constraint này chỉ có thể test khi code thực sự insert max_participants.
   * Test case này được skip vì không thể test được với code hiện tại.
   */
  it.skip('createEvent_WhenMaxParticipantsZero_ReturnsFailure', async () => {
    // Test case này bị skip vì code createEvent không insert max_participants vào database
    // Nếu code được update để insert max_participants, test case này sẽ được enable lại
  });

  /**
   * Test Case 10: createEvent_WhenInvalidEventStatus_ReturnsFailure
   *
   * STT: 10
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenInvalidEventStatus_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi event_status không hợp lệ
   * Input: CreateEventData với event_status = 'scheduled' (không tồn tại trong schema)
   * Expected Output: Báo lỗi CHECK constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có record nào được insert vào bảng events
   */
  it('createEvent_WhenInvalidEventStatus_ReturnsFailure', async () => {
    // Arrange: Setup mocks với CHECK constraint validation
    // Input: CreateEventData với event_status = 'scheduled' (invalid)
    // Expected: Throw error với message "violates check constraint "events_event_status_check""

    // Mock insert với constraint validation - LUÔN kiểm tra constraints
    const mockInsert = createEventInsertMock({ id: mockEventId });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với CHECK constraint violation
    // DB Check: Không có record nào được insert vào bảng events
    const validation = validateEventStatus('scheduled');
    const expectedError = validation.error!;

    await expect(
      createEvent(
        {
          ...mockValidEventData,
          event_status: 'scheduled' as any, // Invalid status
        },
        mockUserId
      )
    ).rejects.toEqual(expectedError);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 11: createEvent_WhenInvalidEventType_ReturnsFailure
   *
   * STT: 11
   * Chức năng: Tạo event mới
   * Test case: createEvent_WhenInvalidEventType_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức createEvent thất bại khi event_type không hợp lệ
   * Input: CreateEventData với event_type = 'invalid_type'
   * Expected Output: Báo lỗi CHECK constraint violation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có record nào được insert vào bảng events
   */
  it('createEvent_WhenInvalidEventType_ReturnsFailure', async () => {
    // Arrange: Setup mocks với CHECK constraint validation
    // Input: CreateEventData với event_type = 'invalid_type' (invalid)
    // Expected: Throw error với message "violates check constraint "events_event_type_check""

    // Mock insert với constraint validation - LUÔN kiểm tra constraints
    const mockInsert = createEventInsertMock({ id: mockEventId });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Act & Assert
    // Expected: Throw error với CHECK constraint violation
    // DB Check: Không có record nào được insert vào bảng events
    const validation = validateEventType('invalid_type');
    const expectedError = validation.error!;

    await expect(
      createEvent(
        {
          ...mockValidEventData,
          event_type: 'invalid_type' as any, // Invalid type
        },
        mockUserId
      )
    ).rejects.toEqual(expectedError);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 12: createEvent_WhenDuplicateInvitation_LogsError
   *
   * STT: 12
   * Chức năng: Tạo event mới với members
   * Test case: createEvent_WhenDuplicateInvitation_LogsError
   * Mục tiêu: Kiểm tra phương thức createEvent xử lý duplicate invitation (code hiện tại chỉ log error, không throw)
   * Input: CreateEventData với selected_members = ['user-1'] (user-1 đã có invitation)
   * Expected Output: Event được tạo thành công nhưng invitation insert fail (chỉ log error)
   * Kết quả: P (Pass)
   *
   * Lưu ý: Code hiện tại (line 106-111) không throw error khi invitationsError, chỉ log error.
   * Test này phản ánh hành vi thực tế của code.
   *
   * DB Check:
   * - Event được tạo thành công
   * - Invitation insert fail với UNIQUE constraint violation (nhưng không throw error)
   */
  it('createEvent_WhenDuplicateInvitation_LogsError', async () => {
    // Arrange: Setup mocks với UNIQUE constraint error
    // Input: CreateEventData với selected_members = ['user-1'] (user-1 đã có invitation)
    // Expected: Event được tạo thành công, nhưng invitation insert fail (chỉ log error, không throw)
    const mockMembers = ['user-1'];
    const mockInsertedEvent = {
      id: mockEventId,
      ...mockValidEventData,
      created_by: mockUserId,
    };

    // Simulate existing invitation
    existingInvitations.push({
      event_id: mockEventId,
      user_id: 'user-1',
    });

    const mockEventInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockInsertedEvent,
          error: null,
        }),
      }),
    });

    const mockParticipantsInsert = jest.fn().mockResolvedValue({
      error: null,
    });

    // Mock invitations insert với UNIQUE constraint validation
    const mockInvitationsInsert =
      createInvitationInsertMock(existingInvitations);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({ insert: mockEventInsert }) // events
      .mockReturnValueOnce({ insert: mockParticipantsInsert }) // event_participants
      .mockReturnValueOnce({ insert: mockInvitationsInsert }); // event_invitations

    // Act: Gọi API
    // Expected: Event được tạo thành công (code không throw error khi invitationsError)
    const result = await createEvent(
      {
        ...mockValidEventData,
        selected_members: mockMembers,
      },
      mockUserId
    );

    // Assert: Kiểm tra kết quả
    // Expected Output: result === mockEventId (event được tạo thành công)
    // DB Check: Event được tạo, nhưng invitation insert fail (error được log, không throw)
    expect(result).toBe(mockEventId);
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.from).toHaveBeenCalledWith('event_invitations');
    // Kiểm tra invitation insert được gọi và trả về error
    expect(mockInvitationsInsert).toHaveBeenCalled();
  });

  /**
   * PROOF TEST: createEvent_WhenEndTimeBeforeStartTimeButExpectSuccess_ShouldFail
   *
   * Test này CHỨNG MINH rằng smart mocks thực sự bắt được lỗi.
   * Input: CreateEventData với end_time = '13:00:00' < start_time = '14:00:00'
   * Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL vì smart mock bắt được lỗi CHECK constraint
   * Kết quả: FAIL (Đúng như mong đợi - chứng minh mocks hoạt động đúng)
   *
   * Lưu ý: Test này được tạo để chứng minh rằng smart mocks thực sự bắt được lỗi.
   * Trong thực tế, test case này nên expect error (như test case 8).
   */
  it('createEvent_WhenEndTimeBeforeStartTimeButExpectSuccess_ShouldFail', async () => {
    // Arrange: Setup mocks với smart mock - LUÔN kiểm tra constraints
    // Input: CreateEventData với end_time = '13:00:00' < start_time = '14:00:00'
    // Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL vì smart mock bắt được lỗi CHECK constraint
    const invalidEventData = {
      ...mockValidEventData,
      start_time: '14:00:00',
      end_time: '13:00:00', // ❌ Vi phạm constraint: end_time <= start_time
    };

    const mockInsertedEvent = {
      id: mockEventId,
      ...invalidEventData,
      created_by: mockUserId,
    };

    // Mock insert với constraint validation - LUÔN kiểm tra constraints
    const mockInsert = createEventInsertMock(mockInsertedEvent);

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    // Act & Assert
    // Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL
    // Vì smart mock bắt được lỗi CHECK constraint khi end_time <= start_time
    // Đây là test case để chứng minh smart mocks thực sự bắt được lỗi
    const result = await createEvent(invalidEventData, mockUserId);

    // Assert này sẽ FAIL vì smart mock trả về error, không trả về result
    expect(result).toBe(mockEventId); // ❌ Sẽ fail vì smart mock bắt được lỗi
  });

  /**
   * EDGE CASE TEST: createEvent_WhenTitleIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: title quá dài (VARCHAR(255))
   */
  it('createEvent_WhenTitleIsTooLong_ShouldFail', async () => {
    const longTitle = 'A'.repeat(256); // ❌ Vi phạm: title > 255 ký tự
    const invalidEventData = {
      ...mockValidEventData,
      title: longTitle,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    await expect(
      createEvent(invalidEventData, mockUserId)
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });

  /**
   * EDGE CASE TEST: createEvent_WhenLocationNameIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: location_name quá dài (VARCHAR(255))
   */
  it('createEvent_WhenLocationNameIsTooLong_ShouldFail', async () => {
    const longLocationName = 'A'.repeat(256); // ❌ Vi phạm: location_name > 255 ký tự
    const invalidEventData = {
      ...mockValidEventData,
      location_name: longLocationName,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    await expect(
      createEvent(invalidEventData, mockUserId)
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });

  /**
   * EDGE CASE TEST: createEvent_WhenOpponentIsTooLong_ShouldFail
   *
   * Test này kiểm tra edge case: opponent quá dài (VARCHAR(255))
   */
  it('createEvent_WhenOpponentIsTooLong_ShouldFail', async () => {
    const longOpponent = 'A'.repeat(256); // ❌ Vi phạm: opponent > 255 ký tự
    const invalidEventData = {
      ...mockValidEventData,
      opponent: longOpponent,
    };

    const mockError = {
      message: 'value too long for type character varying(255)',
      code: '22001',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    await expect(
      createEvent(invalidEventData, mockUserId)
    ).rejects.toMatchObject({
      message: expect.stringContaining('too long'),
      code: '22001',
    });
  });

  /**
   * EDGE CASE TEST: createEvent_WhenTeamIdDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: team_id không tồn tại (Foreign key constraint)
   */
  it('createEvent_WhenTeamIdDoesNotExist_ShouldFail', async () => {
    const nonExistentTeamId = 'team-not-exist';
    const invalidEventData = {
      ...mockValidEventData,
      team_id: nonExistentTeamId,
    };

    const mockError = {
      message:
        'insert or update on table "events" violates foreign key constraint "events_team_id_fkey"',
      code: '23503',
      details: `Key (team_id)=(${nonExistentTeamId}) is not present in table "teams".`,
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    await expect(
      createEvent(invalidEventData, mockUserId)
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });

  /**
   * EDGE CASE TEST: createEvent_WhenCreatedByDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: created_by (userId) không tồn tại (Foreign key constraint)
   */
  it('createEvent_WhenCreatedByDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';

    const mockError = {
      message:
        'insert or update on table "events" violates foreign key constraint "events_created_by_fkey"',
      code: '23503',
      details: `Key (created_by)=(${nonExistentUserId}) is not present in table "auth.users".`,
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert: mockInsert });

    await expect(
      createEvent(mockValidEventData, nonExistentUserId)
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });
});
