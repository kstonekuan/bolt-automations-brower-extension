import { ArtifactAction, ArtifactInfo, ExtractedContent, PinnedMessage } from '../types';

/**
 * Extract content from the Bolt page
 */
export const extractContentFromPage = (): ExtractedContent => {
  // Initialize the result object
  const result: ExtractedContent = {
    lastUserMessage: '',
    lastBoltMessage: '',
    artifacts: [],
    pinnedMessages: []
  };

  try {
    // Find the main chat section
    const chatSection = document.querySelector('section[aria-label="Chat"]');
    if (!chatSection) {
      console.warn('Chat section not found');
      return result;
    }

    // Extract the last user message
    result.lastUserMessage = extractLastUserMessage(chatSection);

    // Extract the last Bolt message
    const { message, artifacts } = extractLastBoltMessage(chatSection);
    result.lastBoltMessage = message;
    result.artifacts = artifacts;

    // Extract pinned messages
    result.pinnedMessages = extractPinnedMessages();

    return result;
  } catch (error) {
    console.error('Error extracting content from page:', error);
    return result;
  }
};

/**
 * Extract the last user message
 */
const extractLastUserMessage = (chatSection: Element): string => {
  try {
    // Find all user messages (typically have 'self-end' class)
    const userMessages = chatSection.querySelectorAll('div[data-message-id].self-end');
    if (userMessages.length === 0) return '';

    // Get the last user message
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // Find the markdown content within the message
    const markdownContent = lastUserMessage.querySelector('div[class*="_MarkdownContent_"]');
    return markdownContent ? markdownContent.textContent || '' : '';
  } catch (error) {
    console.error('Error extracting last user message:', error);
    return '';
  }
};

/**
 * Extract the last Bolt message and its artifacts
 */
const extractLastBoltMessage = (chatSection: Element): { message: string, artifacts: ArtifactInfo[] } => {
  try {
    // Find all Bolt messages (containing h3 with text "Bolt")
    const boltMessages = Array.from(chatSection.querySelectorAll('div[data-message-id]')).filter(div => {
      const h3 = div.querySelector('h3');
      return h3 && h3.textContent?.trim() === 'Bolt';
    });

    if (boltMessages.length === 0) return { message: '', artifacts: [] };

    // Get the last Bolt message
    const lastBoltMessage = boltMessages[boltMessages.length - 1];
    
    // Find the markdown content within the message
    const markdownContent = lastBoltMessage.querySelector('div[class*="_MarkdownContent_"]');
    const message = markdownContent ? markdownContent.textContent || '' : '';
    
    // Extract artifacts from the message
    const artifactsElements = lastBoltMessage.querySelectorAll('div.collapsible.artifact, div[class*="collapsible"][class*="artifact"]');
    const artifacts = Array.from(artifactsElements).map(extractArtifactInfo);
    
    return { message, artifacts };
  } catch (error) {
    console.error('Error extracting last Bolt message:', error);
    return { message: '', artifacts: [] };
  }
};

/**
 * Extract information from an artifact element
 */
const extractArtifactInfo = (artifactElement: Element): ArtifactInfo => {
  try {
    // Extract the artifact title
    const titleElement = artifactElement.querySelector('div.p-5.pl-0.grow.font-medium, div[class*="p-5"][class*="pl-0"][class*="grow"][class*="font-medium"]');
    const title = titleElement ? titleElement.textContent?.trim() || 'Unnamed Artifact' : 'Unnamed Artifact';
    
    // Extract actions from the artifact
    const actionsContainer = artifactElement.querySelector('div.actions, div[class*="actions"]');
    const actionElements = actionsContainer ? actionsContainer.querySelectorAll('li') : [];
    
    const actions = Array.from(actionElements).map(extractActionInfo);
    
    return { title, actions };
  } catch (error) {
    console.error('Error extracting artifact info:', error);
    return { title: 'Error extracting artifact', actions: [] };
  }
};

/**
 * Extract information from an action element
 */
const extractActionInfo = (actionElement: Element): ArtifactAction => {
  try {
    // Get the action text to determine type
    const actionText = actionElement.textContent || '';
    
    // Determine action type based on text
    let type = 'Unknown';
    if (actionText.includes('Create')) type = 'Create';
    else if (actionText.includes('Update')) type = 'Update';
    else if (actionText.includes('Run command')) type = 'Run command';
    else if (actionText.includes('Start')) type = 'Start application';
    
    // Extract the target (filename or command)
    const codeElement = actionElement.querySelector('code');
    const target = codeElement ? codeElement.textContent || '' : '';
    
    // Determine status based on icon
    let status: "success" | "error" | "pending" = "pending";
    if (actionElement.querySelector('i.i-ph\\:check, div.i-ph\\:check, [class*="i-ph:check"]')) {
      status = "success";
    } else if (actionElement.querySelector('i.i-ph\\:x, div.i-ph\\:x, [class*="i-ph:x"]')) {
      status = "error";
    }
    
    return { type, target, status };
  } catch (error) {
    console.error('Error extracting action info:', error);
    return { type: 'Unknown', target: '', status: 'error' };
  }
};

/**
 * Extract pinned messages from the page
 */
const extractPinnedMessages = (): PinnedMessage[] => {
  try {
    const pinnedElements = document.querySelectorAll('div.pinned-message, div[class*="pinned-message"]');
    
    return Array.from(pinnedElements).map(element => {
      // Extract heading
      const headingElement = element.querySelector('h4');
      const heading = headingElement ? headingElement.textContent || '' : '';
      
      // Extract content
      const contentElement = element.querySelector('p');
      const content = contentElement ? contentElement.textContent || '' : '';
      
      // Determine type based on icons
      let type: "success" | "warning" | "error" | "info" = "info";
      if (element.querySelector('[class*="i-ph:check"]')) {
        type = "success";
      } else if (element.querySelector('[class*="i-ph:warning"]')) {
        type = "warning";
      } else if (element.querySelector('[class*="i-ph:x"]')) {
        type = "error";
      }
      
      return { heading, content, type };
    });
  } catch (error) {
    console.error('Error extracting pinned messages:', error);
    return [];
  }
};