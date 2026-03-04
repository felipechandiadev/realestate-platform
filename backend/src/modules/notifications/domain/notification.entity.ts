// Domain entity (pure, no decorators or ORM dependencies)
export class Notification {
  id: string;
  senderType: NotificationSenderType;
  senderId?: string | null;
  senderName: string;
  isSystem: boolean;
  message: string;
  targetUserIds: string[];
  type: NotificationType;
  targetMails?: string[];
  status: NotificationStatus;
  interestedUserEmail?: string | null;
  interestedUserName?: string | null;
  interestedUserPhone?: string | null;
  interestedUserMessage?: string | null;
  firstViewerId?: string | null;
  firstViewedAt?: Date | null;
  multimediaId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export enum NotificationType {
  INTEREST = 'INTEREST',
  CONTACT = 'CONTACT',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  PUBLICATION_STATUS_CHANGE = 'PUBLICATION_STATUS_CHANGE',
  CONTRACT_STATUS_CHANGE = 'CONTRACT_STATUS_CHANGE',
  PROPERTY_AGENT_ASSIGNMENT = 'PROPERTY_AGENT_ASSIGNMENT',
  PROPERTY_PUBLICATION_REQUEST = 'PROPERTY_PUBLICATION_REQUEST',
}

export enum NotificationStatus {
  SEND = 'SEND',
  OPEN = 'OPEN',
}

export enum NotificationSenderType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ANONYMOUS = 'ANONYMOUS',
}
