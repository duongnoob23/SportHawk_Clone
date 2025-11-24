/**
 * Constraint Validators - Kiểm tra các constraints của database
 * 
 * Các functions này mô phỏng validation logic của PostgreSQL/Supabase
 * để đảm bảo tests thực sự bắt được lỗi khi vi phạm constraints
 */

/**
 * Kiểm tra UNIQUE constraint: event_invitations (event_id, user_id)
 */
export function validateEventInvitationUnique(
  existingInvitations: Array<{ event_id: string; user_id: string }>,
  newInvitation: { event_id: string; user_id: string }
): { valid: boolean; error?: any } {
  const duplicate = existingInvitations.find(
    inv =>
      inv.event_id === newInvitation.event_id &&
      inv.user_id === newInvitation.user_id
  );

  if (duplicate) {
    return {
      valid: false,
      error: {
        message: `duplicate key value violates unique constraint "event_invitations_unique"`,
        code: '23505',
        details: `Key (event_id, user_id)=(${newInvitation.event_id}, ${newInvitation.user_id}) already exists.`,
        hint: null,
      },
    };
  }

  return { valid: true };
}

/**
 * Kiểm tra UNIQUE constraint: event_squads (event_id, user_id)
 */
export function validateEventSquadUnique(
  existingSquads: Array<{ event_id: string; user_id: string }>,
  newSquad: { event_id: string; user_id: string }
): { valid: boolean; error?: any } {
  const duplicate = existingSquads.find(
    squad =>
      squad.event_id === newSquad.event_id &&
      squad.user_id === newSquad.user_id
  );

  if (duplicate) {
    return {
      valid: false,
      error: {
        message: `duplicate key value violates unique constraint "event_squads_unique"`,
        code: '23505',
        details: `Key (event_id, user_id)=(${newSquad.event_id}, ${newSquad.user_id}) already exists.`,
        hint: null,
      },
    };
  }

  return { valid: true };
}

/**
 * Kiểm tra CHECK constraint: end_time > start_time
 */
export function validateEndTimeAfterStartTime(
  startTime: string | null,
  endTime: string | null
): { valid: boolean; error?: any } {
  if (endTime === null || startTime === null) {
    return { valid: true };
  }

  // Parse time strings (format: 'HH:MM:SS')
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (end <= start) {
    return {
      valid: false,
      error: {
        message: `new row for relation "events" violates check constraint "events_end_after_start"`,
        code: '23514',
        details: `Failing row contains (..., start_time=${startTime}, end_time=${endTime}).`,
        hint: null,
      },
    };
  }

  return { valid: true };
}

/**
 * Kiểm tra CHECK constraint: max_participants > 0
 */
export function validateMaxParticipantsPositive(
  maxParticipants: number | null
): { valid: boolean; error?: any } {
  if (maxParticipants === null) {
    return { valid: true };
  }

  if (maxParticipants <= 0) {
    return {
      valid: false,
      error: {
        message: `new row for relation "events" violates check constraint "events_max_participants_positive"`,
        code: '23514',
        details: `Failing row contains (..., max_participants=${maxParticipants}).`,
        hint: null,
      },
    };
  }

  return { valid: true };
}

/**
 * Kiểm tra CHECK constraint: cancelled_reason required khi event_status = 'cancelled'
 */
export function validateCancelledReasonRequired(
  eventStatus: string,
  cancelledReason: string | null
): { valid: boolean; error?: any } {
  if (eventStatus === 'cancelled') {
    if (cancelledReason === null || cancelledReason === '') {
      return {
        valid: false,
        error: {
          message: `new row for relation "events" violates check constraint "events_cancelled_reason_required"`,
          code: '23514',
          details: `Failing row contains (event_status='cancelled', cancelled_reason=${cancelledReason}).`,
          hint: null,
        },
      };
    }
  } else {
    if (cancelledReason !== null && cancelledReason !== '') {
      return {
        valid: false,
        error: {
          message: `new row for relation "events" violates check constraint "events_cancelled_reason_required"`,
          code: '23514',
          details: `Failing row contains (event_status='${eventStatus}', cancelled_reason='${cancelledReason}').`,
          hint: null,
        },
      };
    }
  }

  return { valid: true };
}

/**
 * Kiểm tra CHECK constraint: event_status chỉ có thể là 'active', 'cancelled', 'completed'
 */
export function validateEventStatus(eventStatus: string): { valid: boolean; error?: any } {
  const validStatuses = ['active', 'cancelled', 'completed'];
  
  if (!validStatuses.includes(eventStatus)) {
    return {
      valid: false,
      error: {
        message: `new row for relation "events" violates check constraint "events_event_status_check"`,
        code: '23514',
        details: `Failing row contains (event_status='${eventStatus}').`,
        hint: `Valid values are: ${validStatuses.join(', ')}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Kiểm tra CHECK constraint: event_type chỉ có thể là các giá trị hợp lệ
 */
export function validateEventType(eventType: string): { valid: boolean; error?: any } {
  const validTypes = [
    'home_match',
    'away_match',
    'training',
    'other',
    'match',
    'social',
    'meeting',
  ];
  
  if (!validTypes.includes(eventType)) {
    return {
      valid: false,
      error: {
        message: `new row for relation "events" violates check constraint "events_event_type_check"`,
        code: '23514',
        details: `Failing row contains (event_type='${eventType}').`,
        hint: `Valid values are: ${validTypes.join(', ')}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Helper: Parse time string (HH:MM:SS) thành số giây
 */
function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

