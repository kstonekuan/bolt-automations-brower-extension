import {
  AnthropicRequest,
  AnthropicResponse,
  DiscordWebhookMessage,
  ExtractedContent,
  GeminiRequest,
  GeminiResponse,
  OpenAIRequest,
  OpenAIResponse
} from '../types';
import { getSettings } from './storage';

// Model constants
const ANTHROPIC_MODEL = 'claude-3-haiku-20240307';
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const OPENAI_MODEL = 'gpt-4.1-nano';

// Discord constants
const DISCORD_MAX_LENGTH = 2000; // Discord's message character limit

/**
 * Generate a summary using the selected API provider
 */
export const generateSummary = async (content: ExtractedContent): Promise<string> => {
  const settings = await getSettings();
  
  // Check if any API key is configured
  const hasApiKey = settings.anthropicApiKey || settings.geminiApiKey || settings.openaiApiKey;
  
  if (!hasApiKey) {
    throw new Error('No API key configured for any provider');
  }

  // Route to the appropriate provider
  console.log(`Using ${settings.apiProvider} API for summary generation`);
  
  switch (settings.apiProvider) {
    case 'anthropic':
      if (!settings.anthropicApiKey) {
        throw new Error('Anthropic API key not set');
      }
      return generateAnthropicSummary(content, settings.anthropicApiKey);
    
    case 'gemini':
      if (!settings.geminiApiKey) {
        throw new Error('Gemini API key not set');
      }
      return generateGeminiSummary(content, settings.geminiApiKey);
    
    case 'openai':
      if (!settings.openaiApiKey) {
        throw new Error('OpenAI API key not set');
      }
      return generateOpenAISummary(content, settings.openaiApiKey);
    
    default:
      throw new Error(`Unknown API provider: ${settings.apiProvider}`);
  }
};

/**
 * Generate summary using Anthropic Claude API
 */
const generateAnthropicSummary = async (content: ExtractedContent, apiKey: string): Promise<string> => {
  const prompt = createPrompt(content);
  
  const request: AnthropicRequest = {
    model: ANTHROPIC_MODEL,
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
        'x-api-key': apiKey,
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
    console.error('Error generating Anthropic summary:', error);
    throw error;
  }
};

/**
 * Generate summary using Google Gemini API
 */
const generateGeminiSummary = async (content: ExtractedContent, apiKey: string): Promise<string> => {
  const prompt = createPrompt(content);
  
  const request: GeminiRequest = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating Gemini summary:', error);
    throw error;
  }
};

/**
 * Generate summary using OpenAI API
 */
const generateOpenAISummary = async (content: ExtractedContent, apiKey: string): Promise<string> => {
  const prompt = createPrompt(content);
  
  const request: OpenAIRequest = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes task outcomes from development sessions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating OpenAI summary:', error);
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
 * Create a unified prompt for all providers
 */
const createPrompt = (content: ExtractedContent): string => {
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
  let message = `### Bolt Task Completed\n${summary}`;
  
  // Truncate if message exceeds Discord's limit
  if (message.length > DISCORD_MAX_LENGTH) {
    const truncationNotice = '\n\n... (truncated)';
    const maxContentLength = DISCORD_MAX_LENGTH - truncationNotice.length;
    message = message.substring(0, maxContentLength) + truncationNotice;
  }
  
  return message;
};