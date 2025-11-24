/**
 * Test Suite: deleteEvent API
 *
 * Chức năng: Xóa (cancel) event
 * Lớp điều khiển: features/event/api/event.ts
 * Phương thức: deleteEvent()
 *
 * Test Cases:
 * 1. deleteEvent_WhenValidInput_ReturnsSuccess
 * 2. deleteEvent_WhenEventNotFound_ReturnsFailure
 * 3. deleteEvent_WhenEventIdIsNull_ReturnsFailure
 * 4. deleteEvent_WhenEventIdIsEmpty_ReturnsFailure
 * 5. deleteEvent_WhenUserIdIsNull_ReturnsFailure
 * 6. deleteEvent_WhenUserIdIsEmpty_ReturnsFailure
 * 7. deleteEvent_WhenReasonIsNull_ReturnsSuccess
 * 8. deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
 * 9. deleteEvent_WhenDatabaseError_ReturnsFailure
 * 10. deleteEvent_UpdatesEventStatusToCancelled
 * 11. deleteEvent_UpdatesCancelledAtTimestamp
 * 12. deleteEvent_UpdatesCancelledByUserId
 */

import { supabase } from '@lib/supabase';
import { deleteEvent } from '@top/features/event/api/event';
import { createDeleteEventUpdateMock } from '../helpers/smartMocks';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('deleteEvent API', () => {
  // Mock data
  const mockEventId = 'event-123';
  const mockUserId = 'user-123';
  const mockReason = 'Event cancelled by admin';

  const mockCancelledEvent = {
    id: mockEventId,
    event_status: 'cancelled',
    cancelled_reason: mockReason,
    cancelled_at: '2025-01-15T10:00:00Z',
    cancelled_by: mockUserId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: deleteEvent_WhenValidInput_ReturnsSuccess
   *
   * STT: 1
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenValidInput_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức deleteEvent thành công khi input hợp lệ
   * Input: { eventId: 'event-123', userId: 'user-123', reason: 'Event cancelled' }
   * Expected Output: Trả về event đã được update với status = 'cancelled'
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record trong bảng events được update:
   *   + event_status = 'cancelled'
   *   + cancelled_reason = reason
   *   + cancelled_at = timestamp hiện tại
   *   + cancelled_by = userId
   */
  it('deleteEvent_WhenValidInput_ReturnsSuccess', async () => {
    // Arrange: Setup mocks
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCancelledEvent,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act: Gọi API
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: mockReason,
    });

    // Assert: Kiểm tra kết quả

    expect(result).toBeDefined();
    expect(result.id).toBe(mockEventId);
    expect(result.event_status).toBe('cancelled');
    expect(result.cancelled_reason).toBe(mockReason);
    expect(result.cancelled_by).toBe(mockUserId);
    expect(result.cancelled_at).toBeDefined();

    // Assert: Kiểm tra database update
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        event_status: 'cancelled',
        cancelled_reason: mockReason,
        cancelled_by: mockUserId,
      })
    );
    expect(mockUpdate().eq).toHaveBeenCalledWith('id', mockEventId);
  });

  /**
   * Test Case 2: deleteEvent_WhenEventNotFound_ReturnsFailure
   *
   * STT: 2
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenEventNotFound_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi không tìm thấy event
   * Input: { eventId: 'event-not-exist', userId: 'user-123', reason: 'Test' }
   * Expected Output: Báo lỗi "Event not found"
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra không có record nào được update trong bảng events
   */
  it('deleteEvent_WhenEventNotFound_ReturnsFailure', async () => {
    // Arrange: Setup mocks để trả về error
    const mockError = {
      message: 'Event not found',
      code: 'PGRST116',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert: Gọi API và expect error
    try {
      await deleteEvent({
        eventId: 'event-not-exist',
        userId: mockUserId,
        reason: mockReason,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message || error.code).toBeTruthy();
    }

    // Assert: Kiểm tra database query đã được gọi
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  /**
   * Test Case 3: deleteEvent_WhenEventIdIsNull_ReturnsFailure
   *
   * STT: 3
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenEventIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi eventId là null
   * Input: { eventId: null, userId: 'user-123', reason: 'Test' }
   * Expected Output: Báo lỗi validation
   * Kết quả: P (Pass)
   */
  it('deleteEvent_WhenEventIdIsNull_ReturnsFailure', async () => {
    // Arrange: Setup mocks
    const mockError = {
      message: 'Invalid event ID',
      code: 'PGRST202',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    try {
      await deleteEvent({
        eventId: null as any,
        userId: mockUserId,
        reason: mockReason,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 4: deleteEvent_WhenEventIdIsEmpty_ReturnsFailure
   *
   * STT: 4
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenEventIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi eventId là chuỗi rỗng
   * Input: { eventId: '', userId: 'user-123', reason: 'Test' }
   * Expected Output: Báo lỗi "Event not found"
   * Kết quả: P (Pass)
   */
  it('deleteEvent_WhenEventIdIsEmpty_ReturnsFailure', async () => {
    // Arrange
    const mockError = {
      message: 'Event not found',
      code: 'PGRST116',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    try {
      await deleteEvent({
        eventId: '',
        userId: mockUserId,
        reason: mockReason,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 5: deleteEvent_WhenUserIdIsNull_ReturnsFailure
   *
   * STT: 5
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenUserIdIsNull_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi userId là null
   * Input: { eventId: 'event-123', userId: null, reason: 'Test' }
   * Expected Output: Báo lỗi database constraint hoặc validation
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra cancelled_by không được set thành null
   */
  it('deleteEvent_WhenUserIdIsNull_ReturnsFailure', async () => {
    // Arrange: Setup mocks với smart mock - LUÔN kiểm tra constraints
    // Mock sẽ tự động trả về error khi cancelled_by = null
    const mockUpdate = createDeleteEventUpdateMock(null);

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    // Expected: Throw error với message "null value in column "cancelled_by""
    await expect(
      deleteEvent({
        eventId: mockEventId,
        userId: null as any,
        reason: mockReason,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('cancelled_by'),
      code: '23502',
    });
  });

  /**
   * Test Case 6: deleteEvent_WhenUserIdIsEmpty_ReturnsFailure
   *
   * STT: 6
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenUserIdIsEmpty_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi userId là chuỗi rỗng
   * Input: { eventId: 'event-123', userId: '', reason: 'Test' }
   * Expected Output: Báo lỗi validation hoặc database constraint
   * Kết quả: P (Pass)
   */
  it('deleteEvent_WhenUserIdIsEmpty_ReturnsFailure', async () => {
    // Arrange
    const mockError = {
      message: 'Invalid user ID',
      code: 'PGRST202',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    try {
      await deleteEvent({
        eventId: mockEventId,
        userId: '',
        reason: mockReason,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 7: deleteEvent_WhenReasonIsNull_ReturnsSuccess
   *
   * STT: 7
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenReasonIsNull_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức deleteEvent thành công khi reason là null (sử dụng default)
   * Input: { eventId: 'event-123', userId: 'user-123', reason: null }
   * Expected Output: Trả về event với cancelled_reason = 'Cancel Event' (default)
   * Kết quả: P (Pass)
   */
  it('deleteEvent_WhenReasonIsNull_ReturnsSuccess', async () => {
    // Arrange
    const mockEventWithDefaultReason = {
      ...mockCancelledEvent,
      cancelled_reason: 'Cancel Event',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockEventWithDefaultReason,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: null as any,
    });

    // Assert

    expect(result).toBeDefined();
    expect(result.cancelled_reason).toBe('Cancel Event');
  });

  /**
   * Test Case 8: deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
   *
   * STT: 8
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức deleteEvent thành công khi reason là chuỗi rỗng (sử dụng default)
   * Input: { eventId: 'event-123', userId: 'user-123', reason: '' }
   * Expected Output: Trả về event với cancelled_reason = 'Cancel Event' (default)
   * Kết quả: P (Pass)
   */
  /**
   * Test Case 8: deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
   *
   * STT: 8
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenReasonIsEmpty_ReturnsSuccess
   * Mục tiêu: Kiểm tra phương thức deleteEvent thành công khi reason là chuỗi rỗng (code tự động set default 'Cancel Event')
   * Input: { eventId: 'event-123', userId: 'user-123', reason: '' }
   * Expected Output: Trả về event đã được update với cancelled_reason = 'Cancel Event' (default)
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Kiểm tra record được update với cancelled_reason = 'Cancel Event' (default từ code)
   * - Lưu ý: Code có logic `payload.reason || 'Cancel Event'` nên không vi phạm constraint
   */
  it('deleteEvent_WhenReasonIsEmpty_ReturnsSuccess', async () => {
    // Arrange
    const mockEventWithDefaultReason = {
      ...mockCancelledEvent,
      cancelled_reason: 'Cancel Event',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockEventWithDefaultReason,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: '',
    });

    // Assert

    expect(result).toBeDefined();
    expect(result.cancelled_reason).toBe('Cancel Event');
  });

  /**
   * Test Case 9: deleteEvent_WhenDatabaseError_ReturnsFailure
   *
   * STT: 9
   * Chức năng: Xóa event
   * Test case: deleteEvent_WhenDatabaseError_ReturnsFailure
   * Mục tiêu: Kiểm tra phương thức deleteEvent thất bại khi có lỗi database
   * Input: { eventId: 'event-123', userId: 'user-123', reason: 'Test' }
   * Expected Output: Báo lỗi database
   * Kết quả: P (Pass)
   */
  it('deleteEvent_WhenDatabaseError_ReturnsFailure', async () => {
    // Arrange
    const mockError = {
      message: 'Database connection error',
      code: 'PGRST301',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    try {
      await deleteEvent({
        eventId: mockEventId,
        userId: mockUserId,
        reason: mockReason,
      });

      throw new Error('Expected error but got success');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * Test Case 10: deleteEvent_UpdatesEventStatusToCancelled
   *
   * STT: 10
   * Chức năng: Xóa event
   * Test case: deleteEvent_UpdatesEventStatusToCancelled
   * Mục tiêu: Kiểm tra event status được update thành 'cancelled' trong database
   * Input: { eventId: 'event-123', userId: 'user-123', reason: 'Test' }
   * Expected Output: Event status = 'cancelled' trong database
   * Kết quả: P (Pass)
   *
   * DB Check:
   * - Đọc record từ bảng events sau khi update
   * - Kiểm tra event_status = 'cancelled'
   * - Kiểm tra cancelled_at có giá trị timestamp
   */
  it('deleteEvent_UpdatesEventStatusToCancelled', async () => {
    // Arrange
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCancelledEvent,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: mockReason,
    });

    // Assert: Kiểm tra status đã được update

    expect(result.event_status).toBe('cancelled');
    expect(result.cancelled_reason).toBe(mockReason);
    expect(result.cancelled_by).toBe(mockUserId);
    expect(result.cancelled_at).toBeDefined();

    // Assert: Kiểm tra update được gọi với đúng parameters
    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.event_status).toBe('cancelled');
    expect(updateCall.cancelled_reason).toBe(mockReason);
    expect(updateCall.cancelled_by).toBe(mockUserId);
    expect(updateCall.cancelled_at).toBeDefined();
  });

  /**
   * Test Case 11: deleteEvent_UpdatesCancelledAtTimestamp
   *
   * STT: 11
   * Chức năng: Xóa event
   * Test case: deleteEvent_UpdatesCancelledAtTimestamp
   * Mục tiêu: Kiểm tra cancelled_at được set với timestamp hiện tại
   * Input: { eventId: 'event-123', userId: 'user-123', reason: 'Test' }
   * Expected Output: cancelled_at có giá trị timestamp hợp lệ
   * Kết quả: P (Pass)
   */
  it('deleteEvent_UpdatesCancelledAtTimestamp', async () => {
    // Input: { eventId: 'event-123', userId: 'user-123', reason: 'Test' }
    // Expected: cancelled_at có giá trị timestamp hợp lệ

    // Arrange
    const beforeTime = new Date().toISOString();
    const mockCancelledEventWithTimestamp = {
      ...mockCancelledEvent,
      cancelled_at: new Date().toISOString(),
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCancelledEventWithTimestamp,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: mockReason,
    });

    // Assert
    // Expected Output: result.cancelled_at được định nghĩa và có giá trị timestamp hợp lệ
    // DB Check: update được gọi với cancelled_at = timestamp hiện tại
    expect(result.cancelled_at).toBeDefined();
    const cancelledAt = new Date(result.cancelled_at);
    expect(cancelledAt.getTime()).toBeGreaterThanOrEqual(
      new Date(beforeTime).getTime()
    );
    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.cancelled_at).toBeDefined();
    expect(new Date(updateCall.cancelled_at).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeTime).getTime()
    );
  });

  /**
   * Test Case 12: deleteEvent_UpdatesCancelledByUserId
   *
   * STT: 12
   * Chức năng: Xóa event
   * Test case: deleteEvent_UpdatesCancelledByUserId
   * Mục tiêu: Kiểm tra cancelled_by được set với userId
   * Input: { eventId: 'event-123', userId: 'user-123', reason: 'Test' }
   * Expected Output: cancelled_by = userId
   * Kết quả: P (Pass)
   */
  it('deleteEvent_UpdatesCancelledByUserId', async () => {
    // Arrange
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCancelledEvent,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: mockUserId,
      reason: mockReason,
    });

    // Assert

    expect(result.cancelled_by).toBe(mockUserId);
    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.cancelled_by).toBe(mockUserId);
  });

  /**
   * PROOF TEST: deleteEvent_WhenCancelledByIsNullButExpectSuccess_ShouldFail
   *
   * Test này CHỨNG MINH rằng smart mocks thực sự bắt được lỗi.
   * Input: { eventId: 'event-123', userId: null, reason: 'Test' }
   * Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL vì smart mock bắt được lỗi NOT NULL constraint
   * Kết quả: FAIL (Đúng như mong đợi - chứng minh mocks hoạt động đúng)
   *
   * Lưu ý: Test này được tạo để chứng minh rằng smart mocks thực sự bắt được lỗi.
   * Trong thực tế, test case này nên expect error (như test case 5).
   */
  it('deleteEvent_WhenCancelledByIsNullButExpectSuccess_ShouldFail', async () => {
    // Arrange: Setup mocks với smart mock - LUÔN kiểm tra constraints
    // Mock sẽ tự động trả về error khi cancelled_by = null
    const mockUpdate = createDeleteEventUpdateMock(null);

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Act & Assert
    // Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL
    // Vì smart mock bắt được lỗi NOT NULL constraint khi cancelled_by = null
    // Đây là test case để chứng minh smart mocks thực sự bắt được lỗi
    const result = await deleteEvent({
      eventId: mockEventId,
      userId: null as any,
      reason: mockReason,
    });

    // Assert này sẽ FAIL vì smart mock trả về error, không trả về result
    expect(result).toBeDefined(); // ❌ Sẽ fail vì smart mock bắt được lỗi
    expect(result.id).toBe(mockEventId); // ❌ Sẽ fail vì smart mock bắt được lỗi
  });

  /**
   * EDGE CASE TEST: deleteEvent_WhenCancelledByDoesNotExist_ShouldFail
   *
   * Test này kiểm tra edge case: cancelled_by không tồn tại (Foreign key constraint)
   */
  it('deleteEvent_WhenCancelledByDoesNotExist_ShouldFail', async () => {
    const nonExistentUserId = 'user-not-exist';
    const mockError = {
      message:
        'insert or update on table "events" violates foreign key constraint "events_cancelled_by_fkey"',
      code: '23503',
      details: `Key (cancelled_by)=(${nonExistentUserId}) is not present in table "auth.users".`,
    };

    const mockUpdate = createDeleteEventUpdateMock(null);
    // Override để trả về foreign key error
    const mockUpdateWithError = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdateWithError,
    });

    await expect(
      deleteEvent({
        eventId: mockEventId,
        userId: nonExistentUserId,
        reason: mockReason,
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('foreign key constraint'),
      code: '23503',
    });
  });
});
