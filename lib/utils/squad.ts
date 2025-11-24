import { TeamMember } from '@top/features/squad/types/index';

export function formatMemberName(m: TeamMember): string {
  const first = m?.profile?.first_name?.trim() || '';
  const last = m?.profile?.last_name?.trim() || '';
  const full = `${first} ${last}`.trim();
  return full || 'Unknown';
}
