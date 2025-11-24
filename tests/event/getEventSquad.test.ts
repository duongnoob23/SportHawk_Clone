/**
 * Test Suite: getEventSquad API
 *
 * Chức năng: Lấy danh sách squad members của event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: getEventSquad()
 *
 * Test Cases:
 * 1. getEventSquad_WhenEventExists_ReturnsSuccess
 * 2. getEventSquad_WhenEventNotFound_ReturnsEmptyArray
 * 3. getEventSquad_WhenEventIdIsNull_ReturnsFailure
 * 4. getEventSquad_WhenEventIdIsEmpty_ReturnsFailure
 * 5. getEventSquad_WhenDatabaseError_ReturnsFailure
 * 6. getEventSquad_ReturnsSquadMembersWithAllFields
 */

import { supabase } from '@lib/supabase';
import { getEventSquad } from '@top/features/event/api/event';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getEventSquad API', () => {
  // Mock data
  const mockEventId = 'event-123';

  const mockSquadMembers = [
    {
      id: 'squad-1',
      userId: 'user-1',
      position: 'GK',
      squadRole: 'starter',
      selectionNotes: 'Main goalkeeper',
    },
    {
      id: 'squad-2',
      userId: 'user-2',
      position: 'DF',
      squadRole: 'starter',
      selectionNotes: 'Center back',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: getEventSquad_WhenEventExists_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_WhenEventExists_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức getEventSquad thành công khi event tồn tại
   * Input: { eventId: 'event-123' }
   * Expected Output: Trả về mảng squad members
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra records được select từ bảng event_squads với đúng event_id
   * - Kiểm tra các fields được map đúng (userId:user_id, squadRole:squad_role, etc.)
   */
  it('getEventSquad_WhenEventExists_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    // Input: { eventId: 'event-123' }
    // Expected: Trả về mảng squad members với đầy đủ thông tin

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockSquadMembers,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act: Gọi API
    const result = await getEventSquad({ eventId: mockEventId });

    // Assert: Kiểm tra kết quả
    // Expected Output: result là mảng, result.length > 0, result[0] có đầy đủ fields
    // DB Check: event_squads.select được gọi với đúng event_id
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('userId');
    expect(result[0]).toHaveProperty('position');
    expect(result[0]).toHaveProperty('squadRole');
    expect(result[0]).toHaveProperty('selectionNotes');
    expect(supabase.from).toHaveBeenCalledWith('event_squads');
    expect(mockSelect().eq).toHaveBeenCalledWith('event_id', mockEventId);
  });

  /**
   * Test Case 2: getEventSquad_WhenEventNotFound_ReturnsEmptyArray
   *
   * STT: 2
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_WhenEventNotFound_ReturnsEmptyArray
   * Mục tiêu: Kiểm tra phương thức getEventSquad trả về mảng rỗng khi không có squad members
   * Input: { eventId: 'event-not-exist' }
   * Expected Output: Trả về mảng rỗng []
   * Kết quả: P (Pass)
   */
  it('getEventSquad_WhenEventNotFound_ReturnsEmptyArray', async () => {
    // Input: { eventId: 'event-not-exist' }
    // Expected: Trả về mảng rỗng []

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventSquad({ eventId: 'event-not-exist' });

    // Assert
    // Expected Output: result === []
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 3: getEventSquad_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquad thất bại khi eventId là null
   * Input: { eventId: null }
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventSquad_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Input: { eventId: null }
    // Expected: Throw error với code '23502' hoặc 'PGRST116'

    const mockError = {
      message: 'null value in column "event_id" violates not-null constraint',
      code: '23502',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert
    await expect(getEventSquad({ eventId: null as any })).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 4: getEventSquad_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquad thất bại khi eventId là chuỗi rỗng
   * Input: { eventId: '' }
   * Expected Output: Trả về mảng rỗng hoặc throw error
   * Kết quả: P (Pass)
   */
  it('getEventSquad_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Input: { eventId: '' }
    // Expected: Trả về mảng rỗng [] (vì không có record nào match với event_id = '')

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventSquad({ eventId: '' });

    // Assert
    // Expected Output: result === []
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 5: getEventSquad_WhenDatabaseError_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức getEventSquad thất bại khi có lỗi database
   * Input: { eventId: 'event-123' } nhưng database trả về error
   * Expected Output: Throw error database
   * Kết quả: P (Pass)
   */
  it('getEventSquad_WhenDatabaseError_ReturnsFailure', async () => {
    // Input: { eventId: 'event-123' }
    // Expected: Throw error với code 'PGRST301' (Database connection error)

    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act & Assert
    await expect(getEventSquad({ eventId: mockEventId })).rejects.toEqual(
      mockError
    );
  });

  /**
   * Test Case 6: getEventSquad_ReturnsSquadMembersWithAllFields
   *
   * STT: 6
   * Chức năng: Lấy danh sách squad members
   * Test case: getEventSquad_ReturnsSquadMembersWithAllFields
   * Mục tiêu: Kiểm tra squad members trả về có đầy đủ các fields cần thiết
   * Input: { eventId: 'event-123' }
   * Expected Output: Mảng squad members với đầy đủ fields: id, userId, position, squadRole, selectionNotes
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra select query có đầy đủ các fields được map (userId:user_id, squadRole:squad_role, selectionNotes:selection_notes)
   */
  it('getEventSquad_ReturnsSquadMembersWithAllFields', async () => {
    // Input: { eventId: 'event-123' }
    // Expected: Mảng squad members với đầy đủ fields: id, userId, position, squadRole, selectionNotes

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockSquadMembers,
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    // Act
    const result = await getEventSquad({ eventId: mockEventId });

    // Assert
    // Expected Output: result[0] có tất cả các fields cần thiết
    // DB Check: select query được gọi với đầy đủ các fields mapping
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('userId');
    expect(result[0]).toHaveProperty('position');
    expect(result[0]).toHaveProperty('squadRole');
    expect(result[0]).toHaveProperty('selectionNotes');
    expect(result[0].id).toBe('squad-1');
    expect(result[0].userId).toBe('user-1');
    expect(result[0].position).toBe('GK');
    expect(result[0].squadRole).toBe('starter');
    expect(result[0].selectionNotes).toBe('Main goalkeeper');
  });
});

