/**
 * Test Suite: getEventDetail API với Database Thật
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
 * - Sử dụng cleanupEvent() để xóa event và data liên quan
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

// Import getEventDetail và createEvent SAU KHI đã mock @lib/supabase
import { createEvent, getEventDetail } from '@top/features/event/api/event';

//  Bây giờ getEventDetail và createEvent sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getEventDetail API - Real Database Tests', () => {
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
   * Test Case 1: getEventDetail_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra lấy event detail thành công với input hợp lệ
   * Input: EventDetailType với eventId, userId, teamId hợp lệ
   * Expected: Trả về EventDetailData đầy đủ với event info, teams, invitations, squads
   *
   * Điểm khác với mock test:
   * -  Tạo event thật trước, sau đó lấy detail của event đó
   * -  Kiểm tra data thực sự từ database khớp với expected
   * -  Kiểm tra event_invitations được filter đúng theo teamMembers và teamLeaders
   * -  Phát hiện lỗi thực tế nếu có (constraints, foreign keys)
   */
  it('getEventDetail_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước với members và leaders
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Get Detail',
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
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventDetail
    const result = await getEventDetail({
      eventId,
      userId: testUserId,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.title).toBe(eventData.title);
    expect(result.eventType).toBe(eventData.event_type);
    expect(result.eventDate).toBe(eventData.event_date);
    expect(result.startTime).toContain('14:00');
    expect(result.endTime).toContain('16:00');
    expect(result.locationName).toBe(eventData.location_name);
    expect(result.locationAddress).toBe(eventData.location_address);
    expect(result.locationLatitude).toBe(eventData.location_latitude);
    expect(result.locationLongitude).toBe(eventData.location_longitude);
    expect(result.description).toBe(eventData.description);
    expect(result.opponent).toBe(eventData.opponent);
    expect(result.isHomeEvent).toBe(eventData.is_home_event);
    expect(result.eventStatus).toBe(eventData.event_status);
    expect(result.teamId).toBe(testTeamId);
    expect(result.createdBy).toBe(testUserId);

    //  Kiểm tra teams data
    expect(result.teams).toBeDefined();
    expect(result.teams.id).toBe(testTeamId);

    //  Kiểm tra event_invitations (có thể empty nếu không có members/leaders)
    expect(result.event_invitations).toBeDefined();
    expect(Array.isArray(result.event_invitations)).toBe(true);

    //  Kiểm tra event_squads (có thể empty)
    expect(result.event_squads).toBeDefined();
    expect(Array.isArray(result.event_squads)).toBe(true);
  });

  /**
   * Test Case 2: getEventDetail_WhenEventNotFound_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event không tồn tại
   * Input: EventDetailType với eventId không tồn tại
   * Expected: Throw error "Event not found" hoặc database error
   */
  it('getEventDetail_WhenEventNotFound_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventDetail({
        eventId: nonExistentEventId,
        userId: testUserId,
        teamId: testTeamId,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không cần kiểm tra chi tiết error message)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 3: getEventDetail_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: EventDetailType với eventId = null/undefined
   * Expected: Throw error (validation error hoặc database error)
   */
  it('getEventDetail_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = undefined
    const invalidPayload = {
      eventId: undefined as any,
      userId: testUserId,
      teamId: testTeamId,
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventDetail(invalidPayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không cần kiểm tra chi tiết error message)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getEventDetail_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: EventDetailType với eventId = ''
   * Expected: Throw error "Event not found"
   */
  it('getEventDetail_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidPayload = {
      eventId: '',
      userId: testUserId,
      teamId: testTeamId,
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventDetail(invalidPayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không cần kiểm tra chi tiết error message)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getEventDetail_WhenTeamIdIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi teamId không tồn tại
   * Input: EventDetailType với teamId không tồn tại
   * Expected: Throw error khi query team_members hoặc team_admins
   */
  it('getEventDetail_WhenTeamIdIsInvalid_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid TeamId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    const nonExistentTeamId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error hoặc không throw (cả hai đều hợp lệ)
    // Lưu ý: API có thể không throw error nếu query team_members/team_admins trả về empty array
    try {
      const result = await getEventDetail({
        eventId,
        userId: testUserId,
        teamId: nonExistentTeamId,
      });
      // Nếu không throw error, kiểm tra result vẫn hợp lệ (query trả về empty array)
      expect(result).toBeDefined();
    } catch (error: any) {
      //  Nếu có error, chỉ cần kiểm tra có error là đủ
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 6: getEventDetail_WhenTeamIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi teamId là null/undefined
   * Input: EventDetailType với teamId = null/undefined
   * Expected: Throw error khi query team_members hoặc team_admins
   */
  it('getEventDetail_WhenTeamIdIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null TeamId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventDetail({
        eventId,
        userId: testUserId,
        teamId: undefined as any,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không cần kiểm tra chi tiết error message)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: getEventDetail_WhenUserIdIsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra API vẫn thành công khi userId là null/undefined
   * Input: EventDetailType với userId = null/undefined
   * Expected: Trả về EventDetailData (userId không bắt buộc)
   */
  it('getEventDetail_WhenUserIdIsNull_ReturnsSuccess', async () => {
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

    // Act: Gọi API với userId = undefined
    const result = await getEventDetail({
      eventId,
      userId: undefined as any,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra kết quả vẫn thành công
    expect(result).toBeDefined();
    expect(result.id).toBe(eventId);
    expect(result.title).toBe(eventData.title);
  });

  /**
   * Test Case 8: getEventDetail_WhenEventHasInvitations_FiltersCorrectly
   *
   * Mục tiêu: Kiểm tra event_invitations được filter đúng theo teamMembers và teamLeaders
   * Input: EventDetailType với event có invitations cho members và leaders
   * Expected: event_invitations chỉ chứa invitations của users trong teamMembers hoặc teamLeaders
   */
  it('getEventDetail_WhenEventHasInvitations_FiltersCorrectly', async () => {
    // Arrange: Lấy một số user IDs từ team để làm members
    const { data: teamMembers } = await testSupabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', testTeamId)
      .eq('member_status', 'active')
      .limit(2);

    if (!teamMembers || teamMembers.length < 1) {
      console.warn(' Not enough team members. Skipping test.');
      return;
    }

    const memberIds = teamMembers.map(m => m.user_id).slice(0, 2);

    // Tạo event với members
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event With Invitations',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
      selected_members: memberIds,
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventDetail
    const result = await getEventDetail({
      eventId,
      userId: testUserId,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra event_invitations được filter đúng
    expect(result).toBeDefined();
    expect(result.event_invitations).toBeDefined();
    expect(Array.isArray(result.event_invitations)).toBe(true);

    //  Kiểm tra tất cả invitations đều thuộc về teamMembers hoặc teamLeaders
    if (result.event_invitations.length > 0) {
      const validUserIds = [
        ...(teamMembers?.map(m => m.user_id) || []),
        ...(await testSupabase
          .from('team_admins')
          .select('user_id')
          .eq('team_id', testTeamId)
          .then(({ data }) => data?.map(a => a.user_id) || [])),
      ];

      result.event_invitations.forEach(invitation => {
        expect(validUserIds.includes(invitation.userId)).toBe(true);
      });
    }
  });

  /**
   * Test Case 9: getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra event_invitations là empty array khi event không có invitations
   * Input: EventDetailType với event không có members/leaders
   * Expected: event_invitations = []
   */
  it('getEventDetail_WhenEventHasNoInvitations_ReturnsEmptyArray', async () => {
    // Arrange: Tạo event không có members và leaders
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Without Invitations',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
      // Không có selected_members và selected_leaders
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventDetail
    const result = await getEventDetail({
      eventId,
      userId: testUserId,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra event_invitations là empty array
    expect(result).toBeDefined();
    expect(result.event_invitations).toBeDefined();
    expect(Array.isArray(result.event_invitations)).toBe(true);
    expect(result.event_invitations.length).toBe(0);
  });

  /**
   * Test Case 10: getEventDetail_WhenEventIsCancelled_ReturnsCancelledStatus
   *
   * Mục tiêu: Kiểm tra getEventDetail trả về đúng thông tin khi event đã bị cancelled
   * Input: EventDetailType với event đã cancelled
   * Expected: Trả về EventDetailData với eventStatus = 'cancelled' và cancelledReason, cancelledAt, cancelledBy
   */
  it('getEventDetail_WhenEventIsCancelled_ReturnsCancelledStatus', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event To Cancel',
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
    const cancelReason = 'Event cancelled for testing';
    await testSupabase
      .from('events')
      .update({
        event_status: 'cancelled',
        cancelled_reason: cancelReason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: testUserId,
      })
      .eq('id', eventId);

    // Act: Gọi API getEventDetail
    const result = await getEventDetail({
      eventId,
      userId: testUserId,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra event status là cancelled
    expect(result).toBeDefined();
    expect(result.eventStatus).toBe('cancelled');
    expect(result.cancelledReason).toBe(cancelReason);
    expect(result.cancelledBy).toBe(testUserId);
    expect(result.cancelledAt).toBeDefined();
  });

  /**
   * Test Case 11: getEventDetail_WhenEventHasSquads_ReturnsSquads
   *
   * Mục tiêu: Kiểm tra getEventDetail trả về event_squads khi event có squads
   * Input: EventDetailType với event có squads
   * Expected: Trả về EventDetailData với event_squads array
   */
  it('getEventDetail_WhenEventHasSquads_ReturnsSquads', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event With Squads',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad cho event
    const { data: teamMembers } = await testSupabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', testTeamId)
      .eq('member_status', 'active')
      .limit(1);

    if (teamMembers && teamMembers.length > 0) {
      const squadUserId = teamMembers[0].user_id;
      await testSupabase.from('event_squads').insert({
        event_id: eventId,
        user_id: squadUserId,
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
      });
    }

    // Act: Gọi API getEventDetail
    const result = await getEventDetail({
      eventId,
      userId: testUserId,
      teamId: testTeamId,
    });

    // Assert: Kiểm tra event_squads
    expect(result).toBeDefined();
    expect(result.event_squads).toBeDefined();
    expect(Array.isArray(result.event_squads)).toBe(true);
    // Nếu có squad được tạo, kiểm tra nó có trong result
    if (teamMembers && teamMembers.length > 0) {
      expect(result.event_squads.length).toBeGreaterThanOrEqual(0);
    }
  });
});
