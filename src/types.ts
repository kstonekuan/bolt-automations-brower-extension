/**
 * Types for the Bolt Automations extension
 */

export interface Settings {
  anthropicApiKey?: string; // Made optional
  discordWebhookUrl: string;
  autoDiscussMode: boolean; // Added auto-discuss mode setting
}

export interface ExtractedContent {
  lastUserMessage: string;
  lastBoltMessage: string;
  artifacts: ArtifactInfo[];
  pinnedMessages: PinnedMessage[];
}

export interface ArtifactInfo {
  title: string;
  actions: ArtifactAction[];
}

export interface ArtifactAction {
  type: string; // "Create", "Update", "Run command", "Start application"
  target: string; // Filename or command
  status: "success" | "error" | "pending";
}

export interface PinnedMessage {
  heading: string;
  content: string;
  type: "success" | "warning" | "error" | "info";
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
}

export interface AnthropicResponse {
  content: [{
    text: string;
    type: "text";
  }];
  id: string;
  model: string;
  role: "assistant";
}

export interface DiscordWebhookMessage {
  content: string;
}