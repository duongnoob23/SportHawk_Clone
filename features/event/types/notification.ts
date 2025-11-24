export type GetNotificationType = {
  userId: string;
  trigger: string;
  variables: Record<string, any>;
  relatedEntityType: string;
  relatedEntityId: string;
};

export type EventEditSelectSquadNotificationType = {
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTitle:string;
};

export type EventDetailsResponseNotificationType = {
  userId: string;
  playerName: string;
  availabilityStatus: string;
  eventName: string;
  eventDate: string;
  eventId: string;
  eventTitle:string;
};

export type EventEditCancelNotificationType = {
  userId?: string;
  eventName?: string;
  cancellationReason?: string;
  eventDate?: string;
  eventId?: string;
  eventTitle?:string;
};

export type EventEditUpdateNotificationType = {
  userId?: string;
  eventName?: string;
  updateReason?: string;
  eventDate?: string;
  eventTime?: string;
  eventId?: string;
  eventTitle?:string;
};

export type PaymentCreateNotificationType = {
  userId?: string;
  amount: number;
  description?: string;
  daysOverdue: number;
  paymentId?: string;
  paymentTitle?:string;
  clubName?:string;
};

export type PaymentUpdateNotificationType = {
  userId: string;
  amount: number;
  description: string;
  paymentTitle: string;
  paymentId: string;
  updateReason: string;
};

export type PaymentFailNotificationType = {
  userId: string;
  amount: number;
  description: string;
  paymentId: string;
  reason: string;
  paymentTitle:string;
};

export type PaymentSuccessNotificationType = {
  userId: string;
  amount: number;
  description: string;
  paymentId: string;
  paymentTitle:string;
};

export type PaymentCancelNotificationType = {
  userId: string;
  clubName: string;
  paymentTitle: string;
  paymentId: string;
};

export type MemberApprovedtNotificationType = {
  clubName: string;
  teamName: string;
  userId: string;
};

export type MemberInteresttNotificationType = {
  clubName: string;
  teamName: string;
  userId: string;
  newMemberName: string;
};

export type MemberRemovedtNotificationType = {
  clubName: string;
  teamName: string;
  userId: string;
};

export type PaymentReceivedNotificatioType = {
  memberFullName: string;
  amount: number;
  paymentTitle: string;
  paymentId: string;
  userId: string;
};

export type EventCreateNotificationType = {
  eventType: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventId: string;
  userId: string;
  eventTitle:string;
};
