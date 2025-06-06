import { ExtractedContent } from './types';

export interface ProcessTaskCompletionMessage {
  action: 'processTaskCompletion';
  content: ExtractedContent;
}

export interface NotificationSentMessage {
  action: 'notificationSent';
  success: boolean;
  error?: string;
}

export interface GetPageContentMessage {
  action: 'getPageContent';
}

export interface TestNotificationMessage {
  action: 'testNotification';
}

export type BackgroundListenerMessage = 
  | ProcessTaskCompletionMessage 
  | GetPageContentMessage
  | TestNotificationMessage;

export type PopupListenerMessage = NotificationSentMessage;