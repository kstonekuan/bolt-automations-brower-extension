import { extractContentFromPage } from '../src/utils/dom-parser';
import { getSettings } from '../src/utils/storage';

// Flag to track if we're currently processing a notification
let isProcessing = false;

// Flag to track if the stop icon has appeared
let stopIconHasAppeared = false;

// Flag to track if we're currently in a task
let isTaskInProgress = false;

// Check if stop button exists in the DOM
const checkForStopButton = (): boolean => {
  return !!document.querySelector('button:has(div[class*="i-ph:stop-circle-bold"])') ||
         !!document.querySelector('button div[class*="i-ph:stop-circle-bold"]');
};

// Find and click the discuss mode button
const setDiscussMode = async () => {
  const settings = await getSettings();
  if (!settings.autoDiscussMode) return;

  const button = document.querySelector('button[aria-label="Toggle mode"]');
  if (button) {
    const isDiscussMode = button.classList.contains('text-bolt-elements-item-contentAccent!');
    if (!isDiscussMode) {
      console.log('Bolt Automations: Enabling discuss mode...');
      (button as HTMLButtonElement).click();
    }
  }
};

// Start observing DOM changes
const startObserver = () => {
  console.log('Bolt Automations: Starting observer');

  // Create an observer instance
  const observer = new MutationObserver(() => {
    // Only process if we're not already processing
    if (isProcessing) return;

    // Get current state of stop button
    const stopButtonPresent = checkForStopButton();

    // Update task state based on stop button presence
    if (stopButtonPresent && !isTaskInProgress) {
      console.log('Bolt Automations: Task started - Stop button detected');
      isTaskInProgress = true;
      stopIconHasAppeared = true;
    } else if (!stopButtonPresent && isTaskInProgress) {
      console.log('Bolt Automations: Task completed - Stop button removed');
      isTaskInProgress = false;
      if (stopIconHasAppeared) {
        stopIconHasAppeared = false;
        processTaskCompletion();
      }
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: true,
    attributeFilter: ['class'],
    characterData: false 
  });

  return observer;
};

// Process task completion
const processTaskCompletion = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    console.log('Bolt Automations: Task completion detected');
    
    // Wait a short moment for the DOM to settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set discuss mode if enabled
    await setDiscussMode();
    
    // Extract content from the page
    const content = extractContentFromPage();
    
    // Send the content to the background script
    chrome.runtime.sendMessage({
      action: 'processTaskCompletion',
      content
    });
  } catch (error) {
    console.error('Error processing task completion:', error);
  } finally {
    // Reset the processing flag after a delay to prevent multiple triggers
    setTimeout(() => {
      isProcessing = false;
    }, 2000);
  }
};

// Initialize the extension when the content script loads
const initialize = () => {
  // Only run on bolt.new
  if (!window.location.hostname.includes('bolt.new')) {
    return;
  }

  // Check initial state
  const stopButtonPresent = checkForStopButton();
  if (stopButtonPresent) {
    console.log('Bolt Automations: Stop button found during initialization');
    isTaskInProgress = true;
    stopIconHasAppeared = true;
  }

  // Start observing DOM changes
  startObserver();

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.action === 'getPageContent') {
      const content = extractContentFromPage();
      sendResponse({ content });
    }
    return true;
  });
};

// Run the initialization
initialize();