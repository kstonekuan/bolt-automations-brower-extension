import type { BackgroundListenerMessage, NotificationSentMessage } from '../src/chrome-messages';
import type { ExtractedContent } from '../src/types';
import { generateSummary, sendDiscordNotification } from '../src/utils/api';
import { getSettings } from '../src/utils/storage';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message: BackgroundListenerMessage) => {
  if (message.action === 'processTaskCompletion') {
    handleTaskCompletion(message.content);
  } else if (message.action === 'testNotification') {
    handleTestNotification();
  }
  return true;
});

// Handle task completion
const handleTaskCompletion = async (content: ExtractedContent) => {
  try {
    // Get settings
    const settings = await getSettings();
    
    // Validate Discord webhook URL
    if (!settings.discordWebhookUrl) {
      throw new Error('Discord webhook URL is required');
    }

    // Generate content for notification
    let notificationContent: string;
    
    if (settings.anthropicApiKey) {
      // If API key is provided, generate summary
      notificationContent = await generateSummary(content);
    } else {
      // Otherwise, use the last Bolt message directly
      notificationContent = content.lastBoltMessage;
    }
    
    // Send notification to Discord
    await sendDiscordNotification(notificationContent);
    
    // Notify the popup of successful processing
    sendNotificationStatus({
      action: 'notificationSent',
      success: true
    });
  } catch (error) {
    console.error('Error handling task completion:', error);
    sendNotificationStatus({ 
      action: 'notificationSent',
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Handle test notification
const handleTestNotification = async () => {
  try {
    // Get settings
    const settings = await getSettings();
    
    // Validate Discord webhook URL
    if (!settings.discordWebhookUrl) {
      throw new Error('Discord webhook URL is required');
    }

    // Create dummy content for testing
    const dummyContent: ExtractedContent = {
      lastUserMessage: 'Test user message',
      lastBoltMessage: 'Test Bolt response',
      artifacts: [],
      pinnedMessages: []
    };

    // Generate content for notification
    let notificationContent: string;
    
    if (settings.anthropicApiKey) {
      // If API key is provided, generate summary
      notificationContent = await generateSummary(dummyContent);
    } else {
      // Otherwise, use the dummy Bolt message directly
      notificationContent = dummyContent.lastBoltMessage;
    }
    
    // Send notification to Discord
    await sendDiscordNotification(notificationContent);
    
    // Notify the popup of successful processing
    sendNotificationStatus({
      action: 'notificationSent',
      success: true
    });
  } catch (error) {
    console.error('Error testing notification:', error);
    sendNotificationStatus({ 
      action: 'notificationSent',
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Helper function to send notification status to popup
const sendNotificationStatus = (message: NotificationSentMessage) => {
  chrome.runtime.sendMessage(message);
};

// Initialize the extension when installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bolt Automations extension installed');
});