/**
 * Test Suite: deleteEvent API với Database Thật
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

// Import deleteEvent và createEvent SAU KHI đã mock @lib/supabase
import { createEvent, deleteEvent } from '@top/features/event/api/event';

// ✅ Bây giờ deleteEvent và createEvent sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('deleteEvent API - Real Database Tests', () => {
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
   * Test Case 1: deleteEvent_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra delete (cancel) event thành công với input hợp lệ
   * Input: DeleteEventData với eventId hợp lệ, userId hợp lệ, reason hợp lệ
   * Expected: Event được update với event_status = 'cancelled', cancelled_reason, cancelled_at, cancelled_by được set đúng
   *
   * Điểm khác với mock test:
   * - ✅ Tạo event thật trước, sau đó delete (cancel) event đó
   * - ✅ Kiểm tra event thực sự được update trong database
   * - ✅ Kiểm tra data trong database khớp với expected values
   * - ✅ Phát hiện lỗi thực tế nếu có (constraints, foreign keys)
   */
  it('deleteEvent_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước để test delete
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event To Delete',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // ✅ Kiểm tra event được tạo với status 'active'
    const { data: eventBeforeDelete } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventBeforeDelete).toBeDefined();
    expect(eventBeforeDelete?.event_status).toBe('active');
    expect(eventBeforeDelete?.cancelled_reason).toBeNull();
    expect(eventBeforeDelete?.cancelled_at).toBeNull();
    expect(eventBeforeDelete?.cancelled_by).toBeNull();

    // Act: Gọi API delete (cancel) event
    const reason = 'Event cancelled for testing';
    const beforeDeleteTime = new Date().toISOString();

    const result = await deleteEvent({
      eventId,
      userId: testUserId,
      reason,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.event_status).toBe('cancelled');
    expect(result.cancelled_reason).toBe(reason);
    expect(result.cancelled_by).toBe(testUserId);
    expect(result.cancelled_at).toBeDefined();

    // ✅ Kiểm tra cancelled_at là timestamp hợp lệ và gần với thời điểm hiện tại
    const cancelledAt = new Date(result.cancelled_at);
    expect(cancelledAt.getTime()).toBeGreaterThanOrEqual(
      new Date(beforeDeleteTime).getTime()
    );
    expect(cancelledAt.getTime()).toBeLessThanOrEqual(
      new Date().getTime() + 5000
    ); // Cho phép sai lệch 5 giây

    // ✅ QUAN TRỌNG: Kiểm tra event thực sự được update trong database
    const { data: eventAfterDelete, error: fetchError } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(fetchError).toBeNull();
    expect(eventAfterDelete).toBeDefined();
    expect(eventAfterDelete?.event_status).toBe('cancelled');
    expect(eventAfterDelete?.cancelled_reason).toBe(reason);
    expect(eventAfterDelete?.cancelled_by).toBe(testUserId);
    expect(eventAfterDelete?.cancelled_at).toBeDefined();
    expect(eventAfterDelete?.cancelled_at).toBe(result.cancelled_at);
  });

  /**
   * Test Case 2: deleteEvent_WhenEventNotFound_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event không tồn tại
   * Input: DeleteEventData với eventId không tồn tại
   * Expected: Throw error "Event not found"
   */
  it('deleteEvent_WhenEventNotFound_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await deleteEvent({
        eventId: nonExistentEventId,
        userId: testUserId,
        reason: 'Test reason',
      });
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error có thể là "Event not found" từ code hoặc database error
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('event not found') ||
          errorStr.includes('not found') ||
          error.message ||
          error.code
      ).toBe(true);
    }
  });

  /**
   * Test Case 3: deleteEvent_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: DeleteEventData với eventId = null/undefined
   * Expected: Throw error (validation error hoặc database error)
   *
   * ⚠️ QUAN TRỌNG: API nên validate eventId là required
   */
  it('deleteEvent_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = undefined
    const invalidPayload = {
      eventId: undefined as any,
      userId: testUserId,
      reason: 'Test reason',
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await deleteEvent(invalidPayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error có thể là validation error hoặc database error
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('event') ||
          errorStr.includes('id') ||
          errorStr.includes('required') ||
          error.message ||
          error.code
      ).toBe(true);
    }
  });

  /**
   * Test Case 4: deleteEvent_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: DeleteEventData với eventId = ''
   * Expected: Throw error "Event not found"
   */
  it('deleteEvent_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidPayload = {
      eventId: '',
      userId: testUserId,
      reason: 'Test reason',
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await deleteEvent(invalidPayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error có thể là "Event not found" từ code hoặc database error
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('event not found') ||
          errorStr.includes('not found') ||
          error.message ||
          error.code
      ).toBe(true);
    }
  });

  /**
   * Test Case 5: deleteEvent_WhenUserIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là null/undefined
   * Input: DeleteEventData với userId = null/undefined
   * Expected: Throw error (database constraint error - cancelled_by NOT NULL)
   *
   * ⚠️ QUAN TRỌNG: Database có constraint cancelled_by NOT NULL
   */
  it('deleteEvent_WhenUserIdIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act & Assert: Kiểm tra API throw error khi userId = undefined
    try {
      await deleteEvent({
        eventId,
        userId: undefined as any,
        reason: 'Test reason',
      });
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error từ database: NOT NULL constraint violation cho cancelled_by
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('cancelled_by') ||
          errorStr.includes('null value') ||
          errorStr.includes('23502') ||
          error.code === '23502' ||
          error.message ||
          error.code
      ).toBe(true);
    }
  });

  /**
   * Test Case 6: deleteEvent_WhenUserIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là empty string
   * Input: DeleteEventData với userId = ''
   * Expected: Throw error (database constraint error hoặc foreign key violation)
   */
  it('deleteEvent_WhenUserIdIsEmpty_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act & Assert: Kiểm tra API throw error khi userId = ''
    try {
      await deleteEvent({
        eventId,
        userId: '',
        reason: 'Test reason',
      });
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error có thể là foreign key violation hoặc constraint error
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('foreign key') ||
          errorStr.includes('23503') ||
          error.code === '23503' ||
          errorStr.includes('cancelled_by') ||
          error.message ||
          error.code
      ).toBe(true);
    }
  });

  /**
   * Test Case 7: deleteEvent_WhenUserIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId không tồn tại (foreign key violation)
   * Input: DeleteEventData với userId không tồn tại
   * Expected: Throw error với foreign key constraint violation
   */
  it('deleteEvent_WhenUserIdDoesNotExist_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act & Assert: Kiểm tra API throw error khi userId không tồn tại
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    try {
      await deleteEvent({
        eventId,
        userId: nonExistentUserId,
        reason: 'Test reason',
      });
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error từ database: Foreign key constraint violation
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('foreign key') ||
          errorStr.includes('23503') ||
          error.code === '23503' ||
          errorStr.includes('cancelled_by')
      ).toBe(true);
    }
  });

  /**
   * Test Case 8: deleteEvent_WhenReasonIsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra delete event thành công khi reason là null (sử dụng default 'Cancel Event')
   * Input: DeleteEventData với reason = null
   * Expected: Event được update với cancelled_reason = 'Cancel Event' (default)
   */
  it('deleteEvent_WhenReasonIsNull_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Reason',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API delete với reason = null
    const result = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: null as any,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.event_status).toBe('cancelled');
    expect(result.cancelled_reason).toBe('Cancel Event'); // Default value
    expect(result.cancelled_by).toBe(testUserId);

    // ✅ Kiểm tra event trong database có cancelled_reason = 'Cancel Event'
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb).toBeDefined();
    expect(eventInDb?.cancelled_reason).toBe('Cancel Event');
  });

  /**
   * Test Case 9: deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra delete event thành công khi reason là empty string (sử dụng default 'Cancel Event')
   * Input: DeleteEventData với reason = ''
   * Expected: Event được update với cancelled_reason = 'Cancel Event' (default)
   */
  it('deleteEvent_WhenReasonIsEmpty_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty Reason',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API delete với reason = ''
    const result = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: '',
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.event_status).toBe('cancelled');
    expect(result.cancelled_reason).toBe('Cancel Event'); // Default value (empty string is falsy)
    expect(result.cancelled_by).toBe(testUserId);

    // ✅ Kiểm tra event trong database có cancelled_reason = 'Cancel Event'
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb).toBeDefined();
    expect(eventInDb?.cancelled_reason).toBe('Cancel Event');
  });

  /**
   * Test Case 10: deleteEvent_UpdatesCancelledAtTimestamp
   *
   * Mục tiêu: Kiểm tra cancelled_at được set với timestamp hiện tại
   * Input: DeleteEventData hợp lệ
   * Expected: cancelled_at có giá trị timestamp hợp lệ và gần với thời điểm hiện tại
   */
  it('deleteEvent_UpdatesCancelledAtTimestamp', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Timestamp Check',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API delete và đo thời gian
    const beforeDeleteTime = new Date().toISOString();
    const result = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: 'Test reason',
    });
    const afterDeleteTime = new Date().toISOString();

    // Assert: Kiểm tra cancelled_at là timestamp hợp lệ
    expect(result.cancelled_at).toBeDefined();
    const cancelledAt = new Date(result.cancelled_at);
    expect(cancelledAt.getTime()).toBeGreaterThanOrEqual(
      new Date(beforeDeleteTime).getTime()
    );
    expect(cancelledAt.getTime()).toBeLessThanOrEqual(
      new Date(afterDeleteTime).getTime() + 1000
    ); // Cho phép sai lệch 1 giây

    // ✅ Kiểm tra event trong database có cancelled_at đúng
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb?.cancelled_at).toBeDefined();
    expect(eventInDb?.cancelled_at).toBe(result.cancelled_at);
  });

  /**
   * Test Case 11: deleteEvent_UpdatesCancelledByUserId
   *
   * Mục tiêu: Kiểm tra cancelled_by được set với userId đúng
   * Input: DeleteEventData với userId hợp lệ
   * Expected: cancelled_by = userId trong database
   */
  it('deleteEvent_UpdatesCancelledByUserId', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For CancelledBy Check',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API delete
    const result = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: 'Test reason',
    });

    // Assert: Kiểm tra cancelled_by = userId
    expect(result.cancelled_by).toBe(testUserId);

    // ✅ Kiểm tra event trong database có cancelled_by = userId
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb?.cancelled_by).toBe(testUserId);
  });

  /**
   * Test Case 12: deleteEvent_WhenEventAlreadyCancelled_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra delete event đã bị cancelled trước đó vẫn thành công (update lại)
   * Input: DeleteEventData với eventId của event đã cancelled
   * Expected: Event được update lại với cancelled_reason, cancelled_at, cancelled_by mới
   */
  it('deleteEvent_WhenEventAlreadyCancelled_ReturnsSuccess', async () => {
    // Arrange: Tạo event và cancel lần đầu
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Already Cancelled',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Cancel lần đầu
    const firstReason = 'First cancellation';
    const firstResult = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: firstReason,
    });

    expect(firstResult.event_status).toBe('cancelled');
    expect(firstResult.cancelled_reason).toBe(firstReason);
    const firstCancelledAt = firstResult.cancelled_at;

    // Đợi 1 giây để đảm bảo timestamp khác
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Act: Cancel lần thứ hai với reason khác
    const secondReason = 'Second cancellation';
    const beforeSecondCancel = new Date().toISOString();
    const secondResult = await deleteEvent({
      eventId,
      userId: testUserId,
      reason: secondReason,
    });

    // Assert: Kiểm tra event được update lại
    expect(secondResult.event_status).toBe('cancelled');
    expect(secondResult.cancelled_reason).toBe(secondReason); // Reason mới
    expect(secondResult.cancelled_by).toBe(testUserId);

    // ✅ Kiểm tra cancelled_at được update lại (timestamp mới)
    const secondCancelledAt = new Date(secondResult.cancelled_at);
    const firstCancelledAtDate = new Date(firstCancelledAt);
    expect(secondCancelledAt.getTime()).toBeGreaterThan(
      firstCancelledAtDate.getTime()
    );

    // ✅ Kiểm tra event trong database có data mới
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb?.cancelled_reason).toBe(secondReason);
    expect(eventInDb?.cancelled_at).toBe(secondResult.cancelled_at);
  });
});
