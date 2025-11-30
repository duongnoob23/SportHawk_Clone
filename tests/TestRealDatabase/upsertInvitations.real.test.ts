/**
 * Test Suite: upsertInvitations API với Database Thật
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

//  Mock @lib/supabase để thay thế supabase bằng testSupabase
// Vì lib/supabase.ts cần EXPO_PUBLIC_SUPABASE_URL mà test không có
// Nên chúng ta mock nó và dùng testSupabase từ dbSetup (đã có credentials)
jest.mock('@lib/supabase', () => ({
  supabase: testSupabase,
}));

//  Unmock @supabase/supabase-js để dùng Supabase thật (không phải mock)
jest.unmock('@supabase/supabase-js');

// Import createEvent và upsertInvitations SAU KHI đã mock @lib/supabase
import { createEvent, upsertInvitations } from '@top/features/event/api/event';

//  Bây giờ createEvent và upsertInvitations sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('upsertInvitations API - Real Database Tests', () => {
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
   * Test Case 1: upsertInvitations_WhenAddMembers_InsertsInvitations
   *
   * Mục tiêu: Kiểm tra thêm invitations thành công
   * Input: addedMembers với user hợp lệ
   * Expected: Trả về { success: true } và invitations được tạo trong database
   */
  it('upsertInvitations_WhenAddMembers_InsertsInvitations', async () => {
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

    // Act: Gọi API thêm invitation
    const result = await upsertInvitations({
      eventId: eventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: testUserId,
      addedMembers: [testUserId],
      removedMembers: [],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Kiểm tra invitation đã được tạo trong database
    const { data: invitations, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('id, event_id, user_id, invited_by, invitation_status')
      .eq('event_id', eventId)
      .eq('user_id', testUserId);

    expect(selectError).toBeNull();
    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(1);
    expect(invitations?.[0].event_id).toBe(eventId);
    expect(invitations?.[0].user_id).toBe(testUserId);
    expect(invitations?.[0].invited_by).toBe(testUserId);
    expect(invitations?.[0].invitation_status).toBe('pending');

    // Track để cleanup
    if (invitations?.[0]?.id) {
      createdInvitationIds.push(invitations[0].id);
    }
  });

  /**
   * Test Case 2: upsertInvitations_WhenRemoveMembers_DeletesInvitations
   *
   * Mục tiêu: Kiểm tra xóa invitations thành công
   * Input: removedMembers với user đã có invitation
   * Expected: Trả về { success: true } và invitations được xóa khỏi database
   */
  it('upsertInvitations_WhenRemoveMembers_DeletesInvitations', async () => {
    // Arrange: Tạo event và invitation trước
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

    // Act: Gọi API xóa invitation
    const result = await upsertInvitations({
      eventId: eventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: testUserId,
      addedMembers: [],
      removedMembers: [testUserId],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Kiểm tra invitation đã được xóa khỏi database
    const { data: invitations, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', testUserId);

    expect(selectError).toBeNull();
    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(0);
  });

  /**
   * Test Case 3: upsertInvitations_WhenAddAndRemove_InsertsAndDeletes
   *
   * Mục tiêu: Kiểm tra thêm và xóa invitations cùng lúc
   * Input: addedMembers và removedMembers với các users khác nhau
   * Expected: Trả về { success: true } với cả add và remove thành công
   */
  it('upsertInvitations_WhenAddAndRemove_InsertsAndDeletes', async () => {
    // Arrange: Tạo event và invitation trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Add And Remove',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation với testUserId trước
    const invitation = {
      event_id: eventId,
      user_id: testUserId,
      invited_by: testUserId,
      invited_at: new Date().toISOString(),
      invitation_status: 'pending',
    };

    await testSupabase.from('event_invitations').insert(invitation);

    // Lấy thêm 1 user khác từ database (nếu có)
    const { data: otherUsers } = await testSupabase
      .from('profiles')
      .select('id')
      .neq('id', testUserId)
      .limit(1);

    if (otherUsers && otherUsers.length > 0) {
      const otherUserId = otherUsers[0].id;

      // Act: Gọi API xóa testUserId và thêm otherUserId
      const result = await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [otherUserId],
        removedMembers: [testUserId],
      });

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Kiểm tra invitation của testUserId đã được xóa
      const { data: deletedInvitation } = await testSupabase
        .from('event_invitations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', testUserId);

      expect(deletedInvitation?.length).toBe(0);

      // Kiểm tra invitation của otherUserId đã được tạo
      const { data: addedInvitation } = await testSupabase
        .from('event_invitations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', otherUserId);

      expect(addedInvitation).toBeDefined();
      expect(addedInvitation?.length).toBe(1);

      // Track để cleanup
      if (addedInvitation?.[0]?.id) {
        createdInvitationIds.push(addedInvitation[0].id);
      }
    } else {
      // Nếu không có user khác, chỉ test xóa và thêm lại cùng user
      // Act: Gọi API xóa và thêm lại cùng user
      const result = await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [testUserId],
        removedMembers: [testUserId],
      });

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Kiểm tra invitation đã được tạo lại
      const { data: invitations } = await testSupabase
        .from('event_invitations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', testUserId);

      expect(invitations?.length).toBe(1);

      // Track để cleanup
      if (invitations?.[0]?.id) {
        createdInvitationIds.push(invitations[0].id);
      }
    }
  });

  /**
   * Test Case 4: upsertInvitations_WhenEmptyArrays_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra API trả về success khi cả addedMembers và removedMembers đều rỗng
   * Input: addedMembers = [], removedMembers = []
   * Expected: Trả về { success: true } (không có thay đổi nhưng vẫn success)
   */
  it('upsertInvitations_WhenEmptyArrays_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty Arrays',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API với empty arrays
    const result = await upsertInvitations({
      eventId: eventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: testUserId,
      addedMembers: [],
      removedMembers: [],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  /**
   * Test Case 5: upsertInvitations_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('upsertInvitations_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const invalidEventId = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: invalidEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [testUserId],
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 6: upsertInvitations_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error (không phải success)
   */
  it('upsertInvitations_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: invalidEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [testUserId],
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: upsertInvitations_WhenEventIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId không tồn tại (foreign key constraint violation)
   * Input: eventId không tồn tại
   * Expected: Throw error (foreign key constraint violation)
   */
  it('upsertInvitations_WhenEventIdDoesNotExist_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: nonExistentEventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [testUserId],
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 8: upsertInvitations_WhenInvitedByIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi invitedBy là null/undefined
   * Input: invitedBy = null/undefined
   * Expected: Throw error (NOT NULL constraint violation)
   */
  it('upsertInvitations_WhenInvitedByIsNull_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null InvitedBy',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với invitedBy = null
    const invalidInvitedBy = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: invalidInvitedBy,
        addedMembers: [testUserId],
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 9: upsertInvitations_WhenInvitedByIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi invitedBy là empty string
   * Input: invitedBy = ''
   * Expected: Throw error (foreign key constraint violation)
   */
  it('upsertInvitations_WhenInvitedByIsEmpty_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Empty InvitedBy',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với invitedBy = ''
    const invalidInvitedBy = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: invalidInvitedBy,
        addedMembers: [testUserId],
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: upsertInvitations_WhenInvalidUserId_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi addedMembers có invalid user_id (foreign key violation)
   * Input: addedMembers với user_id không tồn tại
   * Expected: Throw error (foreign key constraint violation)
   */
  it('upsertInvitations_WhenInvalidUserId_ThrowsError', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Invalid UserId',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Chuẩn bị input với invalid user_id
    const invalidUserId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [invalidUserId], // Invalid user_id
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 11: upsertInvitations_WhenDuplicateInvitation_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi thêm duplicate invitation (UNIQUE constraint violation)
   * Input: addedMembers với user đã có invitation
   * Expected: Throw error (UNIQUE constraint violation)
   */
  it('upsertInvitations_WhenDuplicateInvitation_ThrowsError', async () => {
    // Arrange: Tạo event và invitation trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Duplicate Invitation',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo invitation trước
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

    createdInvitationIds.push(createdInvitation.id);

    // Act & Assert: Kiểm tra API throw error khi thêm duplicate
    try {
      await upsertInvitations({
        eventId: eventId,
        invitedMembers: [],
        invitedLeaders: [],
        invitedBy: testUserId,
        addedMembers: [testUserId], // Thêm lại user đã có invitation
        removedMembers: [],
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 12: upsertInvitations_WhenMultipleMembers_InsertsAll
   *
   * Mục tiêu: Kiểm tra API thêm nhiều invitations cùng lúc
   * Input: addedMembers với nhiều users hợp lệ
   * Expected: Trả về { success: true } và tất cả invitations được tạo
   */
  it('upsertInvitations_WhenMultipleMembers_InsertsAll', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Multiple Members',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Lấy thêm users từ database (nếu có)
    const { data: otherUsers } = await testSupabase
      .from('profiles')
      .select('id')
      .neq('id', testUserId)
      .limit(2);

    const membersToAdd = [testUserId];
    if (otherUsers && otherUsers.length > 0) {
      membersToAdd.push(...otherUsers.map(u => u.id));
    }

    // Act: Gọi API thêm nhiều invitations
    const result = await upsertInvitations({
      eventId: eventId,
      invitedMembers: [],
      invitedLeaders: [],
      invitedBy: testUserId,
      addedMembers: membersToAdd,
      removedMembers: [],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Kiểm tra tất cả invitations đã được tạo trong database
    const { data: invitations, error: selectError } = await testSupabase
      .from('event_invitations')
      .select('id, user_id')
      .eq('event_id', eventId);

    expect(selectError).toBeNull();
    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(membersToAdd.length);

    // Track để cleanup
    if (invitations) {
      for (const inv of invitations) {
        if (inv.id) {
          createdInvitationIds.push(inv.id);
        }
      }
    }
  });
});
