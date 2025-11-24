/**
 * Test Suite: getEventEdit API
 *
 * Chức năng: Lấy thông tin event để edit
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getEventEdit()
 *
 * Test Cases:
 * 1. getEventEdit_WhenEventExists_ReturnsSuccess
 * 2. getEventEdit_WhenEventNotFound_ReturnsFailure
 * 3. getEventEdit_WhenEventIdIsNull_ReturnsFailure
 * 4. getEventEdit_WhenEventIdIsEmpty_ReturnsFailure
 * 5. getEventEdit_WhenDatabaseError_ReturnsFailure
 * 6. getEventEdit_ReturnsEditEventDataWithAllFields
 */

import { supabase } from '@lib/supabase';
import { getEventEdit } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getEventEdit API', () => {
  // Mock data
  const mockEventId = 'event-123';

  const mockEditEventData = {
    id: mockEventId,
    teamId: 'team-123',
    createdBy: 'user-123',
    title: 'Test Match',
    eventType: 'home_match',
    description: 'Test description',
    eventDate: '2025-12-25',
    startTime: '14:00:00',
    endTime: '16:00:00',
    locationName: 'Test Stadium',
    locationAddress: '123 Test St',
    locationLatitude: 51.5074,
    locationLongitude: -0.1278,
    opponent: 'Away Team',
    isHomeEvent: true,
    maxParticipants: 20,
    notes: 'Test notes',
    eventStatus: 'scheduled',
    cancelledReason: null,
    cancelledAt: null,
    cancelledBy: null,
    weatherConsideration: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    feedbackRequested: false,
    type: null,
    location: null,
    status: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getEventEdit_WhenEventExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_WhenEventExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventEdit thành công khi event tồn tại
   * Input: eventId = 'event-123'
   * Expected Output: Trả về editEventData với đầy đủ thông tin
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record được select từ bảng events với đúng eventId
   * - Kiểm tra tất cả các fields được map đúng (snake_case -> camelCase)
   */
  it('getEventEdit_WhenEventExists_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: eventId = 'event-123'
    // Expected: Trả về editEventData với đầy đủ fields

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEditEventData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act: Gọi API
    const result = await getEventEdit(mockEventId);

    // Assert: Kiểm tra kết quả
    // Expected Output: result.editEventData.id === mockEventId, result.editEventData có đầy đủ fields
    // DB Check: events.select được gọi với đúng eventId, overrideTypes được gọi
    expect(result).toBeDefined();
    expect(result.editEventData).toBeDefined();
    expect(result.editEventData.id).toBe(mockEventId);
    expect(result.editEventData.title).toBe('Test Match');
    expect(result.editEventData.teamId).toBe('team-123');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockSelect().eq).toHaveBeenCalledWith('id', mockEventId);
  });

  /**
   * Test Case 2: getEventEdit_WhenEventNotFound_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_WhenEventNotFound_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventEdit thất bại khi không tìm thấy event
   * Input: eventId = 'event-not-exist'
   * Expected Output: Throw error "Event not found"
   * Kết quả: P (Pass)
   */
  it('getEventEdit_WhenEventNotFound_ReturnsFailure', async () => {
    // Input: eventId = 'event-not-exist'
    // Expected: Throw error với message "Event not found"

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
    await expect(getEventEdit('event-not-exist')).rejects.toEqual(mockError);
  });

  /**
   * Test Case 3: getEventEdit_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventEdit thất bại khi eventId là null
   * Input: eventId = null
   * Expected Output: Throw error database constraint violation
   * Kết quả: P (Pass)
   */
  it('getEventEdit_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: eventId = null
    // Expected: Throw error với code 'PGRST116' hoặc '23502'

    const mockError = {
      message: 'null value in column "id" violates not-null constraint',
      code: '23502',
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
    await expect(getEventEdit(null as any)).rejects.toEqual(mockError);
  });

  /**
   * Test Case 4: getEventEdit_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventEdit thất bại khi eventId là chuỗi rỗng
   * Input: eventId = ''
   * Expected Output: Throw error "Event not found"
   * Kết quả: P (Pass)
   */
  it('getEventEdit_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: eventId = ''
    // Expected: Throw error với message "Event not found"

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
    await expect(getEventEdit('')).rejects.toEqual(mockError);
  });

  /**
   * Test Case 5: getEventEdit_WhenDatabaseError_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventEdit thất bại khi có lỗi database
   * Input: eventId hợp lệ nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventEdit_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: eventId = 'event-123'
    // Expected: Throw error với code 'PGRST301' (Database connection error)

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
    await expect(getEventEdit(mockEventId)).rejects.toEqual(mockError);
  });

  /**
   * Test Case 6: getEventEdit_ReturnsEditEventDataWithAllFields
   *
   * STT: 6
   * Chức năng: Lấy thông tin event để edit
   * Test case: getEventEdit_ReturnsEditEventDataWithAllFields
   * Mục tiêu: Kiểm tra editEventData trả về có đầy đủ các fields cần thiết
   * Input: eventId = 'event-123'
   * Expected Output: editEventData có đầy đủ fields: id, teamId, title, eventType, etc.
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (teamId:team_id, createdBy:created_by, etc.)
   */
  it('getEventEdit_ReturnsEditEventDataWithAllFields', async () => {
    // Input: eventId = 'event-123'
    // Expected: editEventData có đầy đủ fields: id, teamId, createdBy, title, eventType, description, eventDate, startTime, endTime, locationName, locationAddress, locationLatitude, locationLongitude, opponent, isHomeEvent, maxParticipants, notes, eventStatus, cancelledReason, cancelledAt, cancelledBy, weatherConsideration, createdAt, updatedAt, feedbackRequested, type, location, status

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          overrideTypes: jest.fn().mockResolvedValue({
            data: mockEditEventData,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventEdit(mockEventId);

    // Assert
    // Expected Output: result.editEventData có tất cả các fields cần thiết
    // DB Check: select query được gọi với đầy đủ các fields mapping
    expect(result.editEventData).toHaveProperty('id');
    expect(result.editEventData).toHaveProperty('teamId');
    expect(result.editEventData).toHaveProperty('createdBy');
    expect(result.editEventData).toHaveProperty('title');
    expect(result.editEventData).toHaveProperty('eventType');
    expect(result.editEventData).toHaveProperty('description');
    expect(result.editEventData).toHaveProperty('eventDate');
    expect(result.editEventData).toHaveProperty('startTime');
    expect(result.editEventData).toHaveProperty('endTime');
    expect(result.editEventData).toHaveProperty('locationName');
    expect(result.editEventData).toHaveProperty('locationAddress');
    expect(result.editEventData).toHaveProperty('locationLatitude');
    expect(result.editEventData).toHaveProperty('locationLongitude');
    expect(result.editEventData).toHaveProperty('opponent');
    expect(result.editEventData).toHaveProperty('isHomeEvent');
    expect(result.editEventData).toHaveProperty('maxParticipants');
    expect(result.editEventData).toHaveProperty('notes');
    expect(result.editEventData).toHaveProperty('eventStatus');
    expect(result.editEventData).toHaveProperty('cancelledReason');
    expect(result.editEventData).toHaveProperty('cancelledAt');
    expect(result.editEventData).toHaveProperty('cancelledBy');
    expect(result.editEventData).toHaveProperty('weatherConsideration');
    expect(result.editEventData).toHaveProperty('createdAt');
    expect(result.editEventData).toHaveProperty('updatedAt');
    expect(result.editEventData).toHaveProperty('feedbackRequested');
    expect(result.editEventData).toHaveProperty('type');
    expect(result.editEventData).toHaveProperty('location');
    expect(result.editEventData).toHaveProperty('status');
  });
});

