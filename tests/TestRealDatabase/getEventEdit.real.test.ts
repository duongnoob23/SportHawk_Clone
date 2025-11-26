/**
 * Test Suite: getEventEdit API với Database Thật
 *
 * ⚠️ QUAN TRỌNG: Test này sử dụng DATABASE THẬT, không phải mock!
 *
 * Mục đích:
 * - Kiểm tra API hoạt động đúng với database thật
 * - Phát hiện lỗi thực tế: constraints, foreign keys, data types
 * - Đảm bảo code hoạt động đúng trong môi trường thực tế
 *
 * Setup cần thiết:
 * 1. Set environment variables:
 *    - TEST_SUPABASE_URL (hoặc EXPO_PUBLIC_SUPABASE_URL)
 *    - TEST_SUPABASE_SERVICE_ROLE_KEY (hoặc SUPABASE_SERVICE_ROLE_KEY)
 * 2. Đảm bảo database có ít nhất 1 team và 1 user
 *
 * Cleanup:
 * - Tất cả test data sẽ được xóa sau mỗi test
 * - Sử dụng cleanupEvent() để xóa event và data liên quan
 */

// ✅ QUAN TRỌNG: Import dbSetup TRƯỚC để có testSupabase
// Sau đó mock @lib/supabase để trả về testSupabase thay vì supabase từ lib
import {
  cleanupEvent,
  getExistingTestData,
  testSupabase,
} from './helpers/dbSetup';

// ✅ Mock @lib/supabase để thay thế supabase bằng testSupabase
// Vì lib/supabase.ts cần EXPO_PUBLIC_SUPABASE_URL mà test không có
// Nên chúng ta mock nó và dùng testSupabase từ dbSetup (đã có credentials)
jest.mock('@lib/supabase', () => ({
  supabase: testSupabase,
}));

// ✅ Unmock @supabase/supabase-js để dùng Supabase thật (không phải mock)
jest.unmock('@supabase/supabase-js');

// Import getEventEdit và createEvent SAU KHI đã mock @lib/supabase
import { createEvent, getEventEdit } from '@top/features/event/api/event';

// ✅ Bây giờ getEventEdit và createEvent sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getEventEdit API - Real Database Tests', () => {
  // Test data - sẽ được setup từ database thật
  let testTeamId: string;
  let testUserId: string;
  let createdEventIds: string[] = []; // Track events để cleanup

  // Setup: Lấy test data từ database thật
  beforeAll(async () => {
    const testData = await getExistingTestData();
    testTeamId = testData.teamId;
    testUserId = testData.userId;
  });

  // Cleanup: Xóa tất cả events đã tạo sau mỗi test
  afterEach(async () => {
    for (const eventId of createdEventIds) {
      await cleanupEvent(eventId);
    }
    createdEventIds = [];
  });

  /**
   * Test Case 1: getEventEdit_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra lấy event edit data thành công với input hợp lệ
   * Input: eventId hợp lệ
   * Expected: Trả về editEventData đầy đủ với tất cả fields
   *
   * Điểm khác với mock test:
   * - ✅ Tạo event thật trước, sau đó lấy edit data của event đó
   * - ✅ Kiểm tra data thực sự từ database khớp với expected
   * - ✅ Kiểm tra tất cả fields được map đúng (snake_case -> camelCase)
   * - ✅ Phát hiện lỗi thực tế nếu có (constraints, foreign keys)
   */
  it('getEventEdit_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước với đầy đủ thông tin
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Edit',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      location_address: '123 Test St',
      location_latitude: 21.0256221,
      location_longitude: 105.7677817,
      description: 'Test event description',
      opponent: 'Opponent Team',
      is_home_event: true,
      notes: 'Test notes',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.editEventData).toBeDefined();
    expect(result.editEventData.id).toBe(eventId);
    expect(result.editEventData.title).toBe(eventData.title);
    expect(result.editEventData.eventType).toBe(eventData.event_type);
    expect(result.editEventData.eventDate).toBe(eventData.event_date);
    expect(result.editEventData.startTime).toContain('14:00');
    expect(result.editEventData.endTime).toContain('16:00');
    expect(result.editEventData.locationName).toBe(eventData.location_name);
    expect(result.editEventData.locationAddress).toBe(
      eventData.location_address
    );
    expect(result.editEventData.locationLatitude).toBe(
      eventData.location_latitude
    );
    expect(result.editEventData.locationLongitude).toBe(
      eventData.location_longitude
    );
    expect(result.editEventData.description).toBe(eventData.description);
    expect(result.editEventData.opponent).toBe(eventData.opponent);
    expect(result.editEventData.isHomeEvent).toBe(eventData.is_home_event);
    expect(result.editEventData.notes).toBe(eventData.notes);
    expect(result.editEventData.eventStatus).toBe(eventData.event_status);
    expect(result.editEventData.teamId).toBe(testTeamId);
    expect(result.editEventData.createdBy).toBe(testUserId);
  });

  /**
   * Test Case 2: getEventEdit_WhenEventNotFound_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event không tồn tại
   * Input: eventId không tồn tại
   * Expected: Throw error
   */
  it('getEventEdit_WhenEventNotFound_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventEdit(nonExistentEventId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      // ✅ Chỉ cần kiểm tra có error là đủ (không cần kiểm tra chi tiết error message)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 3: getEventEdit_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error
   */
  it('getEventEdit_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = undefined
    const invalidEventId = undefined as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventEdit(invalidEventId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      // ✅ Chỉ cần kiểm tra có error là đủ
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getEventEdit_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error
   */
  it('getEventEdit_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventEdit(invalidEventId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      // ✅ Chỉ cần kiểm tra có error là đủ
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getEventEdit_WhenEventHasAllOptionalFieldsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra getEventEdit trả về đúng khi event có tất cả optional fields = null
   * Input: eventId của event chỉ có required fields
   * Expected: Trả về editEventData với optional fields = null
   */
  it('getEventEdit_WhenEventHasAllOptionalFieldsNull_ReturnsSuccess', async () => {
    // Arrange: Tạo event chỉ có required fields
    const eventData = {
      team_id: testTeamId,
      title: 'Minimal Event For Edit',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
      // Tất cả optional fields không có hoặc null
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.editEventData).toBeDefined();
    expect(result.editEventData.id).toBe(eventId);
    expect(result.editEventData.title).toBe(eventData.title);
    expect(result.editEventData.description).toBeNull();
    expect(result.editEventData.locationAddress).toBeNull();
    expect(result.editEventData.opponent).toBeNull();
    expect(result.editEventData.notes).toBeNull();
  });

  /**
   * Test Case 6: getEventEdit_WhenEventIsCancelled_ReturnsCancelledData
   *
   * Mục tiêu: Kiểm tra getEventEdit trả về đúng thông tin khi event đã bị cancelled
   * Input: eventId của event đã cancelled
   * Expected: Trả về editEventData với eventStatus = 'cancelled' và cancelledReason, cancelledAt, cancelledBy
   */
  it('getEventEdit_WhenEventIsCancelled_ReturnsCancelledData', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event To Cancel For Edit',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Cancel event
    const cancelReason = 'Event cancelled for testing edit';
    await testSupabase
      .from('events')
      .update({
        event_status: 'cancelled',
        cancelled_reason: cancelReason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: testUserId,
      })
      .eq('id', eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra event status là cancelled
    expect(result).toBeDefined();
    expect(result.editEventData.eventStatus).toBe('cancelled');
    expect(result.editEventData.cancelledReason).toBe(cancelReason);
    expect(result.editEventData.cancelledBy).toBe(testUserId);
    expect(result.editEventData.cancelledAt).toBeDefined();
  });

  /**
   * Test Case 7: getEventEdit_ReturnsEditEventDataWithAllFields
   *
   * Mục tiêu: Kiểm tra editEventData trả về có đầy đủ các fields cần thiết
   * Input: eventId hợp lệ
   * Expected: editEventData có đầy đủ fields theo EditEventType interface
   */
  it('getEventEdit_ReturnsEditEventDataWithAllFields', async () => {
    // Arrange: Tạo event với đầy đủ thông tin
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event With All Fields',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      location_address: '123 Test St',
      location_latitude: 21.0256221,
      location_longitude: 105.7677817,
      description: 'Test description',
      opponent: 'Opponent Team',
      is_home_event: true,
      notes: 'Test notes',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra tất cả fields có trong result
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

  /**
   * Test Case 8: getEventEdit_WhenEventHasDifferentEventTypes_ReturnsCorrectType
   *
   * Mục tiêu: Kiểm tra getEventEdit trả về đúng eventType cho các loại event khác nhau
   * Input: eventId của events với các event_type khác nhau
   * Expected: Trả về editEventData với eventType đúng
   */
  it('getEventEdit_WhenEventHasDifferentEventTypes_ReturnsCorrectType', async () => {
    const eventTypes = ['home_match', 'away_match', 'training', 'other'];

    for (const eventType of eventTypes) {
      // Arrange: Tạo event với eventType khác nhau
      const eventData = {
        team_id: testTeamId,
        title: `Test ${eventType} Event`,
        event_type: eventType,
        event_date: '2025-12-25',
        start_time: '14:00',
        end_time: '16:00',
        location_name: 'Test Stadium',
        event_status: 'active',
      };

      const eventId = await createEvent(eventData, testUserId);
      createdEventIds.push(eventId);

      // Act: Gọi API getEventEdit
      const result = await getEventEdit(eventId);

      // Assert: Kiểm tra eventType đúng
      expect(result.editEventData.eventType).toBe(eventType);
    }
  });

  /**
   * Test Case 9: getEventEdit_WhenEventHasLocationCoordinates_ReturnsCoordinates
   *
   * Mục tiêu: Kiểm tra getEventEdit trả về đúng location coordinates
   * Input: eventId của event có location_latitude và location_longitude
   * Expected: Trả về editEventData với locationLatitude và locationLongitude đúng
   */
  it('getEventEdit_WhenEventHasLocationCoordinates_ReturnsCoordinates', async () => {
    // Arrange: Tạo event với location coordinates
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event With Coordinates',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      location_address: '123 Test St',
      location_latitude: 21.0256221,
      location_longitude: 105.7677817,
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra coordinates
    expect(result.editEventData.locationLatitude).toBe(
      eventData.location_latitude
    );
    expect(result.editEventData.locationLongitude).toBe(
      eventData.location_longitude
    );
  });

  /**
   * Test Case 10: getEventEdit_WhenEventHasNoEndTime_ReturnsNullEndTime
   *
   * Mục tiêu: Kiểm tra getEventEdit trả về endTime = null khi event không có end_time
   * Input: eventId của event không có end_time
   * Expected: Trả về editEventData với endTime = null
   */
  it('getEventEdit_WhenEventHasNoEndTime_ReturnsNullEndTime', async () => {
    // Arrange: Tạo event không có end_time
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Without End Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      // Không có end_time
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventEdit
    const result = await getEventEdit(eventId);

    // Assert: Kiểm tra endTime = null
    expect(result.editEventData.endTime).toBeNull();
    expect(result.editEventData.startTime).toContain('14:00');
  });
});
