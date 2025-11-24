/**
 * Test Suite: getDeleteAllEventSquad API
 *
 * Chức năng: Xóa toàn bộ squad members của event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getDeleteAllEventSquad()
 *
 * Test Cases:
 * 1. getDeleteAllEventSquad_WhenEventExists_ReturnsSuccess
 * 2. getDeleteAllEventSquad_WhenEventIdIsNull_ReturnsFailure
 * 3. getDeleteAllEventSquad_WhenEventIdIsEmpty_ReturnsFailure
 * 4. getDeleteAllEventSquad_WhenEventNotFound_ReturnsSuccess
 * 5. getDeleteAllEventSquad_WhenDatabaseError_ReturnsFailure
 * 6. getDeleteAllEventSquad_ReturnsDataWithEventId
 */

import { supabase } from '@lib/supabase';
import { getDeleteAllEventSquad } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getDeleteAllEventSquad API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockTeamId = 'team-123';

  const mockDeletedData = [
    { id: 'squad-1', event_id: mockEventId, user_id: 'user-1' },
    { id: 'squad-2', event_id: mockEventId, user_id: 'user-2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getDeleteAllEventSquad_WhenEventExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_WhenEventExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getDeleteAllEventSquad thành công khi event tồn tại
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Trả về { data: deletedRecords, eventId: 'event-123' }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được delete từ bảng event_squads với đúng event_id
   * - Kiểm tra tất cả squad members của event được xóa
   */
  it('getDeleteAllEventSquad_WhenEventExists_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
    // Expected: Trả về { data: deletedRecords, eventId: 'event-123' }

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockDeletedData,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act: Gọi API
    const result = await getDeleteAllEventSquad({
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert: Kiểm tra kết quả
    // Expected Output: result.eventId === mockEventId, result.data === mockDeletedData
    // DB Check: event_squads.delete được gọi với .eq('event_id', eventId)
    expect(result).toBeDefined();
    expect(result.eventId).toBe(mockEventId);
    expect(result.data).toEqual(mockDeletedData);
    expect(supabase.from).toHaveBeenCalledWith('event_squads');
    expect(mockDelete().eq).toHaveBeenCalledWith('event_id', mockEventId);
  });

  /**
   * Test Case 2: getDeleteAllEventSquad_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getDeleteAllEventSquad thất bại khi eventId là null
   * Input: { eventId: null, userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Throw error "Missing eventId in getDeleteAllEventSquad"
   * Kết quả: P (Pass)
   */
  it('getDeleteAllEventSquad_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: { eventId: null, userId: 'user-123', teamId: 'team-123' }
    // Expected: Throw error với message "Missing eventId in getDeleteAllEventSquad"

    // Act & Assert
    await expect(
      getDeleteAllEventSquad({
        eventId: null as any,
        userId: mockUserId,
        teamId: mockTeamId,
      })
    ).rejects.toThrow('Missing eventId in getDeleteAllEventSquad');
  });

  /**
   * Test Case 3: getDeleteAllEventSquad_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getDeleteAllEventSquad thất bại khi eventId là chuỗi rỗng
   * Input: { eventId: '', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Throw error "Missing eventId in getDeleteAllEventSquad"
   * Kết quả: P (Pass)
   */
  it('getDeleteAllEventSquad_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: { eventId: '', userId: 'user-123', teamId: 'team-123' }
    // Expected: Throw error với message "Missing eventId in getDeleteAllEventSquad"

    // Act & Assert
    await expect(
      getDeleteAllEventSquad({
        eventId: '',
        userId: mockUserId,
        teamId: mockTeamId,
      })
    ).rejects.toThrow('Missing eventId in getDeleteAllEventSquad');
  });

  /**
   * Test Case 4: getDeleteAllEventSquad_WhenEventNotFound_ReturnsSuccess
   *
   * STT: 4
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_WhenEventNotFound_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getDeleteAllEventSquad thành công khi không có squad members
   * Input: { eventId: 'event-not-exist', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: Trả về { data: null hoặc [], eventId: 'event-not-exist' }
   * Kết quả: P (Pass)
   */
  it('getDeleteAllEventSquad_WhenEventNotFound_ReturnsSuccess', async () => {
    // Input: { eventId: 'event-not-exist', userId: 'user-123', teamId: 'team-123' }
    // Expected: Trả về { data: null, eventId: 'event-not-exist' } (không có records để delete)

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act
    const result = await getDeleteAllEventSquad({
      eventId: 'event-not-exist',
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result.eventId === 'event-not-exist', result.data === null
    expect(result).toBeDefined();
    expect(result.eventId).toBe('event-not-exist');
    expect(result.data).toBeNull();
  });

  /**
   * Test Case 5: getDeleteAllEventSquad_WhenDatabaseError_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getDeleteAllEventSquad thất bại khi có lỗi database
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' } nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getDeleteAllEventSquad_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act & Assert
    await expect(
      getDeleteAllEventSquad({
        eventId: mockEventId,
        userId: mockUserId,
        teamId: mockTeamId,
      })
    ).rejects.toEqual(mockError);
  });

  /**
   * Test Case 6: getDeleteAllEventSquad_ReturnsDataWithEventId
   *
   * STT: 6
   * Chức năng: Xóa toàn bộ squad members
   * Test case: getDeleteAllEventSquad_ReturnsDataWithEventId
   * Mục tiêu: Kiểm tra kết quả trả về có đầy đủ data và eventId
   * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
   * Expected Output: { data: deletedRecords, eventId: 'event-123' }
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra delete query được gọi với đúng event_id
   */
  it('getDeleteAllEventSquad_ReturnsDataWithEventId', async () => {
    // Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
    // Expected: { data: deletedRecords, eventId: 'event-123' }

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockDeletedData,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });

    // Act
    const result = await getDeleteAllEventSquad({
      eventId: mockEventId,
      userId: mockUserId,
      teamId: mockTeamId,
    });

    // Assert
    // Expected Output: result có cả data và eventId
    // DB Check: delete query được gọi với đúng event_id
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('eventId');
    expect(result.data).toEqual(mockDeletedData);
    expect(result.eventId).toBe(mockEventId);
    expect(mockDelete().eq).toHaveBeenCalledWith('event_id', mockEventId);
  });
});

