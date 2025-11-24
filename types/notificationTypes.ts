// Notification enum types for type safety

export enum NotificationType {
  EVENT_SQUADS = 'event.squad_selected',
  EVENT_CREATE = 'event.created',
  EVENT_INVITE = 'event.invite',
  EVENT_REMINDER = 'event.reminder',
  EVENT_CANCEL = 'event.cancelled',
  EVENT_UPDATED = 'event.updated',
  EVENT_RESPONSE = 'event.response',
  EVENT_SQUAD = 'event.squad',
  PAYMENT_DUE = 'payment.overdue',
  PAYMENT_REMINDER = 'payment.reminder',
  PAYMENT_UPDATED = 'payment.updated',
  PAYMENT_CANCEL = 'payment.cancelled',
  PAYMENT_PAID = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_REQUESTED = 'payment.requested',
  MEMBER_INTEREST = 'member.interest',
  MEMBER_APPROVE = 'member.approved',
  MEMBER_DECLINE = 'member.decline',
  MEMBER_REMOVE = 'member.removed',
  ADMIN_ADD = 'admin.add',
  ADMIN_ACCEPT = 'admin.accept',
  ADMIN_REJECT = 'admin.reject',
  ADMIN_REMOVE = 'admin.remove',
}

export enum DeliveryMethod {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum NotificationCategory {
  EVENT = 'event',
  PAYMENT = 'payment',
  MEMBER = 'member',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export enum TemplateType {
  EVENT = 'event',
  PAYMENT = 'payment',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

// Type-safe notification template interface
export interface NotificationTemplate {
  id: string;
  type: TemplateType;
  trigger: string;
  title: string;
  body: string;
  variables: string[];
  actions: NotificationAction[];
  priority: NotificationPriority;
  category: NotificationCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  action: string;
  deepLink?: string;
}

export interface ProcessedNotification {
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: {
    actions: NotificationAction[];
    category: NotificationCategory;
    type: TemplateType;
  };
}

export interface getInsertNotificationInput {
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  data?: Record<string, any>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  priority?: NotificationPriority;
  deliveryMethod?: DeliveryMethod;
  deliveryStatus?: DeliveryStatus;
  expiresAt?: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  priority?: NotificationPriority | null;
  deliveryMethod?: DeliveryMethod | null;
  deliveryStatus?: DeliveryStatus | null;
  deliveryAttempts?: number | null;
  lastDeliveryAttempt?: string | null;
  isRead?: boolean | null;
  readAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}
