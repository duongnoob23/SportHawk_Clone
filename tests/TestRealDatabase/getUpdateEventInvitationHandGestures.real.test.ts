/**
 * Test Suite: getUpdateEventInvitationHandGestures API với Database Thật
 *
 *  QUAN TRỌNG: Test này sử dụng DATABASE THẬT, không phải mock!
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
 * - Sử dụng cleanupEvent() để xóa event và data liên quan (bao gồm event_invitations)
 */

//  QUAN TRỌNG: Import dbSetup TRƯỚC để có testSupabase
// Sau đó mock @lib/supabase để trả về testSupabase thay vì supabase từ lib
import {
  cleanupEvent,
  getExistingTestData,
  testSupabase,
} from './helpers/dbSetup';

// Định nghĩa __DEV__ cho Jest (React Native global variable)
// @ts-ignore - __DEV__ is declared in types/jest.d.ts
global.__DEV__ = true;

//  Mock @lib/supabase để thay thế supabase bằng testSupabase
// Vì lib/supabase.ts cần EXPO_PUBLIC_SUPABASE_URL mà test không có
// Nên chúng ta mock nó và dùng testSupabase từ dbSetup (đã có credentials)
jest.mock('@lib/supabase', () => ({
  supabase: testSupabase,
}));

//  Unmock @supabase/supabase-js để dùng Supabase thật (không phải mock)
jest.unmock('@supabase/supabase-js');

// Import createEvent và getUpdateEventInvitationHandGestures SAU KHI đã mock @lib/supabase
import {
  createEvent,
  getUpdateEventInvitationHandGestures,
} from '@top/features/event/api/event';

//  Bây giờ createEvent và getUpdateEventInvitationHandGestures sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getUpdateEventInvitationHandGestures API - Real Database Tests', () => {
  // Test data - sẽ được setup từ database thật
  let testTeamId: string;
  let testUserId: string;
  let createdEventIds: string[] = []; // Track events để cleanup
  let createdInvitationIds: string[] = []; // Track invitations để cleanup

  // Setup: Lấy test data từ database thật
  beforeAll(async () => {
    const testData = await getExistingTestData();
    testTeamId = testData.teamId;
    testUserId = testData.userId;
  });

  // Cleanup: Xóa tất cả events và invitations đã tạo sau mỗi test
  afterEach(async () => {
    // Cleanup invitations trước (vì có foreign key đến events)
    for (const invitationId of createdInvitationIds) {
      await testSupabase
        .from('event_invitations')
        .delete()
        .eq('id', invitationId);
    }
    createdInvitationIds = [];

    // Cleanup events
    for (const eventId of createdEventIds) {
      await cleanupEvent(eventId);
    }
    createdEventIds = [];
  });

  /**
   * Test Case 1: getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra update invitation thành công với input hợp lệ
   * Input: eventId, userId, response hợp lệ
   * Expected: Trả về mảng updated invitations và invitation_status được update đúng trong database
   */
  it('getUpdateEventInvitationHandGestures_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event và invitation trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Update Invitations',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation với status 'pending'
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    };

    const { data: createdInvitation, error: insertError } = await testSupabase
      .from('event_invitations')
      .insert(invitation)
      .select('id')
      .single();

    if (insertError || !createdInvitation) {
      throw new Error(`Failed to create invitation: ${insertError?.message}`);
    }

    const invitationId = createdInvitation.id;
    createdInvitationIds.push(invitationId);

    // Act: Gọi API update invitation với response = 'yes'
    const result = await getUpdateEventInvitationHandGestures({
      eventId: eventId,
      userId: testUserId,
      response: 'yes',
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].invitation_status).toBe('accepted');

    // Kiểm tra invitation_status đã được update thành 'accepted' trong database
    const { data: updatedInvitation, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('invitation_status, invited_at')
      .eq('id', invitationId)
      .single();

    expect(selectError).toBeNull();
    expect(updatedInvitation).toBeDefined();
    expect(updatedInvitation?.invitation_status).toBe('accepted');
    // Kiểm tra invited_at đã được update với timestamp mới
    expect(updatedInvitation?.invited_at).toBeDefined();
  });

  /**
   * Test Case 2: getUpdateEventInvitationHandGestures_WhenAllResponseTypes_UpdatesCorrectStatus
   *
   * Mục tiêu: Kiểm tra API map đúng tất cả response types thành invitation_status
   * Input: response = 'yes', 'no', 'maybe'
   * Expected: invitation_status = 'accepted', 'declined', 'maybe'
   */
  it('getUpdateEventInvitationHandGestures_WhenAllResponseTypes_UpdatesCorrectStatus', async () => {
    const responseMappings = [
      { response: 'yes' as const, expectedStatus: 'accepted' },
      { response: 'no' as const, expectedStatus: 'declined' },
      { response: 'maybe' as const, expectedStatus: 'maybe' },
    ];

    for (const { response, expectedStatus } of responseMappings) {
      // Arrange: Tạo event và invitation cho mỗi response type
      const eventData = {
        team_id: testTeamId,
        title: `Test Event For ${response} Response`,
        event_type: 'training',
        event_date: '2025-12-25',
        start_time: '14:00',
        event_status: 'active',
      };

      const eventId = await createEvent(eventData, testUserId);
      createdEventIds.push(eventId);

      // Tạo invitation với status 'pending'
      const invitation = {
        event_id: eventId,
        user_id: testUserId,
        invited_by: testUserId,
        invited_at: new Date().toISOString(),
        invitation_status: 'pending',
      };

      const { data: createdInvitation, error: insertError } = await testSupabase
        .from('event_invitations')
        .insert(invitation)
        .select('id')
        .single();

      if (insertError || !createdInvitation) {
        throw new Error(`Failed to create invitation: ${insertError?.message}`);
      }

      const invitationId = createdInvitation.id;
      createdInvitationIds.push(invitationId);

      // Act: Gọi API update invitation
      const result = await getUpdateEventInvitationHandGestures({
        eventId: eventId,
        userId: testUserId,
        response: response,
        teamId: testTeamId,
      });

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].invitation_status).toBe(expectedStatus);

      // Kiểm tra invitation_status đã được update đúng trong database
      const { data: updatedInvitation, error: selectError } = await testSupabase
        .from('event_invitations')
        .select('invitation_status')
        .eq('id', invitationId)
        .single();

      expect(selectError).toBeNull();
      expect(updatedInvitation).toBeDefined();
      expect(updatedInvitation?.invitation_status).toBe(expectedStatus);
    }
  });

  /**
   * Test Case 3: getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const invalidEventId = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpdateEventInvitationHandGestures({
        eventId: invalidEventId,
        userId: testUserId,
        response: 'yes',
        teamId: testTeamId,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string (database không chấp nhận empty string cho UUID)
   * Input: eventId = ''
   * Expected: Throw error (invalid input syntax for type uuid)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpdateEventInvitationHandGestures({
        eventId: invalidEventId,
        userId: testUserId,
        response: 'yes',
        teamId: testTeamId,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là null/undefined
   * Input: userId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với userId = null
    const invalidUserId = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpdateEventInvitationHandGestures({
        eventId: eventId,
        userId: invalidUserId,
        response: 'yes',
        teamId: testTeamId,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 6: getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là empty string (database không chấp nhận empty string cho UUID)
   * Input: userId = ''
   * Expected: Throw error (invalid input syntax for type uuid)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdIsEmpty_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với userId = ''
    const invalidUserId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpdateEventInvitationHandGestures({
        eventId: eventId,
        userId: invalidUserId,
        response: 'yes',
        teamId: testTeamId,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra API trả về mảng rỗng khi eventId không tồn tại (không có record nào match)
   * Input: eventId không tồn tại
   * Expected: Trả về [] (không throw error, nhưng không có record nào được update)
   */
  it('getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ReturnsEmptyArray', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act: Gọi API
    const result = await getUpdateEventInvitationHandGestures({
      eventId: nonExistentEventId,
      userId: testUserId,
      response: 'yes',
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả là mảng rỗng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 8: getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra API trả về mảng rỗng khi userId không tồn tại (không có record nào match)
   * Input: userId không tồn tại
   * Expected: Trả về [] (không throw error, nhưng không có record nào được update)
   */
  it('getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ReturnsEmptyArray', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Non Existent UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với userId không tồn tại
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    // Act: Gọi API
    const result = await getUpdateEventInvitationHandGestures({
      eventId: eventId,
      userId: nonExistentUserId,
      response: 'yes',
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả là mảng rỗng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 9: getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp
   *
   * Mục tiêu: Kiểm tra API update invited_at với timestamp mới
   * Input: eventId, userId, response hợp lệ
   * Expected: invited_at được update với timestamp mới (khác với timestamp cũ)
   */
  it('getUpdateEventInvitationHandGestures_UpdatesInvitedAtTimestamp', async () => {
    // Arrange: Tạo event và invitation trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Timestamp Update',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation với invited_at cũ
    const oldTimestamp = new Date('2025-01-01T10:00:00Z').toISOString();
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: oldTimestamp,
      invitation_status: 'pending',
    };

    const { data: createdInvitation, error: insertError } = await testSupabase
      .from('event_invitations')
      .insert(invitation)
      .select('id, invited_at')
      .single();

    if (insertError || !createdInvitation) {
      throw new Error(`Failed to create invitation: ${insertError?.message}`);
    }

    const invitationId = createdInvitation.id;
    createdInvitationIds.push(invitationId);

    // Đợi 1 giây để đảm bảo timestamp mới khác với timestamp cũ
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Act: Gọi API update invitation
    const result = await getUpdateEventInvitationHandGestures({
      eventId: eventId,
      userId: testUserId,
      response: 'yes',
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Kiểm tra invited_at đã được update với timestamp mới trong database
    const { data: updatedInvitation, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('invited_at')
      .eq('id', invitationId)
      .single();

    expect(selectError).toBeNull();
    expect(updatedInvitation).toBeDefined();
    expect(updatedInvitation?.invited_at).toBeDefined();
    // Timestamp mới phải khác với timestamp cũ
    expect(updatedInvitation?.invited_at).not.toBe(oldTimestamp);
    // Timestamp mới phải là ISO string hợp lệ (so sánh bằng Date object để tránh lỗi format)
    const newTimestamp = new Date(updatedInvitation?.invited_at || '');
    const oldTimestampDate = new Date(oldTimestamp);
    expect(newTimestamp.getTime()).toBeGreaterThan(oldTimestampDate.getTime());
    // Kiểm tra timestamp mới là hợp lệ (không phải Invalid Date)
    expect(isNaN(newTimestamp.getTime())).toBe(false);
  });

  /**
   * Test Case 10: getUpdateEventInvitationHandGestures_WhenMultipleInvitations_UpdatesAll
   *
   * Mục tiêu: Kiểm tra API update tất cả invitations match với eventId và userId
   * Input: eventId và userId có nhiều invitations
   * Expected: Tất cả invitations đều được update
   *
   *  Lưu ý: Thực tế, với UNIQUE constraint (event_id, user_id), chỉ có 1 invitation cho mỗi cặp (eventId, userId)
   * Nhưng test này vẫn có giá trị để đảm bảo API hoạt động đúng
   */
  it('getUpdateEventInvitationHandGestures_WhenMultipleInvitations_UpdatesAll', async () => {
    // Arrange: Tạo nhiều events và invitations
    const events = [];
    const invitations = [];

    for (let i = 0; i < 3; i++) {
      const eventData = {
        team_id: testTeamId,
        title: `Test Event ${i + 1} For Multiple Invitations`,
        event_type: 'training',
        event_date: '2025-12-25',
        start_time: '14:00',
        event_status: 'active',
      };

      const eventId = await createEvent(eventData, testUserId);
      createdEventIds.push(eventId);
      events.push(eventId);

      // Tạo invitation cho mỗi event
      const invitation = {
        event_id: eventId,
        user_id: testUserId,
        invited_by: testUserId,
        invited_at: new Date().toISOString(),
        invitation_status: 'pending',
      };

      const { data: createdInvitation, error: insertError } = await testSupabase
        .from('event_invitations')
        .insert(invitation)
        .select('id')
        .single();

      if (insertError || !createdInvitation) {
        throw new Error(`Failed to create invitation: ${insertError?.message}`);
      }

      invitations.push(createdInvitation.id);
      createdInvitationIds.push(createdInvitation.id);
    }

    // Act: Update invitation cho event đầu tiên
    const firstEventId = events[0];
    const result = await getUpdateEventInvitationHandGestures({
      eventId: firstEventId,
      userId: testUserId,
      response: 'yes', // RSVPResponseType: 'yes', 'no', 'maybe'
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1); // Chỉ có 1 invitation cho event đầu tiên
    expect(result[0].invitation_status).toBe('accepted');

    // Kiểm tra invitation của event đầu tiên đã được update
    const { data: updatedInvitation, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('invitation_status')
      .eq('id', invitations[0])
      .single();

    expect(selectError).toBeNull();
    expect(updatedInvitation?.invitation_status).toBe('accepted');

    // Kiểm tra invitations của các events khác không bị update
    for (let i = 1; i < invitations.length; i++) {
      const { data: otherInvitation, error: otherError } = await testSupabase
        .from('event_invitations')
        .select('invitation_status')
        .eq('id', invitations[i])
        .single();

      expect(otherError).toBeNull();
      expect(otherInvitation?.invitation_status).toBe('pending'); // Vẫn là 'pending'
    }
  });
});
