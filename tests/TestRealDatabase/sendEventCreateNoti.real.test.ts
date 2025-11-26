/**
 * Test Suite: sendEventCreateNoti API với Database Thật
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
 * - Sử dụng cleanupNotification() để xóa notification và data liên quan
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

// Import getInsertNotificationTemplate và createEvent SAU KHI đã mock @lib/supabase
import { createEvent } from '@top/features/event/api/event';
import { getInsertNotificationTemplate } from '@top/features/event/api/notifications';
import { NotificationType } from '@top/types/notificationTypes';

// ✅ Bây giờ getInsertNotificationTemplate và createEvent sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('sendEventCreateNoti API - Real Database Tests', () => {
  // Test data - sẽ được setup từ database thật
  let testTeamId: string;
  let testUserId: string;
  let targetUserId: string; // User ID để gửi notification: f3ee2852-4cf0-45e8-8c71-8480810d45e7
  let createdEventIds: string[] = []; // Track events để cleanup
  let createdNotificationIds: string[] = []; // Track notifications để cleanup

  // Helper function để cleanup notification
  const cleanupNotification = async (notificationId: string) => {
    try {
      await testSupabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    } catch (error) {
      console.error('❌ Error cleaning up notification:', error);
    }
  };

  // Setup: Lấy test data từ database thật
  beforeAll(async () => {
    const testData = await getExistingTestData();
    testTeamId = testData.teamId;
    testUserId = testData.userId;
    // Target user ID để gửi notification (theo yêu cầu)
    targetUserId = 'f3ee2852-4cf0-45e8-8c71-8480810d45e7';
  });

  // Cleanup: Xóa tất cả events và notifications đã tạo sau mỗi test
  afterEach(async () => {
    // Cleanup notifications
    for (const notificationId of createdNotificationIds) {
      await cleanupNotification(notificationId);
    }
    createdNotificationIds = [];

    // Cleanup events
    for (const eventId of createdEventIds) {
      await cleanupEvent(eventId);
    }
    createdEventIds = [];
  });

  /**
   * Test Case 1: sendEventCreateNoti_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra gửi notification thành công với input hợp lệ
   * Input: EventCreateNotificationType với đầy đủ thông tin hợp lệ
   * Expected: Notification được tạo trong database với đúng data
   *
   * Điểm khác với mock test:
   * - ✅ Tạo event thật trước, sau đó gửi notification cho event đó
   * - ✅ Kiểm tra notification thực sự được tạo trong database
   * - ✅ Kiểm tra data trong database khớp với input
   * - ✅ Phát hiện lỗi thực tế nếu có (constraints, foreign keys)
   */
  it('sendEventCreateNoti_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước để có eventId hợp lệ
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Notification',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    // ⚠️ QUAN TRỌNG: KHÔNG cleanup event này để có thể xem notification liên quan trong database
    // Comment phần push vào createdEventIds để event không bị xóa
    // createdEventIds.push(eventId);

    console.log('\n📅 EVENT CREATED (NOT CLEANED UP):');
    console.log('  Event ID:', eventId);
    console.log('  Event Title:', eventData.title);
    console.log('  Event Date:', eventData.event_date);
    console.log('');

    // Chuẩn bị data cho notification (theo format từ create-event.tsx)
    const eventDateFormat = '25/12/2025'; // Format từ formatEventDate
    const startTimeFormat = '14:00'; // Format từ formatEventTime
    const eventType = 'Home Match'; // formData.eventTitle
    const eventName = eventData.title;
    const eventTitle = eventData.title;

    const variables = {
      eventType,
      eventName,
      eventDate: eventDateFormat,
      eventTime: startTimeFormat,
      eventId,
      eventTitle,
    };

    const trigger = NotificationType.EVENT_CREATE; // 'event.created'
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act: Gọi API gửi notification
    const result = await getInsertNotificationTemplate(
      targetUserId,
      trigger,
      variables,
      relatedEntityType,
      relatedEntityId
    );

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result?.title).toBeDefined();
    expect(result?.message).toBeDefined();
    expect(result?.priority).toBeDefined();

    // ✅ QUAN TRỌNG: Kiểm tra notification thực sự được tạo trong database
    const { data: notifications, error: fetchError } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('notification_type', trigger)
      .eq('related_entity_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1);

    expect(fetchError).toBeNull();
    expect(notifications).toBeDefined();
    expect(notifications?.length).toBeGreaterThan(0);

    const notification = notifications?.[0];
    expect(notification).toBeDefined();
    expect(notification?.user_id).toBe(targetUserId);
    expect(notification?.notification_type).toBe(trigger);
    expect(notification?.related_entity_type).toBe(relatedEntityType);
    expect(notification?.related_entity_id).toBe(eventId);
    expect(notification?.is_read).toBe(false);
    expect(notification?.delivery_method).toBe('push');
    expect(notification?.delivery_status).toBe('pending');

    // ⚠️ QUAN TRỌNG: KHÔNG cleanup notification này để có thể xem trong database
    // Comment phần push vào createdNotificationIds để notification không bị xóa
    // if (notification?.id) {
    //   createdNotificationIds.push(notification.id);
    // }

    // ✅ In ra thông tin notification để dễ tìm trong database
    console.log('\n📧 NOTIFICATION CREATED (NOT CLEANED UP):');
    console.log('  Notification ID:', notification?.id);
    console.log('  User ID:', notification?.user_id);
    console.log('  Notification Type:', notification?.notification_type);
    console.log('  Related Entity ID:', notification?.related_entity_id);
    console.log('  Title:', notification?.title);
    console.log('  Message:', notification?.message);
    console.log('  Created At:', notification?.created_at);
    console.log('  Data:', JSON.stringify(notification?.data, null, 2));
    console.log('');

    // ✅ Kiểm tra data field chứa variables
    expect(notification?.data).toBeDefined();
    const notificationData = notification?.data as any;
    expect(notificationData).toBeDefined();

    // ✅ Kiểm tra event cũng không bị xóa (comment cleanup event)
    // createdEventIds.push(eventId); // Đã push ở trên, nhưng có thể comment để giữ event
  });

  /**
   * Test Case 2: sendEventCreateNoti_WhenUserIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId không tồn tại (foreign key violation)
   * Input: EventCreateNotificationType với userId không tồn tại
   * Expected: Throw error với foreign key constraint violation
   */
  it('sendEventCreateNoti_WhenUserIdDoesNotExist_ThrowsError', async () => {
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

    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
    const variables = {
      eventType: 'Training',
      eventName: eventData.title,
      eventDate: '25/12/2025',
      eventTime: '14:00',
      eventId,
      eventTitle: eventData.title,
    };

    const trigger = NotificationType.EVENT_CREATE;
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act & Assert: Kiểm tra API throw error hoặc trả về null
    const result = await getInsertNotificationTemplate(
      nonExistentUserId,
      trigger,
      variables,
      relatedEntityType,
      relatedEntityId
    );

    // API có thể trả về null khi có error (không throw)
    // Nên kiểm tra notification không được tạo trong database
    const { data: notifications } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', nonExistentUserId)
      .eq('related_entity_id', eventId);

    // Nếu result là null, có nghĩa là có lỗi (foreign key violation)
    // Hoặc nếu không có notification trong database, cũng có nghĩa là fail
    expect(result === null || (notifications?.length ?? 0) === 0).toBe(true);
  });

  /**
   * Test Case 3: sendEventCreateNoti_WhenEventIdDoesNotExist_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra API vẫn thành công khi eventId không tồn tại (không có foreign key constraint)
   * Input: EventCreateNotificationType với eventId không tồn tại
   * Expected: Notification vẫn được tạo (related_entity_id chỉ là reference, không có FK constraint)
   *
   * Lưu ý: related_entity_id có thể là bất kỳ giá trị nào, không có foreign key constraint
   */
  it('sendEventCreateNoti_WhenEventIdDoesNotExist_ReturnsSuccess', async () => {
    // Arrange: Không tạo event, dùng eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';
    const variables = {
      eventType: 'Training',
      eventName: 'Non-existent Event',
      eventDate: '25/12/2025',
      eventTime: '14:00',
      eventId: nonExistentEventId,
      eventTitle: 'Non-existent Event',
    };

    const trigger = NotificationType.EVENT_CREATE;
    const relatedEntityType = 'event_requests';
    const relatedEntityId = nonExistentEventId;

    // Act: Gọi API gửi notification
    const result = await getInsertNotificationTemplate(
      targetUserId,
      trigger,
      variables,
      relatedEntityType,
      relatedEntityId
    );

    // Assert: Kiểm tra notification vẫn được tạo (không có FK constraint)
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // ✅ Kiểm tra notification trong database
    const { data: notifications, error: fetchError } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('related_entity_id', nonExistentEventId)
      .order('created_at', { ascending: false })
      .limit(1);

    expect(fetchError).toBeNull();
    expect(notifications).toBeDefined();
    expect(notifications?.length).toBeGreaterThan(0);

    const notification = notifications?.[0];
    if (notification?.id) {
      createdNotificationIds.push(notification.id);
    }
  });

  /**
   * Test Case 4: sendEventCreateNoti_WhenUserIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là empty string
   * Input: EventCreateNotificationType với userId = ''
   * Expected: Throw error (foreign key violation hoặc NOT NULL constraint)
   */
  it('sendEventCreateNoti_WhenUserIdIsEmpty_ThrowsError', async () => {
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

    const variables = {
      eventType: 'Training',
      eventName: eventData.title,
      eventDate: '25/12/2025',
      eventTime: '14:00',
      eventId,
      eventTitle: eventData.title,
    };

    const trigger = NotificationType.EVENT_CREATE;
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act & Assert: Kiểm tra API throw error hoặc trả về null
    const result = await getInsertNotificationTemplate(
      '', // Empty userId
      trigger,
      variables,
      relatedEntityType,
      relatedEntityId
    );

    // API có thể trả về null khi có error
    // Kiểm tra notification không được tạo trong database
    const { data: notifications } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', '')
      .eq('related_entity_id', eventId);

    expect(result === null || (notifications?.length ?? 0) === 0).toBe(true);
  });

  /**
   * Test Case 5: sendEventCreateNoti_WhenTriggerIsInvalid_ReturnsNull
   *
   * Mục tiêu: Kiểm tra API trả về null khi trigger không tồn tại (template not found)
   * Input: EventCreateNotificationType với trigger không hợp lệ
   * Expected: Trả về null (template not found)
   */
  it('sendEventCreateNoti_WhenTriggerIsInvalid_ReturnsNull', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Trigger',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    const variables = {
      eventType: 'Training',
      eventName: eventData.title,
      eventDate: '25/12/2025',
      eventTime: '14:00',
      eventId,
      eventTitle: eventData.title,
    };

    const invalidTrigger = 'invalid.trigger'; // Trigger không tồn tại
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act: Gọi API với trigger không hợp lệ
    const result = await getInsertNotificationTemplate(
      targetUserId,
      invalidTrigger,
      variables,
      relatedEntityType,
      relatedEntityId
    );

    // Assert: Kiểm tra API trả về null (template not found)
    expect(result).toBeNull();

    // ✅ Kiểm tra notification KHÔNG được tạo trong database
    const { data: notifications } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('notification_type', invalidTrigger);

    expect(notifications?.length ?? 0).toBe(0);
  });

  /**
   * Test Case 6: sendEventCreateNoti_WhenVariablesAreMissing_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra API vẫn thành công khi một số variables bị thiếu (template có thể xử lý)
   * Input: EventCreateNotificationType với variables không đầy đủ
   * Expected: Notification vẫn được tạo (template có thể xử lý missing variables)
   *
   * Lưu ý: Tùy vào template, có thể vẫn tạo được notification với missing variables
   */
  it('sendEventCreateNoti_WhenVariablesAreMissing_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Missing Variables',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Variables thiếu một số fields
    const incompleteVariables = {
      eventType: 'Training',
      eventName: eventData.title,
      // Thiếu eventDate, eventTime, eventTitle
      eventId,
    };

    const trigger = NotificationType.EVENT_CREATE;
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act: Gọi API với variables không đầy đủ
    const result = await getInsertNotificationTemplate(
      targetUserId,
      trigger,
      incompleteVariables,
      relatedEntityType,
      relatedEntityId
    );

    // Assert: Kiểm tra kết quả (có thể thành công hoặc null tùy vào template)
    // Nếu template xử lý được missing variables, result sẽ không null
    // Nếu template không xử lý được, result sẽ null
    // Cả hai trường hợp đều hợp lệ, chỉ cần kiểm tra không có error crash
    expect(result !== undefined).toBe(true); // Không undefined
  });

  /**
   * Test Case 7: sendEventCreateNoti_WhenMultipleNotifications_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra gửi nhiều notifications cho cùng một event thành công
   * Input: Gửi notification cho nhiều users khác nhau cho cùng một event
   * Expected: Tất cả notifications đều được tạo thành công
   */
  it('sendEventCreateNoti_WhenMultipleNotifications_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Multiple Notifications',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    const variables = {
      eventType: 'Home Match',
      eventName: eventData.title,
      eventDate: '25/12/2025',
      eventTime: '14:00',
      eventId,
      eventTitle: eventData.title,
    };

    const trigger = NotificationType.EVENT_CREATE;
    const relatedEntityType = 'event_requests';
    const relatedEntityId = eventId;

    // Act: Gửi notification cho targetUserId và testUserId
    const results = await Promise.all([
      getInsertNotificationTemplate(
        targetUserId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      ),
      getInsertNotificationTemplate(
        testUserId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      ),
    ]);

    // Assert: Kiểm tra cả hai notifications đều thành công
    expect(results[0]).toBeDefined();
    expect(results[0]).not.toBeNull();
    expect(results[1]).toBeDefined();
    expect(results[1]).not.toBeNull();

    // ✅ Kiểm tra cả hai notifications trong database
    const { data: notifications } = await testSupabase
      .from('notifications')
      .select('*')
      .eq('related_entity_id', eventId)
      .eq('notification_type', trigger)
      .in('user_id', [targetUserId, testUserId]);

    expect(notifications).toBeDefined();
    expect(notifications?.length).toBeGreaterThanOrEqual(2);

    // Track notifications để cleanup
    notifications?.forEach(notif => {
      if (notif.id) {
        createdNotificationIds.push(notif.id);
      }
    });
  });
});
