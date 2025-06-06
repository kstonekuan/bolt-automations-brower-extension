import { Settings } from '../types';

/**
 * Get settings from chrome storage
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    const result = await chrome.storage.sync.get(['anthropicApiKey', 'discordWebhookUrl', 'autoDiscussMode']);
    return {
      anthropicApiKey: result.anthropicApiKey || '',
      discordWebhookUrl: result.discordWebhookUrl || '',
      autoDiscussMode: result.autoDiscussMode ?? false // Default to false
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      anthropicApiKey: '',
      discordWebhookUrl: '',
      autoDiscussMode: false
    };
  }
};

/**
 * Save settings to chrome storage
 */
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await chrome.storage.sync.set(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

/**
 * Validate if all required settings are present
 */
export const validateSettings = async (): Promise<boolean> => {
  const settings = await getSettings();
  return !!settings.discordWebhookUrl; // Only Discord webhook is required
};