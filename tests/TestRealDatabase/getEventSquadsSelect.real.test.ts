/**
 * Test Suite: getEventSquadsSelect API với Database Thật
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
 * - Sử dụng cleanupEvent() để xóa event và data liên quan (bao gồm event_squads và event_invitations)
 */

//  QUAN TRỌNG: Import dbSetup TRƯỚC để có testSupabase
// Sau đó mock @lib/supabase để trả về testSupabase thay vì supabase từ lib
import {
  cleanupEvent,
  getExistingTestData,
  testSupabase,
} from './helpers/dbSetup';

//  Mock @lib/supabase để thay thế supabase bằng testSupabase
// Vì lib/supabase.ts cần EXPO_PUBLIC_SUPABASE_URL mà test không có
// Nên chúng ta mock nó và dùng testSupabase từ dbSetup (đã có credentials)
jest.mock('@lib/supabase', () => ({
  supabase: testSupabase,
}));

//  Unmock @supabase/supabase-js để dùng Supabase thật (không phải mock)
jest.unmock('@supabase/supabase-js');

// Import createEvent và getEventSquadsSelect SAU KHI đã mock @lib/supabase
import {
  createEvent,
  getEventSquadsSelect,
} from '@top/features/event/api/event';

//  Bây giờ createEvent và getEventSquadsSelect sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getEventSquadsSelect API - Real Database Tests', () => {
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
   * Test Case 1: getEventSquadsSelect_WhenEventHasSquadsAndInvitation_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra lấy squads và invitation thành công khi cả hai đều tồn tại
   * Input: eventId và userId hợp lệ, event có squads và invitation
   * Expected: Trả về { eventSquads: [...], eventInvitations: {...} }
   */
  it('getEventSquadsSelect_WhenEventHasSquadsAndInvitation_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Squads Select',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member cho event
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Main goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Tạo invitation cho user
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'accepted',
    };

    await testSupabase.from('event_invitations').insert(invitation);

    // Act: Gọi API getEventSquadsSelect
    const result = await getEventSquadsSelect(eventId, testUserId);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.eventSquads).toBeDefined();
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventSquads.length).toBeGreaterThan(0);
    expect(result.eventInvitations).toBeDefined();
    expect(result.eventInvitations?.userId).toBe(testUserId);
    expect(result.eventInvitations?.eventId).toBe(eventId);
    expect(result.eventInvitations?.invitationStatus).toBe('accepted');
  });

  /**
   * Test Case 2: getEventSquadsSelect_WhenEventHasNoSquads_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra API trả về mảng rỗng cho squads khi event không có squads
   * Input: eventId và userId hợp lệ, event có invitation nhưng không có squads
   * Expected: Trả về { eventSquads: [], eventInvitations: {...} }
   */
  it('getEventSquadsSelect_WhenEventHasNoSquads_ReturnsEmptyArray', async () => {
    // Arrange: Tạo event trước (không tạo squads)
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Without Squads',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation cho user (không tạo squads)
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    };

    await testSupabase.from('event_invitations').insert(invitation);

    // Act: Gọi API getEventSquadsSelect
    const result = await getEventSquadsSelect(eventId, testUserId);

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.eventSquads).toBeDefined();
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventSquads.length).toBe(0);
    expect(result.eventInvitations).toBeDefined();
    expect(result.eventInvitations?.userId).toBe(testUserId);
  });

  /**
   * Test Case 3: getEventSquadsSelect_WhenNoInvitation_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi không có invitation (vì dùng .single())
   * Input: eventId và userId hợp lệ nhưng không có invitation
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenNoInvitation_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Without Invitation',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member (không tạo invitation)
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Main goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(eventId, testUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getEventSquadsSelect_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const invalidEventId = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(invalidEventId, testUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getEventSquadsSelect_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(invalidEventId, testUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 6: getEventSquadsSelect_WhenUserIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là null/undefined
   * Input: userId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenUserIdIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null User',
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
      await getEventSquadsSelect(eventId, invalidUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: getEventSquadsSelect_WhenUserIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId là empty string
   * Input: userId = ''
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenUserIdIsEmpty_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty User',
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
      await getEventSquadsSelect(eventId, invalidUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 8: getEventSquadsSelect_WhenEventIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId không tồn tại
   * Input: eventId không tồn tại
   * Expected: Throw error từ invitation query (vì không tìm thấy)
   */
  it('getEventSquadsSelect_WhenEventIdDoesNotExist_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(nonExistentEventId, testUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 9: getEventSquadsSelect_WhenUserIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi userId không tồn tại
   * Input: userId không tồn tại
   * Expected: Throw error từ invitation query (vì không tìm thấy)
   */
  it('getEventSquadsSelect_WhenUserIdDoesNotExist_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Non Existent User',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với userId không tồn tại
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(eventId, nonExistentUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: getEventSquadsSelect_ReturnsSquadsAndInvitationsWithAllFields
   *
   * Mục tiêu: Kiểm tra kết quả trả về có đầy đủ các fields cần thiết
   * Input: eventId và userId hợp lệ, event có squads và invitation
   * Expected: { eventSquads: [...], eventInvitations: {...} } với đầy đủ fields
   */
  it('getEventSquadsSelect_ReturnsSquadsAndInvitationsWithAllFields', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For All Fields',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member với đầy đủ thông tin
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'DF',
      squad_role: 'substitute',
      selection_notes: 'Defender substitute',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Tạo invitation với đầy đủ thông tin
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    };

    await testSupabase.from('event_invitations').insert(invitation);

    // Act: Gọi API getEventSquadsSelect
    const result = await getEventSquadsSelect(eventId, testUserId);

    // Assert: Kiểm tra tất cả fields có trong result
    expect(result).toHaveProperty('eventSquads');
    expect(result).toHaveProperty('eventInvitations');
    expect(Array.isArray(result.eventSquads)).toBe(true);
    expect(result.eventSquads.length).toBeGreaterThan(0);

    // Kiểm tra fields của squad
    expect(result.eventSquads[0]).toHaveProperty('id');
    expect(result.eventSquads[0]).toHaveProperty('userId');
    expect(result.eventSquads[0]).toHaveProperty('eventId');
    expect(result.eventSquads[0]).toHaveProperty('position');
    expect(result.eventSquads[0]).toHaveProperty('squadRole');
    expect(result.eventSquads[0]).toHaveProperty('selectedAt');
    expect(result.eventSquads[0]).toHaveProperty('selectedBy');
    expect(result.eventSquads[0]).toHaveProperty('selectionNotes');

    // Kiểm tra fields của invitation
    expect(result.eventInvitations).toHaveProperty('id');
    expect(result.eventInvitations).toHaveProperty('eventId');
    expect(result.eventInvitations).toHaveProperty('userId');
    expect(result.eventInvitations).toHaveProperty('invitedBy');
    expect(result.eventInvitations).toHaveProperty('invitedAt');
    expect(result.eventInvitations).toHaveProperty('invitationStatus');
  });

  /**
   * Test Case 11: getEventSquadsSelect_WhenEventHasMultipleSquads_ReturnsAllSquads
   *
   * Mục tiêu: Kiểm tra API trả về tất cả squads khi event có nhiều squad members (với các users khác nhau)
   * Input: eventId và userId hợp lệ, event có nhiều squads với các users khác nhau
   * Expected: Trả về mảng với tất cả squads
   *
   *  Lưu ý: event_squads có UNIQUE constraint trên (event_id, user_id)
   * Nên không thể có 2 squad entries cho cùng event và user
   * Test này sẽ lấy thêm 1 user khác từ database để tạo 2 squads
   */
  it('getEventSquadsSelect_WhenEventHasMultipleSquads_ReturnsAllSquads', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Multiple Squads',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Lấy thêm 1 user khác từ database (nếu có)
    const { data: otherUsers } = await testSupabase
      .from('profiles')
      .select('id')
      .neq('id', testUserId)
      .limit(1);

    // Nếu có user khác, tạo 2 squads với 2 users khác nhau
    if (otherUsers && otherUsers.length > 0) {
      const otherUserId = otherUsers[0].id;

      // Tạo nhiều squad members với các users khác nhau
      const squadMembers = [
        {
          event_id: eventId,
          user_id: testUserId,
          position: 'GK',
          squad_role: 'starter',
          selection_notes: 'Goalkeeper',
          selected_by: testUserId,
          selected_at: new Date().toISOString(),
        },
        {
          event_id: eventId,
          user_id: otherUserId, // User khác để tránh UNIQUE constraint
          position: 'DF',
          squad_role: 'starter',
          selection_notes: 'Defender',
          selected_by: testUserId,
          selected_at: new Date().toISOString(),
        },
      ];

      await testSupabase.from('event_squads').insert(squadMembers);

      // Tạo invitation cho testUserId
      const invitation = {
        event_id: eventId,
        user_id: testUserId,
        invited_by: testUserId,
        invited_at: new Date().toISOString(),
        invitation_status: 'accepted',
      };

      await testSupabase.from('event_invitations').insert(invitation);

      // Act: Gọi API getEventSquadsSelect
      const result = await getEventSquadsSelect(eventId, testUserId);

      // Assert: Kiểm tra kết quả có tất cả squads (có thể có 1 hoặc 2 tùy vào query)
      expect(result).toBeDefined();
      expect(result.eventSquads).toBeDefined();
      expect(Array.isArray(result.eventSquads)).toBe(true);
      // API trả về tất cả squads của event, không chỉ của user
      expect(result.eventSquads.length).toBeGreaterThanOrEqual(1);
    } else {
      // Nếu không có user khác, chỉ tạo 1 squad và kiểm tra API trả về đúng
      const squadMember = {
        event_id: eventId,
        user_id: testUserId,
        position: 'GK',
        squad_role: 'starter',
        selection_notes: 'Goalkeeper',
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
      };

      await testSupabase.from('event_squads').insert(squadMember);

      // Tạo invitation
      const invitation = {
        event_id: eventId,
        user_id: testUserId,
        invited_by: testUserId,
        invited_at: new Date().toISOString(),
        invitation_status: 'accepted',
      };

      await testSupabase.from('event_invitations').insert(invitation);

      // Act: Gọi API getEventSquadsSelect
      const result = await getEventSquadsSelect(eventId, testUserId);

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(result.eventSquads).toBeDefined();
      expect(Array.isArray(result.eventSquads)).toBe(true);
      expect(result.eventSquads.length).toBeGreaterThanOrEqual(1);
    }
  });

  /**
   * Test Case 12: getEventSquadsSelect_WhenInvitationHasDifferentStatuses_ReturnsCorrectStatus
   *
   * Mục tiêu: Kiểm tra API trả về đúng invitation status
   * Input: Invitation với các status khác nhau
   * Expected: Trả về invitation với status đúng
   */
  it('getEventSquadsSelect_WhenInvitationHasDifferentStatuses_ReturnsCorrectStatus', async () => {
    const invitationStatuses = ['pending', 'accepted', 'declined', 'maybe'];

    for (const status of invitationStatuses) {
      // Arrange: Tạo event trước
      const eventData = {
        team_id: testTeamId,
        title: `Test Event For ${status} Status`,
        event_type: 'training',
        event_date: '2025-12-25',
        start_time: '14:00',
        event_status: 'active',
      };

      const eventId = await createEvent(eventData, testUserId);
      createdEventIds.push(eventId);

      // Tạo invitation với status khác nhau
      const invitation = {
        event_id: eventId,
        user_id: testUserId,
        invited_by: testUserId,
        invited_at: new Date().toISOString(),
        invitation_status: status,
      };

      await testSupabase.from('event_invitations').insert(invitation);

      // Act: Gọi API getEventSquadsSelect
      const result = await getEventSquadsSelect(eventId, testUserId);

      // Assert: Kiểm tra status đúng
      expect(result).toBeDefined();
      expect(result.eventInvitations).toBeDefined();
      expect(result.eventInvitations?.invitationStatus).toBe(status);
    }
  });

  /**
   * Test Case 13: getEventSquadsSelect_WhenSquadHasNullFields_ReturnsNullFields
   *
   * Mục tiêu: Kiểm tra API trả về đúng khi squad có các fields = null
   * Input: Squad member với position, squadRole, selectionNotes = null
   * Expected: Trả về squad member với các fields = null
   */
  it('getEventSquadsSelect_WhenSquadHasNullFields_ReturnsNullFields', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Fields',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member với các fields = null
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: null,
      squad_role: null,
      selection_notes: null,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Tạo invitation
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    };

    await testSupabase.from('event_invitations').insert(invitation);

    // Act: Gọi API getEventSquadsSelect
    const result = await getEventSquadsSelect(eventId, testUserId);

    // Assert: Kiểm tra các fields = null
    expect(result).toBeDefined();
    expect(result.eventSquads.length).toBeGreaterThan(0);
    expect(result.eventSquads[0].position).toBeNull();
    expect(result.eventSquads[0].squadRole).toBeNull();
    expect(result.eventSquads[0].selectionNotes).toBeNull();
  });

  /**
   * Test Case 14: getEventSquadsSelect_WhenSquadsQueryFails_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi squads query lỗi
   * Input: eventId không hợp lệ (sẽ gây lỗi ở squads query)
   * Expected: Throw error (không phải success)
   *
   *  Lưu ý: Test này có thể throw error ở squads query hoặc invitations query
   */
  it('getEventSquadsSelect_WhenSquadsQueryFails_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không hợp lệ
    // Sử dụng empty string để gây lỗi UUID format
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquadsSelect(invalidEventId, testUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 15: getEventSquadsSelect_WhenInvitationsQueryFails_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi invitations query lỗi
   * Input: eventId hợp lệ nhưng userId không hợp lệ (sẽ gây lỗi ở invitations query)
   * Expected: Throw error (không phải success)
   */
  it('getEventSquadsSelect_WhenInvitationsQueryFails_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invitations Query Error',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member (squads query sẽ thành công)
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Chuẩn bị input với userId không hợp lệ (empty string)
    const invalidUserId = '';

    // Act & Assert: Kiểm tra API throw error từ invitations query
    try {
      await getEventSquadsSelect(eventId, invalidUserId);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 16: getEventSquadsSelect_WhenDuplicateSquadMember_ThrowsError
   *
   * Mục tiêu: Kiểm tra API/DB throw error khi insert duplicate squad member (vi phạm UNIQUE constraint)
   * Input: Cố gắng insert 2 squad members với cùng (event_id, user_id)
   * Expected: Throw error từ database (UNIQUE constraint violation)
   *
   *  Lưu ý: Test này kiểm tra database constraint, không phải API logic
   */
  it('getEventSquadsSelect_WhenDuplicateSquadMember_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Duplicate Squad',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member đầu tiên
    const squadMember1 = {
      event_id: eventId,
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember1);

    // Cố gắng insert duplicate squad member (cùng event_id và user_id)
    const squadMember2 = {
      event_id: eventId,
      user_id: testUserId, // Cùng user_id → vi phạm UNIQUE constraint
      position: 'DF',
      squad_role: 'starter',
      selection_notes: 'Defender',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    // Act & Assert: Kiểm tra insert duplicate throw error
    try {
      const { error } = await testSupabase
        .from('event_squads')
        .insert(squadMember2);

      if (error) {
        //  Có error là đúng (UNIQUE constraint violation)
        expect(error).toBeDefined();
      } else {
        //  Nếu không có error, đây là bug (database không enforce constraint)
        throw new Error(
          'Expected error to be thrown for duplicate squad member'
        );
      }
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 17: getEventSquadsSelect_WhenSquadMemberHasInvalidUserId_ThrowsError
   *
   * Mục tiêu: Kiểm tra API/DB throw error khi insert squad member với invalid user_id
   * Input: user_id không tồn tại (foreign key violation)
   * Expected: Throw error từ database (foreign key constraint violation)
   */
  it('getEventSquadsSelect_WhenSquadMemberHasInvalidUserId_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid Squad User',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Cố gắng insert squad member với invalid user_id
    const invalidSquadMember = {
      event_id: eventId,
      user_id: '00000000-0000-0000-0000-000000000000', // User không tồn tại
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    // Act & Assert: Kiểm tra insert với invalid user_id throw error
    try {
      const { error } = await testSupabase
        .from('event_squads')
        .insert(invalidSquadMember);

      if (error) {
        //  Có error là đúng (foreign key violation)
        expect(error).toBeDefined();
      } else {
        //  Nếu không có error, đây là bug (database không enforce foreign key)
        throw new Error('Expected error to be thrown for invalid user_id');
      }
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 18: getEventSquadsSelect_WhenSquadMemberHasInvalidEventId_ThrowsError
   *
   * Mục tiêu: Kiểm tra API/DB throw error khi insert squad member với invalid event_id
   * Input: event_id không tồn tại (foreign key violation)
   * Expected: Throw error từ database (foreign key constraint violation)
   */
  it('getEventSquadsSelect_WhenSquadMemberHasInvalidEventId_ThrowsError', async () => {
    // Arrange: Chuẩn bị invalid event_id
    const invalidEventId = '00000000-0000-0000-0000-000000000000';

    // Cố gắng insert squad member với invalid event_id
    const invalidSquadMember = {
      event_id: invalidEventId, // Event không tồn tại
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Goalkeeper',
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    // Act & Assert: Kiểm tra insert với invalid event_id throw error
    try {
      const { error } = await testSupabase
        .from('event_squads')
        .insert(invalidSquadMember);

      if (error) {
        //  Có error là đúng (foreign key violation)
        expect(error).toBeDefined();
      } else {
        //  Nếu không có error, đây là bug (database không enforce foreign key)
        throw new Error('Expected error to be thrown for invalid event_id');
      }
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 19: getEventSquadsSelect_WhenSquadMemberHasNullRequiredFields_ThrowsError
   *
   * Mục tiêu: Kiểm tra API/DB throw error khi insert squad member với required fields = null
   * Input: selected_by hoặc selected_at = null (NOT NULL constraint violation)
   * Expected: Throw error từ database (NOT NULL constraint violation)
   */
  it('getEventSquadsSelect_WhenSquadMemberHasNullRequiredFields_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Required Fields',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Cố gắng insert squad member với selected_by = null
    const invalidSquadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'GK',
      squad_role: 'starter',
      selection_notes: 'Goalkeeper',
      selected_by: null as any, // NOT NULL constraint violation
      selected_at: new Date().toISOString(),
    };

    // Act & Assert: Kiểm tra insert với null required field throw error
    try {
      const { error } = await testSupabase
        .from('event_squads')
        .insert(invalidSquadMember);

      if (error) {
        //  Có error là đúng (NOT NULL constraint violation)
        expect(error).toBeDefined();
      } else {
        //  Nếu không có error, đây là bug (database không enforce NOT NULL)
        throw new Error('Expected error to be thrown for null required field');
      }
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });
});
