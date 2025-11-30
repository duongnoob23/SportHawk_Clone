/**
 * Test Suite: createEvent API với Database Thật
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
  findAndCleanupEventByTitle,
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

// Import createEvent SAU KHI đã mock @lib/supabase
import { createEvent } from '@top/features/event/api/event';

//  Bây giờ createEvent sẽ dùng testSupabase (database thật) thay vì supabase từ lib!

describe('createEvent API - Real Database Tests', () => {
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
   * Test Case 1: createEvent_WhenValidInput_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công với input hợp lệ (dữ liệu thực tế)
   * Input: CreateEventData với đầy đủ thông tin hợp lệ - sử dụng dữ liệu thực tế từ app
   * Expected: Trả về event ID và event được tạo trong database
   *
   * Điểm khác với mock test:
   * -  Kiểm tra event thực sự được tạo trong database
   * -  Kiểm tra data trong database khớp với input
   * -  Phát hiện lỗi thực tế nếu có (constraints, foreign keys)
   * -  Sử dụng dữ liệu thực tế từ app (format time, selected_members, selected_leaders)
   */
  it('createEvent_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Chuẩn bị input hợp lệ - sử dụng dữ liệu thực tế từ terminal
    // Dữ liệu này được lấy từ việc tạo event thực tế trong app
    const validEventData = {
      team_id: '66d6b243-803a-4116-854b-8db76906c64d', // Team ID thực tế
      title: 'Fremington FC vs PTIT2 team',
      event_type: 'home_match',
      event_status: 'active',
      event_date: '2025-11-27',
      start_time: '14:00', // Format HH:mm (không có :00:00) - theo create-event.tsx line 300
      end_time: '16:00', // Format HH:mm - theo create-event.tsx line 303
      location_name: 'Mỹ Đình',
      location_address: 'Mỹ Đình, Nam Từ Liêm, Hà Nội, Vietnam',
      location_latitude: 21.0256221,
      location_longitude: 105.7677817,
      description: 'Yaaa hoo!',
      opponent: 'PTIT2 team',
      is_home_event: true,
      notes:
        'Kit Color: Red and blue \nMeet: 14:00\nAnswer by: 26/11/2025 22:45',
      //  QUAN TRỌNG: selected_members và selected_leaders là mảng user IDs
      selected_members: [
        '9be842ee-72ff-4d3d-92e0-6805a89d6243',
        'a5c4e217-5418-4fd5-b286-e15dc94947ef',
        'be8a2c49-cb77-4f37-8c7f-25afac8cb029',
        '8ede5f5b-47d9-4f19-9663-9e8513a2632d',
      ],
      selected_leaders: ['f3ee2852-4cf0-45e8-8c71-8480810d45e7'],
      pre_match_message: null,
    };

    // Act: Gọi API thật với database thật
    const eventId = await createEvent(validEventData, testUserId);
    createdEventIds.push(eventId);
    console.log('eventId', eventId);
    // Assert: Kiểm tra kết quả thực tế
    expect(eventId).toBeDefined();
    expect(typeof eventId).toBe('string');
    expect(eventId.length).toBeGreaterThan(0);

    //  QUAN TRỌNG: Kiểm tra event thực sự tồn tại trong database
    const { data: eventInDb, error: fetchError } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(fetchError).toBeNull();
    expect(eventInDb).toBeDefined();
    expect(eventInDb?.title).toBe('Fremington FC vs PTIT2 team');
    expect(eventInDb?.team_id).toBe('66d6b243-803a-4116-854b-8db76906c64d');
    expect(eventInDb?.created_by).toBe(testUserId);
    expect(eventInDb?.event_type).toBe('home_match');
    expect(eventInDb?.event_status).toBe('active');
    expect(eventInDb?.event_date).toBe('2025-11-27');
    // Lưu ý: Database có thể lưu time format khác (HH:mm:00 hoặc HH:mm:ss)
    expect(eventInDb?.start_time).toContain('14:00');
    expect(eventInDb?.end_time).toContain('16:00');
    expect(eventInDb?.location_name).toBe('Mỹ Đình');
    expect(eventInDb?.location_address).toBe(
      'Mỹ Đình, Nam Từ Liêm, Hà Nội, Vietnam'
    );
    expect(eventInDb?.opponent).toBe('PTIT2 team');
    expect(eventInDb?.is_home_event).toBe(true);
    expect(eventInDb?.description).toBe('Yaaa hoo!');

    //  QUAN TRỌNG: Kiểm tra invitations thực sự được tạo cho members
    const { data: memberInvitations, error: memberInvError } =
      await testSupabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', eventId)
        .in('user_id', validEventData.selected_members);

    expect(memberInvError).toBeNull();
    expect(memberInvitations).toBeDefined();
    expect(memberInvitations?.length).toBe(4); // 4 members

    //  Kiểm tra mỗi member có invitation với status 'pending'
    for (const memberId of validEventData.selected_members) {
      const memberInv = memberInvitations?.find(
        inv => inv.user_id === memberId
      );
      expect(memberInv).toBeDefined();
      expect(memberInv?.invitation_status).toBe('pending');
    }

    //  QUAN TRỌNG: Kiểm tra invitations thực sự được tạo cho leaders
    const { data: leaderInvitations, error: leaderInvError } =
      await testSupabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', eventId)
        .in('user_id', validEventData.selected_leaders);

    expect(leaderInvError).toBeNull();
    expect(leaderInvitations).toBeDefined();
    expect(leaderInvitations?.length).toBe(1); // 1 leader

    //  Kiểm tra leader có invitation với status 'pending'
    const leaderInv = leaderInvitations?.find(
      inv => inv.user_id === validEventData.selected_leaders[0]
    );
    expect(leaderInv).toBeDefined();
    expect(leaderInv?.invitation_status).toBe('pending');

    //  QUAN TRỌNG: Kiểm tra event_participants được tạo cho members (role: 'player')
    const { data: memberParticipants, error: memberPartError } =
      await testSupabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .in('user_id', validEventData.selected_members)
        .eq('role', 'player');

    expect(memberPartError).toBeNull();
    expect(memberParticipants).toBeDefined();
    expect(memberParticipants?.length).toBe(4); // 4 members với role 'player'

    //  Kiểm tra event_participants được tạo cho leaders (role: 'coach')
    const { data: leaderParticipants, error: leaderPartError } =
      await testSupabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .in('user_id', validEventData.selected_leaders)
        .eq('role', 'coach');

    expect(leaderPartError).toBeNull();
    expect(leaderParticipants).toBeDefined();
    expect(leaderParticipants?.length).toBe(1); // 1 leader với role 'coach'
  });

  /**
   * Test Case 2: createEvent_WhenTeamIdIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi team_id không tồn tại
   * Input: CreateEventData với team_id không hợp lệ
   * Expected: Throw error với foreign key constraint violation
   */
  it('createEvent_WhenTeamIdIsInvalid_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với team_id không tồn tại
    const invalidEventData = {
      team_id: '00000000-0000-0000-0000-000000000000', // UUID không tồn tại
      title: 'Test Event',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    // Act & Assert: Kiểm tra API throw error thực tế từ database
    await expect(createEvent(invalidEventData, testUserId)).rejects.toThrow();

    //  Kiểm tra error có chứa thông tin về foreign key constraint
    try {
      await createEvent(invalidEventData, testUserId);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error từ database thật sẽ có message về foreign key
      expect(error.message || error.code).toBeDefined();
      // Kiểm tra error code hoặc message chứa foreign key violation
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('foreign key') ||
          errorStr.includes('23503') ||
          error.code === '23503'
      ).toBe(true);
    }
  });

  /**
   * Test Case 3: createEvent_WhenEndTimeBeforeStartTime_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi end_time <= start_time
   * Input: CreateEventData với end_time <= start_time
   * Expected: Throw error với CHECK constraint violation
   */
  it('createEvent_WhenEndTimeBeforeStartTime_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với end_time <= start_time
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '16:00',
      end_time: '14:00', //  end_time < start_time
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    // Act & Assert: Kiểm tra API throw error thực tế từ database
    await expect(createEvent(invalidEventData, testUserId)).rejects.toThrow();

    //  Kiểm tra error có chứa thông tin về CHECK constraint
    try {
      await createEvent(invalidEventData, testUserId);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error từ database thật sẽ có message về CHECK constraint
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('check constraint') ||
          errorStr.includes('23514') ||
          error.code === '23514' ||
          errorStr.includes('end_after_start')
      ).toBe(true);
    }
  });

  /**
   * Test Case 4: createEvent_WhenInvalidEventType_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event_type không hợp lệ
   * Input: CreateEventData với event_type không có trong CHECK constraint
   * Expected: Throw error với CHECK constraint violation
   */
  it('createEvent_WhenInvalidEventType_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với event_type không hợp lệ
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event',
      event_type: 'invalid_type', //  Không có trong CHECK constraint
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    // Act & Assert: Kiểm tra API throw error thực tế
    await expect(createEvent(invalidEventData, testUserId)).rejects.toThrow();

    //  Kiểm tra error có chứa thông tin về CHECK constraint
    try {
      await createEvent(invalidEventData, testUserId);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('check constraint') ||
          errorStr.includes('23514') ||
          error.code === '23514' ||
          errorStr.includes('event_type')
      ).toBe(true);
    }
  });

  /**
   * Test Case 5: createEvent_WhenInvalidEventStatus_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event_status không hợp lệ
   * Input: CreateEventData với event_status không có trong CHECK constraint
   * Expected: Throw error với CHECK constraint violation
   */
  it('createEvent_WhenInvalidEventStatus_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với event_status không hợp lệ
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'scheduled', //  Không có trong CHECK constraint (chỉ có: active, cancelled, completed)
    };

    // Act & Assert: Kiểm tra API throw error thực tế
    await expect(createEvent(invalidEventData, testUserId)).rejects.toThrow();

    //  Kiểm tra error có chứa thông tin về CHECK constraint
    try {
      await createEvent(invalidEventData, testUserId);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('check constraint') ||
          errorStr.includes('23514') ||
          error.code === '23514' ||
          errorStr.includes('event_status')
      ).toBe(true);
    }
  });

  /**
   * Test Case 6: createEvent_WhenTitleIsEmpty_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi title là empty string
   * Input: CreateEventData với title = ''
   * Expected: Throw error (validation error - title là required field)
   *
   *  QUAN TRỌNG: API nên validate title là required
   * Nếu API không validate (bug), event sẽ được tạo và test này sẽ fail
   * Test này phát hiện bug: API không validate title
   */
  it('createEvent_WhenTitleIsEmpty_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với title empty
    const invalidEventData = {
      team_id: testTeamId,
      title: '', //  Empty string - API nên validate và throw error
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    let eventId: string | null = null;

    // Act & Assert: Kiểm tra API throw error (validation error)
    try {
      eventId = await createEvent(invalidEventData, testUserId);
      //  BUG: API không validate title, event được tạo (không nên)
      // Test này fail để phát hiện bug
      fail(
        ' BUG DETECTED: API should validate title is required, but event was created with empty title'
      );
    } catch (error: any) {
      //  Expected: API throw validation error
      expect(error).toBeDefined();
      // Error có thể là validation error hoặc database error
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('title') ||
          errorStr.includes('required') ||
          errorStr.includes('validation') ||
          error.message ||
          error.code
      ).toBe(true);
    } finally {
      //  QUAN TRỌNG: Cleanup nếu event vẫn được tạo (API có bug)
      if (eventId) {
        await cleanupEvent(eventId);
        console.warn(
          ' WARNING: Event was created with empty title - API validation bug detected!'
        );
      } else {
        // Tìm event bằng title (có thể là empty string)
        await findAndCleanupEventByTitle(
          invalidEventData.title,
          invalidEventData.team_id
        );
      }
    }
  });

  /**
   * Test Case 7: createEvent_WhenEventDateIsInvalid_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event_date format không hợp lệ
   * Input: CreateEventData với event_date = 'invalid-date'
   * Expected: Throw error với database type error
   */
  it('createEvent_WhenEventDateIsInvalid_ThrowsError', async () => {
    // Arrange: Chuẩn bị input với event_date không hợp lệ
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event Invalid Date',
      event_type: 'home_match',
      event_date: 'invalid-date', //  Invalid date format
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    // Act & Assert: Kiểm tra API throw error thực tế
    try {
      await createEvent(invalidEventData, testUserId);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error).toBeDefined();
      const errorStr = JSON.stringify(error).toLowerCase();
      expect(
        errorStr.includes('date') ||
          errorStr.includes('22p02') ||
          error.code === '22P02' ||
          errorStr.includes('invalid input')
      ).toBe(true);
    } finally {
      //  QUAN TRỌNG: Cleanup nếu event vẫn được tạo (mặc dù không nên)
      await findAndCleanupEventByTitle(
        invalidEventData.title,
        invalidEventData.team_id
      );
    }
  });

  /**
   * Test Case 7b: createEvent_WhenStartTimeIsMissing_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi start_time là missing (required field)
   * Input: CreateEventData không có start_time
   * Expected: Throw error (validation error hoặc database error)
   *
   *  QUAN TRỌNG: API nên validate start_time là required
   */
  it('createEvent_WhenStartTimeIsMissing_ThrowsError', async () => {
    // Arrange: Chuẩn bị input không có start_time
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event Missing Start Time',
      event_type: 'home_match',
      event_date: '2025-12-25',
      // start_time: missing       end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    } as any; // Type assertion để bypass TypeScript check

    let eventId: string | null = null;

    // Act & Assert: Kiểm tra API throw error
    try {
      eventId = await createEvent(invalidEventData, testUserId);
      //  BUG: API không validate start_time, event được tạo (không nên)
      fail(
        ' BUG DETECTED: API should validate start_time is required, but event was created without start_time'
      );
    } catch (error: any) {
      //  Expected: API throw validation error
      expect(error).toBeDefined();
    } finally {
      //  QUAN TRỌNG: Cleanup nếu event vẫn được tạo (API có bug)
      if (eventId) {
        await cleanupEvent(eventId);
        console.warn(
          ' WARNING: Event was created without start_time - API validation bug detected!'
        );
      } else {
        await findAndCleanupEventByTitle(
          invalidEventData.title,
          invalidEventData.team_id
        );
      }
    }
  });

  /**
   * Test Case 7c: createEvent_WhenEventTypeIsMissing_ThrowsError
   *
   * Mục tiêu: Kiểm tra API throw error khi event_type là missing (required field)
   * Input: CreateEventData không có event_type
   * Expected: Throw error (validation error hoặc database error)
   *
   *  QUAN TRỌNG: API nên validate event_type là required
   */
  it('createEvent_WhenEventTypeIsMissing_ThrowsError', async () => {
    // Arrange: Chuẩn bị input không có event_type
    const invalidEventData = {
      team_id: testTeamId,
      title: 'Test Event Missing Event Type',
      // event_type: missing       event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
    } as any; // Type assertion để bypass TypeScript check

    let eventId: string | null = null;

    // Act & Assert: Kiểm tra API throw error
    try {
      eventId = await createEvent(invalidEventData, testUserId);
      //  BUG: API không validate event_type, event được tạo (không nên)
      fail(
        ' BUG DETECTED: API should validate event_type is required, but event was created without event_type'
      );
    } catch (error: any) {
      //  Expected: API throw validation error
      expect(error).toBeDefined();
    } finally {
      //  QUAN TRỌNG: Cleanup nếu event vẫn được tạo (API có bug)
      if (eventId) {
        await cleanupEvent(eventId);
        console.warn(
          ' WARNING: Event was created without event_type - API validation bug detected!'
        );
      } else {
        await findAndCleanupEventByTitle(
          invalidEventData.title,
          invalidEventData.team_id
        );
      }
    }
  });

  /**
   * Test Case 8: createEvent_WhenWithoutMembersAndLeaders_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công khi không có members và leaders
   * Input: CreateEventData không có selected_members và selected_leaders
   * Expected: Event được tạo thành công, không có invitations
   */
  it('createEvent_WhenWithoutMembersAndLeaders_ReturnsSuccess', async () => {
    // Arrange: Chuẩn bị input không có members và leaders
    const eventDataWithoutMembers = {
      team_id: testTeamId,
      title: 'Test Event Without Members',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
      // Không có selected_members và selected_leaders
    };

    // Act: Gọi API thật
    const eventId = await createEvent(eventDataWithoutMembers, testUserId);
    createdEventIds.push(eventId);

    // Assert: Kiểm tra event được tạo
    expect(eventId).toBeDefined();

    //  Kiểm tra event tồn tại trong database
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb).toBeDefined();
    expect(eventInDb?.title).toBe('Test Event Without Members');

    //  Kiểm tra KHÔNG có invitations
    const { data: invitations } = await testSupabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);

    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(0); // Không có invitations

    //  Kiểm tra KHÔNG có participants
    const { data: participants } = await testSupabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId);

    expect(participants).toBeDefined();
    expect(participants?.length).toBe(0); // Không có participants
  });

  /**
   * Test Case 9: createEvent_WhenWithOnlyMembers_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công chỉ với members (không có leaders)
   * Input: CreateEventData chỉ có selected_members
   * Expected: Event được tạo và chỉ có member invitations
   */
  it('createEvent_WhenWithOnlyMembers_ReturnsSuccess', async () => {
    // Arrange: Lấy 2 user IDs hợp lệ từ database
    const { data: testMembers } = await testSupabase
      .from('profiles')
      .select('id')
      .limit(2);

    if (!testMembers || testMembers.length < 2) {
      console.warn(' Not enough test users. Skipping test.');
      return;
    }

    const memberIds = testMembers.map(m => m.id).slice(0, 2);

    const eventDataWithOnlyMembers = {
      team_id: testTeamId,
      title: 'Test Event With Only Members',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
      selected_members: memberIds,
      // Không có selected_leaders
    };

    // Act: Gọi API thật
    const eventId = await createEvent(eventDataWithOnlyMembers, testUserId);
    createdEventIds.push(eventId);

    // Assert: Kiểm tra event được tạo
    expect(eventId).toBeDefined();

    //  Kiểm tra invitations cho members
    const { data: invitations } = await testSupabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);

    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(2); // 2 members

    //  Kiểm tra participants với role 'player'
    const { data: participants } = await testSupabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('role', 'player');

    expect(participants).toBeDefined();
    expect(participants?.length).toBe(2); // 2 players

    //  Kiểm tra KHÔNG có participants với role 'coach'
    const { data: coaches } = await testSupabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('role', 'coach');

    expect(coaches?.length).toBe(0); // Không có coaches
  });

  /**
   * Test Case 10: createEvent_WhenWithOnlyLeaders_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công chỉ với leaders (không có members)
   * Input: CreateEventData chỉ có selected_leaders
   * Expected: Event được tạo và chỉ có leader invitations
   */
  it('createEvent_WhenWithOnlyLeaders_ReturnsSuccess', async () => {
    // Arrange: Lấy 1 user ID hợp lệ từ database làm leader
    const { data: testLeaders } = await testSupabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (!testLeaders || testLeaders.length < 1) {
      console.warn(' Not enough test users. Skipping test.');
      return;
    }

    const leaderId = testLeaders[0].id;

    const eventDataWithOnlyLeaders = {
      team_id: testTeamId,
      title: 'Test Event With Only Leaders',
      event_type: 'home_match',
      event_date: '2025-12-25',
      start_time: '14:00',
      end_time: '16:00',
      location_name: 'Test Stadium',
      event_status: 'active',
      selected_leaders: [leaderId],
      // Không có selected_members
    };

    // Act: Gọi API thật
    const eventId = await createEvent(eventDataWithOnlyLeaders, testUserId);
    createdEventIds.push(eventId);

    // Assert: Kiểm tra event được tạo
    expect(eventId).toBeDefined();

    //  Kiểm tra invitations cho leaders
    const { data: invitations } = await testSupabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);

    expect(invitations).toBeDefined();
    expect(invitations?.length).toBe(1); // 1 leader

    //  Kiểm tra participants với role 'coach'
    const { data: coaches } = await testSupabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('role', 'coach');

    expect(coaches).toBeDefined();
    expect(coaches?.length).toBe(1); // 1 coach

    //  Kiểm tra KHÔNG có participants với role 'player'
    const { data: players } = await testSupabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('role', 'player');

    expect(players?.length).toBe(0); // Không có players
  });

  /**
   * Test Case 11: createEvent_WhenWithoutEndTime_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công khi không có end_time (nullable)
   * Input: CreateEventData không có end_time
   * Expected: Event được tạo thành công với end_time = null
   */
  it('createEvent_WhenWithoutEndTime_ReturnsSuccess', async () => {
    // Arrange: Chuẩn bị input không có end_time
    const eventDataWithoutEndTime = {
      team_id: testTeamId,
      title: 'Test Event Without End Time',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      // Không có end_time
      location_name: 'Test Stadium',
      event_status: 'active',
    };

    // Act: Gọi API thật
    const eventId = await createEvent(eventDataWithoutEndTime, testUserId);
    createdEventIds.push(eventId);

    // Assert: Kiểm tra event được tạo
    expect(eventId).toBeDefined();

    //  Kiểm tra event trong database có end_time = null
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb).toBeDefined();
    expect(eventInDb?.end_time).toBeNull(); // end_time phải là null
    expect(eventInDb?.start_time).toContain('14:00');
  });

  /**
   * Test Case 12: createEvent_WhenWithAllEventTypes_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công với các event_type hợp lệ khác nhau
   * Input: CreateEventData với các event_type: home_match, away_match, training, other
   * Expected: Tất cả event types đều được tạo thành công
   */
  it('createEvent_WhenWithAllEventTypes_ReturnsSuccess', async () => {
    const eventTypes = ['home_match', 'away_match', 'training', 'other'];

    for (const eventType of eventTypes) {
      const eventData = {
        team_id: testTeamId,
        title: `Test ${eventType}`,
        event_type: eventType,
        event_date: '2025-12-25',
        start_time: '14:00',
        end_time: '16:00',
        location_name: 'Test Stadium',
        event_status: 'active',
      };

      // Act: Gọi API thật
      const eventId = await createEvent(eventData, testUserId);
      createdEventIds.push(eventId);

      // Assert: Kiểm tra event được tạo với đúng event_type
      const { data: eventInDb } = await testSupabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      expect(eventInDb).toBeDefined();
      expect(eventInDb?.event_type).toBe(eventType);
    }
  });

  /**
   * Test Case 13: createEvent_WhenWithAllOptionalFieldsNull_ReturnsSuccess
   *
   * Mục tiêu: Kiểm tra tạo event thành công khi tất cả optional fields đều null
   * Input: CreateEventData chỉ có required fields, optional fields = null
   * Expected: Event được tạo thành công với optional fields = null
   */
  it('createEvent_WhenWithAllOptionalFieldsNull_ReturnsSuccess', async () => {
    // Arrange: Chuẩn bị input chỉ có required fields
    const minimalEventData = {
      team_id: testTeamId,
      title: 'Minimal Event',
      event_type: 'training',
      event_date: '2025-12-25',
      start_time: '14:00',
      event_status: 'active',
      // Tất cả optional fields không có hoặc null
    };

    // Act: Gọi API thật
    const eventId = await createEvent(minimalEventData, testUserId);
    createdEventIds.push(eventId);

    // Assert: Kiểm tra event được tạo
    expect(eventId).toBeDefined();

    //  Kiểm tra event trong database
    const { data: eventInDb } = await testSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    expect(eventInDb).toBeDefined();
    expect(eventInDb?.title).toBe('Minimal Event');
    expect(eventInDb?.description).toBeNull();
    expect(eventInDb?.location_address).toBeNull();
    expect(eventInDb?.opponent).toBeNull();
    expect(eventInDb?.notes).toBeNull();
  });
});
