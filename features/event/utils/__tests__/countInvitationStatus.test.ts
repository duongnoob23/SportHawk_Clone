/**
 * Unit Test: countInvitationStatus Utility
 * 
 * Test đếm số lượng RSVP responses (Yes/No/Maybe/Pending)
 */

import { countInvitationStatus } from '../index';
import { INVITATION_STATUS } from '../../constants/eventResponse';

describe('countInvitationStatus', () => {
  it('should count all invitation statuses correctly', () => {
    const mockEventData = {
      event_invitations: [
        { invitationStatus: INVITATION_STATUS.ACCEPTED },
        { invitationStatus: INVITATION_STATUS.ACCEPTED },
        { invitationStatus: INVITATION_STATUS.DECLINED },
        { invitationStatus: INVITATION_STATUS.MAYBE },
        { invitationStatus: INVITATION_STATUS.PENDING },
      ],
    };

    const result = countInvitationStatus(mockEventData);

    expect(result.yes).toBe(2);
    expect(result.no).toBe(1);
    expect(result.maybe).toBe(1);
    expect(result.none).toBe(1);
    expect(result.total).toBe(5);
  });

  it('should return zeros when no invitations', () => {
    const mockEventData = {
      event_invitations: [],
    };

    const result = countInvitationStatus(mockEventData);

    expect(result.yes).toBe(0);
    expect(result.no).toBe(0);
    expect(result.maybe).toBe(0);
    expect(result.none).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should handle missing event_invitations', () => {
    const mockEventData = {};

    const result = countInvitationStatus(mockEventData);

    expect(result.yes).toBe(0);
    expect(result.no).toBe(0);
    expect(result.maybe).toBe(0);
    expect(result.none).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should handle null event_invitations', () => {
    const mockEventData = {
      event_invitations: null,
    };

    const result = countInvitationStatus(mockEventData);

    expect(result.yes).toBe(0);
    expect(result.no).toBe(0);
    expect(result.maybe).toBe(0);
    expect(result.none).toBe(0);
    expect(result.total).toBe(0);
  });
});

