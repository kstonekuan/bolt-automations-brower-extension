import { AnthropicRequest, AnthropicResponse, DiscordWebhookMessage, ExtractedContent } from '../types';
import { getSettings } from './storage';

/**
 * Generate a summary using Anthropic API
 */
export const generateSummary = async (content: ExtractedContent): Promise<string> => {
  const settings = await getSettings();
  
  if (!settings.anthropicApiKey) {
    throw new Error('Anthropic API key not set');
  }

  // Create prompt for Anthropic
  const prompt = createAnthropicPrompt(content);
  
  // Prepare the request
  const request: AnthropicRequest = {
    model: 'claude-3-haiku-20240307',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as AnthropicResponse;
    return data.content[0].text;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

/**
 * Send a message to Discord webhook
 */
export const sendDiscordNotification = async (summary: string): Promise<void> => {
  const settings = await getSettings();
  
  if (!settings.discordWebhookUrl) {
    throw new Error('Discord webhook URL not set');
  }

  const message: DiscordWebhookMessage = {
    content: formatDiscordMessage(summary)
  };

  try {
    const response = await fetch(settings.discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
};

/**
 * Create prompt for Anthropic
 */
const createAnthropicPrompt = (content: ExtractedContent): string => {
  const { lastUserMessage, lastBoltMessage, artifacts, pinnedMessages } = content;
  
  let prompt = `Based on the following information from a Bolt session, provide a concise summary of the task's outcome, highlight any errors or issues, and state what user input is currently awaited.\n\n`;
  
  prompt += `User's last message:\n${lastUserMessage}\n\n`;
  prompt += `Bolt's last response:\n${lastBoltMessage}\n\n`;
  
  if (artifacts.length > 0) {
    prompt += `Artifacts and their actions:\n`;
    artifacts.forEach(artifact => {
      prompt += `- ${artifact.title}\n`;
      artifact.actions.forEach(action => {
        prompt += `  - ${action.type} ${action.target}: ${action.status}\n`;
      });
    });
    prompt += '\n';
  }
  
  if (pinnedMessages.length > 0) {
    prompt += `Pinned messages:\n`;
    pinnedMessages.forEach(message => {
      prompt += `- [${message.type}] ${message.heading}: ${message.content}\n`;
    });
  }
  
  return prompt;
};

/**
 * Format message for Discord
 */
const formatDiscordMessage = (summary: string): string => {
  // Discord markdown formatting
  return `### Bolt Task Completed\n${summary}`;
};