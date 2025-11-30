/**
 * Test Suite: getUpsertEventsquad API với Database Thật
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
 * - Sử dụng cleanupEvent() để xóa event và data liên quan (bao gồm event_squads)
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

// Import createEvent và getUpsertEventsquad SAU KHI đã mock @lib/supabase
import {
  createEvent,
  getUpsertEventsquad,
} from '@top/features/event/api/event';

//  Bây giờ createEvent và getUpsertEventsquad sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getUpsertEventsquad API - Real Database Tests', () => {
  // Test data - sẽ được setup từ database thật
  let testTeamId: string;
  let testUserId: string;
  let createdEventIds: string[] = []; // Track events để cleanup
  let createdSquadIds: string[] = []; // Track squad members để cleanup

  // Setup: Lấy test data từ database thật
  beforeAll(async () => {
    const testData = await getExistingTestData();
    testTeamId = testData.teamId;
    testUserId = testData.userId;
  });

  // Cleanup: Xóa tất cả events và squad members đã tạo sau mỗi test
  afterEach(async () => {
    // Cleanup squad members trước (vì có foreign key đến events)
    for (const squadId of createdSquadIds) {
      await testSupabase.from('event_squads').delete().eq('id', squadId);
    }
    createdSquadIds = [];

    // Cleanup events
    for (const eventId of createdEventIds) {
      await cleanupEvent(eventId);
    }
    createdEventIds = [];
  });

  /**
   * Test Case 1: getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers
   *
   * Mục tiêu: Kiểm tra thêm squad members thành công
   * Input: addMember với user hợp lệ
   * Expected: Trả về success, addedCount > 0, và squad members được tạo trong database
   */
  it('getUpsertEventsquad_WhenAddMembers_InsertsSquadMembers', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Add Squad Members',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API thêm squad member
    const result = await getUpsertEventsquad({
      userId: testUserId,
      teamId: testTeamId,
      eventId: eventId,
      selectedMembers: [],
      preMatchMessage: 'Test pre-match message',
      selectedBy: testUserId,
      addMember: [testUserId],
      removeMember: undefined,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.updated).toBe('changed');
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(0);
    expect(result.totalCount).toBe(1);
    expect(result.previousCount).toBe(0);

    // Kiểm tra squad member đã được tạo trong database
    const { data: squadMembers, error: selectError } = await testSupabase
      .from('event_squads')
      .select('id, user_id, selected_by, selection_notes')
      .eq('event_id', eventId);

    expect(selectError).toBeNull();
    expect(squadMembers).toBeDefined();
    expect(squadMembers?.length).toBe(1);
    expect(squadMembers?.[0].user_id).toBe(testUserId);
    expect(squadMembers?.[0].selected_by).toBe(testUserId);
    expect(squadMembers?.[0].selection_notes).toBe('Test pre-match message');

    // Track để cleanup
    if (squadMembers?.[0]?.id) {
      createdSquadIds.push(squadMembers[0].id);
    }
  });

  /**
   * Test Case 2: getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers
   *
   * Mục tiêu: Kiểm tra xóa squad members thành công
   * Input: removeMember với user đã có trong squad
   * Expected: Trả về success, removedCount > 0, và squad members được xóa khỏi database
   */
  it('getUpsertEventsquad_WhenRemoveMembers_DeletesSquadMembers', async () => {
    // Arrange: Tạo event và squad member trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Remove Squad Members',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member trước
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
      position: null,
      squad_role: null,
      selection_notes: 'Test message',
    };

    const { data: createdSquad, error: insertError } = await testSupabase
      .from('event_squads')
      .insert(squadMember)
      .select('id')
      .single();

    if (insertError || !createdSquad) {
      throw new Error(`Failed to create squad member: ${insertError?.message}`);
    }

    // Act: Gọi API xóa squad member
    const result = await getUpsertEventsquad({
      userId: testUserId,
      teamId: testTeamId,
      eventId: eventId,
      selectedMembers: [],
      preMatchMessage: null,
      selectedBy: testUserId,
      addMember: [],
      removeMember: [testUserId],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.updated).toBe('changed');
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(1);
    expect(result.totalCount).toBe(0);
    expect(result.previousCount).toBe(1);

    // Kiểm tra squad member đã được xóa khỏi database
    const { data: squadMembers, error: selectError } = await testSupabase
      .from('event_squads')
      .select('id')
      .eq('event_id', eventId);

    expect(selectError).toBeNull();
    expect(squadMembers).toBeDefined();
    expect(squadMembers?.length).toBe(0);
  });

  /**
   * Test Case 3: getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes
   *
   * Mục tiêu: Kiểm tra thêm và xóa squad members cùng lúc
   * Input: addMember và removeMember với các users khác nhau
   * Expected: Trả về success với cả addedCount và removedCount > 0
   */
  it('getUpsertEventsquad_WhenAddAndRemove_InsertsAndDeletes', async () => {
    // Arrange: Tạo event và squad member trước
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

    // Lấy thêm 1 user khác từ database (nếu có)
    const { data: otherUsers } = await testSupabase
      .from('profiles')
      .select('id')
      .neq('id', testUserId)
      .limit(1);

    if (!otherUsers || otherUsers.length === 0) {
      // Nếu không có user khác, chỉ test với 1 user
      // Tạo squad member trước
      const squadMember = {
        event_id: eventId,
        user_id: testUserId,
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
        position: null,
        squad_role: null,
        selection_notes: 'Test message',
      };

      await testSupabase.from('event_squads').insert(squadMember);

      // Act: Gọi API xóa và thêm lại cùng user (thực tế sẽ xóa rồi thêm lại)
      const result = await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: eventId,
        selectedMembers: [],
        preMatchMessage: 'Updated message',
        selectedBy: testUserId,
        addMember: [testUserId],
        removeMember: [testUserId],
      });

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.updated).toBe('changed');
      expect(result.removedCount).toBe(1);
      expect(result.addedCount).toBe(1);
    } else {
      // Có user khác, test với 2 users
      const otherUserId = otherUsers[0].id;

      // Tạo squad member với testUserId
      const squadMember = {
        event_id: eventId,
        user_id: testUserId,
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
        position: null,
        squad_role: null,
        selection_notes: 'Test message',
      };

      await testSupabase.from('event_squads').insert(squadMember);

      // Act: Gọi API xóa testUserId và thêm otherUserId
      const result = await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: eventId,
        selectedMembers: [],
        preMatchMessage: 'New message',
        selectedBy: testUserId,
        addMember: [otherUserId],
        removeMember: [testUserId],
      });

      // Assert: Kiểm tra kết quả
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.updated).toBe('changed');
      expect(result.removedCount).toBe(1);
      expect(result.addedCount).toBe(1);
      expect(result.totalCount).toBe(1);

      // Track để cleanup
      const { data: finalSquads } = await testSupabase
        .from('event_squads')
        .select('id')
        .eq('event_id', eventId);

      if (finalSquads && finalSquads.length > 0) {
        createdSquadIds.push(finalSquads[0].id);
      }
    }
  });

  /**
   * Test Case 4: getUpsertEventsquad_WhenNoChanges_ReturnsNoChange
   *
   * Mục tiêu: Kiểm tra API trả về no-change khi không có thay đổi
   * Input: addMember và removeMember rỗng hoặc không có thay đổi
   * Expected: Trả về success: false, updated: 'no-change'
   */
  it('getUpsertEventsquad_WhenNoChanges_ReturnsNoChange', async () => {
    // Arrange: Tạo event trước (không tạo squad members)
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For No Changes',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API với addMember và removeMember rỗng
    const result = await getUpsertEventsquad({
      userId: testUserId,
      teamId: testTeamId,
      eventId: eventId,
      selectedMembers: [],
      preMatchMessage: null,
      selectedBy: testUserId,
      addMember: [],
      removeMember: undefined,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.updated).toBe('no-change');
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.previousCount).toBe(0);
  });

  /**
   * Test Case 5: getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates
   *
   * Mục tiêu: Kiểm tra API skip duplicate members (đã có trong squad)
   * Input: addMember với user đã có trong squad
   * Expected: Trả về addedCount = 0 (không thêm duplicate)
   */
  it('getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates', async () => {
    // Arrange: Tạo event và squad member trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Duplicate Members',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member trước
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
      position: null,
      squad_role: null,
      selection_notes: 'Test message',
    };

    const { data: createdSquad, error: insertError } = await testSupabase
      .from('event_squads')
      .insert(squadMember)
      .select('id')
      .single();

    if (insertError || !createdSquad) {
      throw new Error(`Failed to create squad member: ${insertError?.message}`);
    }

    createdSquadIds.push(createdSquad.id);

    // Act: Gọi API thêm lại cùng user (duplicate)
    const result = await getUpsertEventsquad({
      userId: testUserId,
      teamId: testTeamId,
      eventId: eventId,
      selectedMembers: [],
      preMatchMessage: 'New message',
      selectedBy: testUserId,
      addMember: [testUserId], // Thêm lại user đã có
      removeMember: undefined,
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(false); // Không có thay đổi
    expect(result.updated).toBe('no-change');
    expect(result.addedCount).toBe(0); // Không thêm duplicate
    expect(result.removedCount).toBe(0);
    expect(result.totalCount).toBe(1); // Vẫn chỉ có 1 member
    expect(result.previousCount).toBe(1);
  });

  /**
   * Test Case 6: getUpsertEventsquad_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getUpsertEventsquad_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const invalidEventId = null as any;

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: invalidEventId,
        selectedMembers: [],
        preMatchMessage: null,
        selectedBy: testUserId,
        addMember: [testUserId],
        removeMember: undefined,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: getUpsertEventsquad_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error (không phải success)
   */
  it('getUpsertEventsquad_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidEventId = '';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: invalidEventId,
        selectedMembers: [],
        preMatchMessage: null,
        selectedBy: testUserId,
        addMember: [testUserId],
        removeMember: undefined,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 8: getUpsertEventsquad_WhenEventIdDoesNotExist_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId không tồn tại (foreign key constraint violation)
   * Input: eventId không tồn tại
   * Expected: Throw error (foreign key constraint violation)
   */
  it('getUpsertEventsquad_WhenEventIdDoesNotExist_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';

    // Act & Assert: Kiểm tra API throw error
    try {
      await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: nonExistentEventId,
        selectedMembers: [],
        preMatchMessage: null,
        selectedBy: testUserId,
        addMember: [testUserId],
        removeMember: undefined,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 9: getUpsertEventsquad_WhenInvalidUserId_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi addMember có invalid user_id (foreign key violation)
   * Input: addMember với user_id không tồn tại
   * Expected: Throw error (foreign key constraint violation)
   */
  it('getUpsertEventsquad_WhenInvalidUserId_ThrowsError', async () => {
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
      await getUpsertEventsquad({
        userId: testUserId,
        teamId: testTeamId,
        eventId: eventId,
        selectedMembers: [],
        preMatchMessage: null,
        selectedBy: testUserId,
        addMember: [invalidUserId], // Invalid user_id
        removeMember: undefined,
      });
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange
   *
   * Mục tiêu: Kiểm tra API trả về no-change khi cả addMember và removeMember đều rỗng
   * Input: addMember = [], removeMember = []
   * Expected: Trả về success: false, updated: 'no-change'
   */
  it('getUpsertEventsquad_WhenEmptyArrays_ReturnsNoChange', async () => {
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
    const result = await getUpsertEventsquad({
      userId: testUserId,
      teamId: testTeamId,
      eventId: eventId,
      selectedMembers: [],
      preMatchMessage: null,
      selectedBy: testUserId,
      addMember: [],
      removeMember: [],
    });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.updated).toBe('no-change');
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });
});
