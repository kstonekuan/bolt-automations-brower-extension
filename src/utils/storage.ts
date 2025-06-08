import { Settings } from '../types';

/**
 * Get settings from chrome storage
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    const result = await chrome.storage.sync.get([
      'apiProvider',
      'anthropicApiKey', 
      'geminiApiKey',
      'openaiApiKey',
      'discordWebhookUrl', 
      'autoDiscussMode'
    ]);
    
    return {
      apiProvider: result.apiProvider || 'anthropic',
      anthropicApiKey: result.anthropicApiKey || '',
      geminiApiKey: result.geminiApiKey || '',
      openaiApiKey: result.openaiApiKey || '',
      discordWebhookUrl: result.discordWebhookUrl || '',
      autoDiscussMode: result.autoDiscussMode ?? false
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      apiProvider: 'anthropic',
      anthropicApiKey: '',
      geminiApiKey: '',
      openaiApiKey: '',
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
  
  // Discord webhook is always required
  if (!settings.discordWebhookUrl) {
    return false;
  }
  
  // Check if the selected provider has its API key
  switch (settings.apiProvider) {
    case 'anthropic':
      return !!settings.anthropicApiKey;
    case 'gemini':
      return !!settings.geminiApiKey;
    case 'openai':
      return !!settings.openaiApiKey;
    default:
      return false;
  }
};