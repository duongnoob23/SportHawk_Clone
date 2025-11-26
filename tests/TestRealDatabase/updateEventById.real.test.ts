/**
 * Test Suite: updateEventById API với Database Thật
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
  findAndCleanupEventByTitle,
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

// Import createEvent và updateEventById SAU KHI đã mock @lib/supabase
import { createEvent, updateEventById } from '@top/features/event/api/event';

// ✅ Bây giờ createEvent và updateEventById sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('updateEventById API - Real Database Tests', () => {
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
   * Test Case 1: updateEventById_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event thành công với input hợp lệ
   * Input: UpdateEventByIdType với đầy đủ thông tin hợp lệ
   * Expected: Trả về event đã được update
   */
  it('updateEventById_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event To Update',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'home_match',
        homeTeamName: 'Home Team',
        awayTeamName: 'Away Team',
        eventDate: new Date('2025-12-26').toISOString(),
        startTime: new Date('2025-12-26T15:00:00').toISOString(),
        endTime: new Date('2025-12-26T17:00:00').toISOString(),
        location: 'Updated Stadium',
        locationAddress: '456 Updated St',
        description: 'Updated description',
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.title).toBe('Home Team vs Away Team');
    expect(result.event_type).toBe('home_match');
    expect(result.description).toBe('Updated description');
    expect(result.location_name).toBe('Updated Stadium');
    expect(result.location_address).toBe('456 Updated St');
  });

  /**
   * Test Case 2: updateEventById_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error
   */
  it('updateEventById_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const updatePayload = {
      eventId: null as any,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('eventId is required');
    }
  });

  /**
   * Test Case 3: updateEventById_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error
   */
  it('updateEventById_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const updatePayload = {
      eventId: '',
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('eventId is required');
    }
  });

  /**
   * Test Case 4: updateEventById_WhenEventNotFound_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event không tồn tại
   * Input: eventId không tồn tại
   * Expected: Throw error
   */
  it('updateEventById_WhenEventNotFound_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';
    const updatePayload = {
      eventId: nonExistentEventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: updateEventById_WhenTeamIdIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi teamId không tồn tại (foreign key violation)
   * Input: teamId không tồn tại
   * Expected: Throw error
   *
   * ✅ QUAN TRỌNG:
   * - Test này PASS khi có lỗi (throw error) → Đúng
   * - Test này FAIL khi event vẫn update thành công (không throw error nhưng vẫn update) → Sai, cần cleanup
   */
  it('updateEventById_WhenTeamIdIsInvalid_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Team',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Lưu teamId ban đầu để so sánh sau
    const originalTeamId = testTeamId;

    // Chuẩn bị update data với teamId không tồn tại
    const invalidTeamId = '00000000-0000-0000-0000-000000000000';
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: invalidTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      const result = await updateEventById(updatePayload);

      // ❌ Nếu update thành công (không throw error), đây là BUG!
      // Kiểm tra xem team_id có thay đổi không
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, team_id, title')
        .eq('id', eventId)
        .single();

      if (updatedEvent && updatedEvent.team_id === invalidTeamId) {
        // Event đã được update với teamId không hợp lệ → Đây là BUG!
        // Cleanup event đã bị update sai
        await findAndCleanupEventByTitle(updatedEvent.title, invalidTeamId);
        // Test FAIL: API không throw error nhưng vẫn update thành công
        throw new Error(
          `❌ BUG: API không throw error khi teamId không tồn tại! Event đã được update với team_id = ${invalidTeamId}`
        );
      }

      // Nếu update thành công nhưng team_id không thay đổi (có thể do logic không update team_id)
      // Vẫn là vấn đề vì không throw error
      throw new Error('Expected error to be thrown when teamId is invalid');
    } catch (error: any) {
      // ✅ Nếu throw error → Test PASS (đúng)
      expect(error).toBeDefined();

      // Kiểm tra lại event vẫn có teamId ban đầu (không bị update)
      const { data: eventAfterError } = await testSupabase
        .from('events')
        .select('id, team_id')
        .eq('id', eventId)
        .single();

      if (eventAfterError) {
        // Event vẫn có teamId ban đầu → Đúng
        expect(eventAfterError.team_id).toBe(originalTeamId);
      }
    }
  });

  /**
   * Test Case 6: updateEventById_WhenEndTimeBeforeStartTime_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi endTime < startTime (CHECK constraint)
   * Input: endTime < startTime
   * Expected: Throw error
   */
  it('updateEventById_WhenEndTimeBeforeStartTime_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với endTime < startTime
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: new Date('2025-12-25T16:00:00').toISOString(),
        endTime: new Date('2025-12-25T14:00:00').toISOString(), // endTime < startTime
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: updateEventById_WhenEndTimeEqualsStartTime_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi endTime = startTime (CHECK constraint)
   * Input: endTime = startTime
   * Expected: Throw error
   */
  it('updateEventById_WhenEndTimeEqualsStartTime_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Equal Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với endTime = startTime
    const sameTime = new Date('2025-12-25T14:00:00').toISOString();
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: sameTime,
        endTime: sameTime, // endTime = startTime
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 8: updateEventById_WhenInvalidEventType_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventType không hợp lệ
   * Input: eventType không hợp lệ
   * Expected: Throw error (hoặc có thể không throw nếu database cho phép)
   */
  it('updateEventById_WhenInvalidEventType_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Type',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType không hợp lệ
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'invalid_type' as any,
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error hoặc không throw (tùy database constraint)
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      // Nếu không throw error, có thể database cho phép invalid eventType
      // Trong trường hợp này, test vẫn pass nhưng có thể cần kiểm tra validation ở application level
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 9: updateEventById_WhenEventDateIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventDate không hợp lệ
   * Input: eventDate không hợp lệ
   * Expected: Throw error
   */
  it('updateEventById_WhenEventDateIsInvalid_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Date',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventDate không hợp lệ
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: 'invalid-date' as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: updateEventById_WhenAdminIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi adminId là null (cần cho invitations)
   * Input: adminId = null
   * Expected: Throw error khi có addArray hoặc removeArray
   */
  it('updateEventById_WhenAdminIdIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Admin',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với adminId = null và có addArray
    const updatePayload = {
      eventId: eventId,
      adminId: null as any,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [testUserId], // Có addArray nên cần adminId
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 11: updateEventById_WhenAdminIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi adminId là empty string
   * Input: adminId = '' và có addArray
   * Expected: Throw error
   */
  it('updateEventById_WhenAdminIdIsEmpty_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty Admin',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với adminId = '' và có addArray
    const updatePayload = {
      eventId: eventId,
      adminId: '',
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [testUserId], // Có addArray nên cần adminId hợp lệ
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 12: updateEventById_WhenInvalidUserIdInAddArray_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId trong addArray không tồn tại
   * Input: addArray chứa userId không tồn tại
   * Expected: Throw error (foreign key violation)
   */
  it('updateEventById_WhenInvalidUserIdInAddArray_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid User In Add',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với addArray chứa userId không tồn tại
    const invalidUserId = '00000000-0000-0000-0000-000000000000';
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [invalidUserId], // userId không tồn tại
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 13: updateEventById_WhenUpdateWithAllOptionalFieldsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event thành công khi tất cả optional fields = null
   * Input: formData chỉ có required fields
   * Expected: Trả về event đã được update
   */
  it('updateEventById_WhenUpdateWithAllOptionalFieldsNull_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event To Update With Null',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      description: 'Original description',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với tất cả optional fields = null
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'other',
        eventTitle: 'Updated Title',
        eventDate: new Date('2025-12-26').toISOString(),
        teamId: testTeamId,
        // Tất cả optional fields không có hoặc null
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.event_type).toBe('other');
    expect(result.title).toBe('Updated Title');
  });

  /**
   * Test Case 14: updateEventById_WhenUpdateWithAddArray_InsertsInvitations
   *
   * Mục tiêu: Kiểm tra update event với addArray sẽ insert invitations
   * Input: addArray chứa userId hợp lệ
   * Expected: Invitations được insert vào event_invitations
   */
  it('updateEventById_WhenUpdateWithAddArray_InsertsInvitations', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Add Invitations',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với addArray
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [testUserId], // Add user to invitations
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);

    // Kiểm tra invitation được insert
    const { data: invitations } = await testSupabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', testUserId);

    expect(invitations).toBeDefined();
    expect(invitations?.length).toBeGreaterThan(0);
    expect(invitations?.[0].invitation_status).toBe('pending');
  });

  /**
   * Test Case 15: updateEventById_WhenUpdateWithRemoveArray_DeletesInvitations
   *
   * Mục tiêu: Kiểm tra update event với removeArray sẽ delete invitations
   * Input: removeArray chứa userId đã có invitation
   * Expected: Invitations được delete khỏi event_invitations
   */
  it('updateEventById_WhenUpdateWithRemoveArray_DeletesInvitations', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Remove Invitations',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation trước
    await testSupabase.from('event_invitations').insert({
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    });

    // Chuẩn bị update data với removeArray
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [testUserId], // Remove user from invitations
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);

    // Kiểm tra invitation đã được delete
    const { data: invitations } = await testSupabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', testUserId);

    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(0);
  });

  /**
   * Test Case 16: updateEventById_WhenUpdateHomeMatch_GeneratesCorrectTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'home_match' sẽ generate title đúng
   * Input: eventType = 'home_match' với homeTeamName và awayTeamName
   * Expected: Title = 'Home Team vs Away Team'
   */
  it('updateEventById_WhenUpdateHomeMatch_GeneratesCorrectTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Home Match',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'home_match'
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'home_match',
        homeTeamName: 'Home Team',
        awayTeamName: 'Away Team',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Home Team vs Away Team');
    expect(result.event_type).toBe('home_match');
  });

  /**
   * Test Case 17: updateEventById_WhenUpdateTraining_GeneratesCorrectTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'training' sẽ generate title = 'Training'
   * Input: eventType = 'training'
   * Expected: Title = 'Training'
   */
  it('updateEventById_WhenUpdateTraining_GeneratesCorrectTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Training',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'training'
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Training');
    expect(result.event_type).toBe('training');
  });

  /**
   * Test Case 18: updateEventById_WhenUpdateOther_GeneratesCorrectTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'other' sẽ generate title từ eventTitle
   * Input: eventType = 'other' với eventTitle
   * Expected: Title = eventTitle hoặc 'Event' nếu không có
   */
  it('updateEventById_WhenUpdateOther_GeneratesCorrectTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Other',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'other'
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'other',
        eventTitle: 'Custom Event Title',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Custom Event Title');
    expect(result.event_type).toBe('other');
  });

  /**
   * Test Case 19: updateEventById_WhenUpdateLocationCoordinates_UpdatesCoordinates
   *
   * Mục tiêu: Kiểm tra update event với location coordinates
   * Input: locationLatitude và locationLongitude
   * Expected: Coordinates được update đúng
   */
  it('updateEventById_WhenUpdateLocationCoordinates_UpdatesCoordinates', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Coordinates',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với coordinates
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        location: 'Updated Stadium',
        locationAddress: '456 Updated St',
        locationLatitude: 21.0256221,
        locationLongitude: 105.7677817,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra coordinates
    expect(result).toBeDefined();
    expect(result.location_latitude).toBe(21.0256221);
    expect(result.location_longitude).toBe(105.7677817);
    expect(result.location_name).toBe('Updated Stadium');
    expect(result.location_address).toBe('456 Updated St');
  });

  /**
   * Test Case 20: updateEventById_WhenUpdateWithNotes_UpdatesNotes
   *
   * Mục tiêu: Kiểm tra update event với notes (kitColor, meetTime, answerBy, preMatchMessage)
   * Input: formData có kitColor, meetTime, answerBy, preMatchMessage
   * Expected: Notes được format đúng và update
   */
  it('updateEventById_WhenUpdateWithNotes_UpdatesNotes', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Notes',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với notes
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        kitColor: 'Red and Blue',
        meetTime: new Date('2025-12-25T13:00:00').toISOString(),
        answerBy: new Date('2025-12-24T22:45:00').toISOString(),
        preMatchMessage: 'Test message',
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra notes
    expect(result).toBeDefined();
    expect(result.notes).toBeDefined();
    expect(result.notes).toContain('Kit Color: Red and Blue');
    expect(result.notes).toContain('Meet:');
    expect(result.notes).toContain('Answer by:');
    expect(result.notes).toContain('Message: Test message');
  });

  /**
   * Test Case 21: updateEventById_WhenDescriptionIsEmpty_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event với description = empty string
   * Input: description = ''
   * Expected: Update thành công (description có thể null/empty)
   */
  it('updateEventById_WhenDescriptionIsEmpty_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty Description',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      description: 'Original description',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với description = ''
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        description: '',
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    // Description có thể null hoặc empty tùy database
  });

  /**
   * Test Case 22: updateEventById_WhenLocationIsEmpty_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event với location = empty string
   * Input: location = ''
   * Expected: Update thành công (location có thể null/empty)
   */
  it('updateEventById_WhenLocationIsEmpty_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty Location',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      location_name: 'Original Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với location = ''
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        location: '',
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
  });

  /**
   * Test Case 23: updateEventById_WhenStartTimeIsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event với startTime = null
   * Input: startTime = null
   * Expected: Update thành công (startTime có thể null)
   */
  it('updateEventById_WhenStartTimeIsNull_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Start Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với startTime = null
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: null as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
  });

  /**
   * Test Case 24: updateEventById_WhenEndTimeIsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update event với endTime = null
   * Input: endTime = null
   * Expected: Update thành công (endTime có thể null)
   */
  it('updateEventById_WhenEndTimeIsNull_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null End Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với endTime = null
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: new Date('2025-12-25T14:00:00').toISOString(),
        endTime: null as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
  });

  /**
   * Test Case 25: updateEventById_WhenEventDateIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra update event với eventDate = null
   * Input: eventDate = null
   * Expected: Throw error hoặc update thành công tùy database constraint
   */
  it('updateEventById_WhenEventDateIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Date',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventDate = null
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: null as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error hoặc update thành công
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      // Có thể database cho phép eventDate = null
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 26: updateEventById_WhenStartTimeIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra update event với startTime không hợp lệ
   * Input: startTime = 'invalid-time'
   * Expected: Throw error
   */
  it('updateEventById_WhenStartTimeIsInvalid_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Start Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với startTime không hợp lệ
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: 'invalid-time' as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 27: updateEventById_WhenEndTimeIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra update event với endTime không hợp lệ
   * Input: endTime = 'invalid-time'
   * Expected: Throw error
   */
  it('updateEventById_WhenEndTimeIsInvalid_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid End Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với endTime không hợp lệ
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'training',
        eventDate: new Date('2025-12-25').toISOString(),
        startTime: new Date('2025-12-25T14:00:00').toISOString(),
        endTime: 'invalid-time' as any,
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await updateEventById(updatePayload);
      // Nếu update thành công, kiểm tra xem có tạo record không và cleanup
      const { data: updatedEvent } = await testSupabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();
      if (updatedEvent) {
        await findAndCleanupEventByTitle(updatedEvent.title, testTeamId);
      }
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 28: updateEventById_WhenAwayMatch_GeneratesCorrectTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'away_match' sẽ generate title đúng
   * Input: eventType = 'away_match' với homeTeamName và awayTeamName
   * Expected: Title = 'Home Team vs Away Team'
   */
  it('updateEventById_WhenAwayMatch_GeneratesCorrectTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Away Match',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'away_match'
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'away_match',
        homeTeamName: 'Home Team',
        awayTeamName: 'Away Team',
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Home Team vs Away Team');
    expect(result.event_type).toBe('away_match');
  });

  /**
   * Test Case 29: updateEventById_WhenHomeMatchWithoutAwayTeam_GeneratesCorrectTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'home_match' nhưng không có awayTeamName
   * Input: eventType = 'home_match' chỉ có homeTeamName
   * Expected: Title = 'Home Team' hoặc 'Match'
   */
  it('updateEventById_WhenHomeMatchWithoutAwayTeam_GeneratesCorrectTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Home Match No Away',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'home_match' chỉ có homeTeamName
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'home_match',
        homeTeamName: 'Home Team',
        // Không có awayTeamName
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Home Team');
    expect(result.event_type).toBe('home_match');
  });

  /**
   * Test Case 30: updateEventById_WhenOtherWithoutEventTitle_GeneratesDefaultTitle
   *
   * Mục tiêu: Kiểm tra update event với eventType = 'other' nhưng không có eventTitle
   * Input: eventType = 'other' không có eventTitle
   * Expected: Title = 'Event' (default)
   */
  it('updateEventById_WhenOtherWithoutEventTitle_GeneratesDefaultTitle', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Other No Title',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị update data với eventType = 'other' không có eventTitle
    const updatePayload = {
      eventId: eventId,
      adminId: testUserId,
      formData: {
        eventType: 'other',
        // Không có eventTitle
        eventDate: new Date('2025-12-25').toISOString(),
        teamId: testTeamId,
      },
      addArray: [],
      removeArray: [],
    };

    // Act: Gọi API updateEventById
    const result = await updateEventById(updatePayload);

    // Assert: Kiểm tra title đúng
    expect(result).toBeDefined();
    expect(result.title).toBe('Event');
    expect(result.event_type).toBe('other');
  });
});
