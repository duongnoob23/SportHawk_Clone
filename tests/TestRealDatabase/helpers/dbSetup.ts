/**
 * Database Setup Helper cho Real Database Tests
 *
 * Helper này giúp:
 * - Kết nối database thật (không mock)
 * - Cleanup data sau mỗi test
 * - Setup test data cần thiết
 */

import { createClient } from '@supabase/supabase-js';

// ✅ Hardcode Supabase credentials từ .env file
// Không cần đọc từ environment variables nữa
export const TEST_SUPABASE_URL = 'https://vwqfwehtjnjenzrhzgol.supabase.co';
export const TEST_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWZ3ZWh0am5qZW56cmh6Z29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzNTI1MywiZXhwIjoyMDY2NTExMjUzfQ.PQMTRnTNq2e3kzT4-NuxDb_2eZu3ae7WaulJo4Bb4SA';

// Sử dụng hardcoded values
const supabaseUrl = TEST_SUPABASE_URL;
const supabaseKey = TEST_SUPABASE_SERVICE_ROLE_KEY;

// Tạo Supabase client với service role key (có quyền cao hơn)
// Service role key bypass RLS (Row Level Security)
export const testSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Cleanup: Xóa event và các data liên quan
 */
export async function cleanupEvent(eventId: string) {
  try {
    // Xóa theo thứ tự để tránh foreign key violations
    // 1. Xóa event_invitations
    await testSupabase
      .from('event_invitations')
      .delete()
      .eq('event_id', eventId);

    // 2. Xóa event_participants
    await testSupabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId);

    // 3. Xóa event_squads
    await testSupabase.from('event_squads').delete().eq('event_id', eventId);

    // 4. Xóa event
    await testSupabase.from('events').delete().eq('id', eventId);
  } catch (error) {
    console.error('❌ Error cleaning up event:', error);
    // Không throw để test vẫn tiếp tục
  }
}

/**
 * Cleanup: Xóa nhiều events cùng lúc
 */
export async function cleanupEvents(eventIds: string[]) {
  for (const eventId of eventIds) {
    await cleanupEvent(eventId);
  }
}

/**
 * Helper: Tìm event trong database dựa trên title và team_id
 * Dùng để cleanup event nếu test fail nhưng event vẫn được tạo
 */
export async function findEventByTitleAndTeam(
  title: string,
  teamId: string
): Promise<string | null> {
  try {
    const { data: events } = await testSupabase
      .from('events')
      .select('id')
      .eq('title', title)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (events && events.length > 0) {
      return events[0].id;
    }
    return null;
  } catch (error) {
    console.error('❌ Error finding event:', error);
    return null;
  }
}

/**
 * Helper: Tìm và cleanup event dựa trên title và team_id
 * Dùng trong test cases khi không chắc event có được tạo hay không
 */
export async function findAndCleanupEventByTitle(
  title: string,
  teamId: string
): Promise<void> {
  const eventId = await findEventByTitleAndTeam(title, teamId);
  if (eventId) {
    await cleanupEvent(eventId);
  }
}

/**
 * Setup: Tạo test team (nếu chưa có)
 * Trả về team_id để dùng trong test
 */
export async function setupTestTeam(
  teamName: string = 'Test Team'
): Promise<string> {
  // Kiểm tra xem đã có test team chưa
  const { data: existingTeam } = await testSupabase
    .from('teams')
    .select('id')
    .eq('name', teamName)
    .single();

  if (existingTeam) {
    return existingTeam.id;
  }

  // Tạo test team mới
  // LƯU Ý: Cần có club_id hợp lệ, nếu không sẽ fail
  // Bạn cần tạo test club trước hoặc dùng club_id có sẵn
  const { data: clubs } = await testSupabase
    .from('clubs')
    .select('id')
    .limit(1)
    .single();

  if (!clubs) {
    throw new Error('❌ No club found. Please create a test club first.');
  }

  const { data: newTeam, error } = await testSupabase
    .from('teams')
    .insert({
      name: teamName,
      club_id: clubs.id,
      sport: 'football',
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`❌ Failed to create test team: ${error.message}`);
  }

  return newTeam.id;
}

/**
 * Setup: Tạo test user (nếu chưa có)
 * Trả về user_id để dùng trong test
 *
 * LƯU Ý: Tạo user trong auth.users phức tạp hơn, cần dùng Supabase Admin API
 * Hoặc dùng user có sẵn trong database
 */
export async function setupTestUser(
  userEmail: string = 'test@example.com'
): Promise<string> {
  // Kiểm tra xem đã có test user chưa
  const { data: existingUser } = await testSupabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // LƯU Ý: Để tạo user mới, bạn cần:
  // 1. Tạo user trong auth.users (qua Supabase Admin API hoặc auth.signUp)
  // 2. Tạo profile tương ứng
  //
  // Vì phức tạp, khuyến nghị dùng user có sẵn trong database
  const { data: users } = await testSupabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single();

  if (!users) {
    throw new Error(
      '❌ No user found. Please create a test user first or use existing user.'
    );
  }

  return users.id;
}

/**
 * Helper: Lấy team_id và user_id có sẵn trong database
 * (Dùng khi không muốn tạo mới)
 */
export async function getExistingTestData(): Promise<{
  teamId: string;
  userId: string;
}> {
  // ✅ Sửa: Không dùng .single() vì nó throw error nếu không có data
  // Thay vào đó dùng .limit(1) và kiểm tra data
  const { data: teams, error: teamError } = await testSupabase
    .from('teams')
    .select('id')
    .limit(1);

  const { data: users, error: userError } = await testSupabase
    .from('profiles')
    .select('id')
    .limit(1);

  // Kiểm tra lỗi hoặc không có data
  if (teamError || !teams || teams.length === 0) {
    throw new Error(
      '❌ No existing team found in database.\n' +
        'Please ensure database has at least one team.\n' +
        `Error: ${teamError?.message || 'No teams found'}`
    );
  }

  if (userError || !users || users.length === 0) {
    throw new Error(
      '❌ No existing user found in database.\n' +
        'Please ensure database has at least one user.\n' +
        `Error: ${userError?.message || 'No users found'}`
    );
  }

  return {
    teamId: teams[0].id,
    userId: users[0].id,
  };
}
