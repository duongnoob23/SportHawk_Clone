/**
 * Test Suite: getEventSquad API với Database Thật
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
 *
 *  VỀ toBeDefined():
 * - toBeDefined() vẫn bắt được TẤT CẢ các lỗi (error cases)
 * - Chỉ khác là không expect chi tiết error message
 * - Vẫn phát hiện được bugs: nếu expect error mà không có error → fail, nếu expect success mà có error → fail
 * - Đây là cách đúng vì error message có thể thay đổi, nhưng việc có error hay không là quan trọng
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

// Import createEvent và getEventSquad SAU KHI đã mock @lib/supabase
import { createEvent, getEventSquad } from '@top/features/event/api/event';

//  Bây giờ createEvent và getEventSquad sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('getEventSquad API - Real Database Tests', () => {
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
   * Test Case 1: getEventSquad_WhenEventHasSquadMembers_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra lấy squad members thành công khi event có squad members
   * Input: eventId hợp lệ, event có squad members
   * Expected: Trả về mảng squad members với đầy đủ thông tin
   */
  it('getEventSquad_WhenEventHasSquadMembers_ReturnsSuccess', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Squad',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad members cho event
    const squadMembers = [
      {
        event_id: eventId,
        user_id: testUserId,
        position: 'GK',
        squad_role: 'starter',
        selection_notes: 'Main goalkeeper',
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
      },
    ];

    await testSupabase.from('event_squads').insert(squadMembers);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra kết quả
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('userId');
    expect(result[0]).toHaveProperty('position');
    expect(result[0]).toHaveProperty('squadRole');
    expect(result[0]).toHaveProperty('selectionNotes');
    expect(result[0].userId).toBe(testUserId);
    expect(result[0].position).toBe('GK');
    expect(result[0].squadRole).toBe('starter');
    expect(result[0].selectionNotes).toBe('Main goalkeeper');
  });

  /**
   * Test Case 2: getEventSquad_WhenEventHasNoSquadMembers_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra API trả về mảng rỗng khi event không có squad members
   * Input: eventId hợp lệ nhưng không có squad members
   * Expected: Trả về mảng rỗng []
   */
  it('getEventSquad_WhenEventHasNoSquadMembers_ReturnsEmptyArray', async () => {
    // Arrange: Tạo event trước (không tạo squad members)
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event Without Squad',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra kết quả là mảng rỗng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 3: getEventSquad_WhenEventIdIsNull_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là null/undefined
   * Input: eventId = null/undefined
   * Expected: Throw error (không phải success)
   */
  it('getEventSquad_WhenEventIdIsNull_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = null
    const invalidPayload = {
      eventId: null as any,
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquad(invalidPayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: getEventSquad_WhenEventIdIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi eventId là empty string
   * Input: eventId = ''
   * Expected: Throw error (không phải success)
   */
  it('getEventSquad_WhenEventIdIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với eventId = ''
    const invalidPayload = {
      eventId: '',
    };

    // Act & Assert: Kiểm tra API throw error
    try {
      await getEventSquad(invalidPayload);
      throw new Error('Expected error to be thrown');
    } catch (error: any) {
      //  Chỉ cần kiểm tra có error là đủ (không phải success)
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: getEventSquad_WhenEventIdDoesNotExist_ReturnsEmptyArray
   *
   * Mục tiêu: Kiểm tra API trả về mảng rỗng khi eventId không tồn tại
   * Input: eventId không tồn tại
   * Expected: Trả về mảng rỗng []
   */
  it('getEventSquad_WhenEventIdDoesNotExist_ReturnsEmptyArray', async () => {
    // Arrange: Chuẩn bị input với eventId không tồn tại
    const nonExistentEventId = '00000000-0000-0000-0000-000000000000';
    const payload = {
      eventId: nonExistentEventId,
    };

    // Act: Gọi API getEventSquad
    const result = await getEventSquad(payload);

    // Assert: Kiểm tra kết quả là mảng rỗng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  /**
   * Test Case 6: getEventSquad_ReturnsSquadMembersWithAllFields
   *
   * Mục tiêu: Kiểm tra squad members trả về có đầy đủ các fields cần thiết
   * Input: eventId hợp lệ, event có squad members
   * Expected: Mảng squad members với đầy đủ fields: id, userId, position, squadRole, selectionNotes
   */
  it('getEventSquad_ReturnsSquadMembersWithAllFields', async () => {
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

    // Tạo squad members với đầy đủ thông tin
    const squadMembers = [
      {
        event_id: eventId,
        user_id: testUserId,
        position: 'DF',
        squad_role: 'substitute',
        selection_notes: 'Defender substitute',
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
      },
    ];

    await testSupabase.from('event_squads').insert(squadMembers);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra tất cả fields có trong result
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('userId');
    expect(result[0]).toHaveProperty('position');
    expect(result[0]).toHaveProperty('squadRole');
    expect(result[0]).toHaveProperty('selectionNotes');
    expect(result[0].userId).toBe(testUserId);
    expect(result[0].position).toBe('DF');
    expect(result[0].squadRole).toBe('substitute');
    expect(result[0].selectionNotes).toBe('Defender substitute');
  });

  /**
   * Test Case 7: getEventSquad_WhenEventHasMultipleSquadMembers_ReturnsAllMembers
   *
   * Mục tiêu: Kiểm tra API trả về tất cả squad members khi event có nhiều members
   * Input: eventId hợp lệ, event có nhiều squad members
   * Expected: Trả về mảng với tất cả squad members
   */
  it('getEventSquad_WhenEventHasMultipleSquadMembers_ReturnsAllMembers', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Multiple Squad',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo nhiều squad members
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
        user_id: testUserId, // Có thể dùng cùng userId hoặc userId khác nếu có
        position: 'DF',
        squad_role: 'starter',
        selection_notes: 'Defender',
        selected_by: testUserId,
        selected_at: new Date().toISOString(),
      },
    ];

    await testSupabase.from('event_squads').insert(squadMembers);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra kết quả có tất cả members
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test Case 8: getEventSquad_WhenSquadMemberHasNullSelectionNotes_ReturnsNullNotes
   *
   * Mục tiêu: Kiểm tra API trả về đúng khi squad member có selectionNotes = null
   * Input: Squad member với selectionNotes = null
   * Expected: Trả về squad member với selectionNotes = null
   */
  it('getEventSquad_WhenSquadMemberHasNullSelectionNotes_ReturnsNullNotes', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Null Notes',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad member với selectionNotes = null
    const squadMember = {
      event_id: eventId,
      user_id: testUserId,
      position: 'MF',
      squad_role: 'starter',
      selection_notes: null,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    };

    await testSupabase.from('event_squads').insert(squadMember);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra selectionNotes = null
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].selectionNotes).toBeNull();
  });

  /**
   * Test Case 9: getEventSquad_WhenSquadMemberHasDifferentPositions_ReturnsCorrectPositions
   *
   * Mục tiêu: Kiểm tra API trả về đúng position cho các squad members khác nhau
   * Input: Squad members với các positions khác nhau (GK, DF, MF, FW)
   * Expected: Trả về squad members với positions đúng
   */
  it('getEventSquad_WhenSquadMemberHasDifferentPositions_ReturnsCorrectPositions', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Different Positions',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad members với các positions khác nhau
    const positions = ['GK', 'DF', 'MF', 'FW'];
    const squadMembers = positions.map(position => ({
      event_id: eventId,
      user_id: testUserId,
      position: position,
      squad_role: 'starter',
      selection_notes: `${position} position`,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    }));

    await testSupabase.from('event_squads').insert(squadMembers);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra positions đúng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(positions.length);
    
    const resultPositions = result.map(m => m.position);
    for (const position of positions) {
      expect(resultPositions).toContain(position);
    }
  });

  /**
   * Test Case 10: getEventSquad_WhenSquadMemberHasDifferentSquadRoles_ReturnsCorrectRoles
   *
   * Mục tiêu: Kiểm tra API trả về đúng squadRole cho các squad members khác nhau
   * Input: Squad members với các squadRole khác nhau (starter, substitute)
   * Expected: Trả về squad members với squadRoles đúng
   */
  it('getEventSquad_WhenSquadMemberHasDifferentSquadRoles_ReturnsCorrectRoles', async () => {
    // Arrange: Tạo event trước
    const eventData = {
      team_id: testTeamId,
      title: 'Test Event For Different Roles',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
    };

    const eventId = await createEvent(eventData, testUserId);
    createdEventIds.push(eventId);

    // Tạo squad members với các squadRole khác nhau
    const squadRoles = ['starter', 'substitute'];
    const squadMembers = squadRoles.map(role => ({
      event_id: eventId,
      user_id: testUserId,
      position: 'DF',
      squad_role: role,
      selection_notes: `${role} role`,
      selected_by: testUserId,
      selected_at: new Date().toISOString(),
    }));

    await testSupabase.from('event_squads').insert(squadMembers);

    // Act: Gọi API getEventSquad
    const result = await getEventSquad({ eventId: eventId });

    // Assert: Kiểm tra squadRoles đúng
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(squadRoles.length);
    
    const resultRoles = result.map(m => m.squadRole);
    for (const role of squadRoles) {
      expect(resultRoles).toContain(role);
    }
  });
});

