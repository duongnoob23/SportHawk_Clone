// Định nghĩa type cho Tab
import { TabType } from '../types';

export const TABS: { key: TabType; label: string; adminOnly?: boolean }[] = [
  { key: 'events', label: 'Events' },
  { key: 'payments', label: 'Payments' },
  { key: 'members', label: 'Members' },
  { key: 'admins', label: 'Admins', adminOnly: true },
];

export const InvitationStatus = {
  Pending: 'pending',
  Attending: 'attending',
  Maybe: 'maybe',
  NotAttending: 'not_attending',
  Invited: 'invited',
  Accepted: 'accepted',
  Sent: 'sent',
  Declined: 'declined',
} as const;

export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];
