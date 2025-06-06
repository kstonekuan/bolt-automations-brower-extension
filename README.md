# Bolt Automations by Squash

A browser extension designed to automate task monitoring on `bolt.new` and send intelligent notifications to Discord. This extension helps you stay updated on your Bolt tasks without constantly checking the interface, by leveraging AI-powered summaries and Discord webhooks.

## Features

- **Automated Task Completion Notifications**: Get notified on Discord when a Bolt task completes.
- **AI-Powered Summaries**: (Optional) Use your Anthropic API key to generate concise, AI-powered summaries of Bolt's responses, including task outcomes, errors, and awaited user input.
- **Direct Bolt Message Notifications**: If no Anthropic API key is provided, the extension will send Bolt's last message directly to Discord.
- **Auto-enable Discuss Mode**: Automatically switches Bolt to discuss mode after task completion, helping to save tokens.
- **Test Notification**: Easily test your Discord webhook setup directly from the extension's popup.
- **Local Storage**: All API keys and webhook URLs are stored securely and locally in your browser, never sent to external servers.

## Prerequisites

- A modern web browser (e.g., Chrome, Brave, Edge) that supports Chrome extensions.
- A Discord server and channel where you can create a webhook.
- (Optional) An Anthropic API key for AI-powered summaries.

## Installation

Follow these steps to install the extension in your browser:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kstonekuan/bolt-automations-brower-extension.git
   cd bolt-automations-browser-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   This will create a `dist` directory containing the build files.

4. **Load the extension in your browser**:
   - Open your browser and navigate to the Extensions management page.
     - For Chrome/Brave/Edge: Type `chrome://extensions` (or `brave://extensions`, `edge://extensions`) in the address bar and press Enter.
   - Enable **Developer mode** (usually a toggle switch in the top-right corner).
   - Click on **Load unpacked**.
   - Navigate to the cloned repository directory and select the `dist` folder.
   - The "Bolt Automations by Squash" extension should now appear in your list of installed extensions.

## Usage

After installation, click on the extension icon in your browser toolbar to open the popup.

### Settings Guide

All API keys and webhook URLs are stored locally in your browser and are never sent to any external servers.

- **Auto-enable Discuss Mode**:
  - **Purpose**: Automatically switches Bolt to discuss mode after task completion. This can help in managing token usage by ensuring Bolt is in a less "active" state when a task is done.
  - **How to use**: Check the checkbox to enable this feature.

- **Discord Webhook URL (Notifications)**:
  - **Purpose**: This is the destination for all your task completion notifications.
  - **How to get it**:
    1. In your Discord server, go to **Server Settings** > **Integrations**.
    2. Click on **Webhooks** > **New Webhook**.
    3. Give it a name (e.g., "Bolt Notifications") and select the channel where you want messages to appear.
    4. Copy the generated **Webhook URL**.
    5. Paste this URL into the "Discord Webhook URL" field in the extension popup.
  - **Format**: `https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN`

- **Anthropic API Key (AI Summaries)**:
  - **Purpose**: When provided, the extension will use this key to generate AI-powered summaries of Bolt's responses for richer Discord notifications. If not provided, only Bolt's last message will be sent.
  - **How to get it**:
    1. Sign up or log in to your Anthropic account.
    2. Navigate to your API keys section (usually in your account settings or dashboard).
    3. Generate a new API key.
    4. Paste this key into the "Anthropic API Key" field in the extension popup.
  - **Format**: `sk-ant-api...`

### Saving and Testing

- **Save Settings**: After entering your desired settings, click the "Save Settings" button to store them locally in your browser.
- **Test Notification**: Click the "Test Notification" button to send a dummy notification to your configured Discord webhook. This is useful for verifying your setup.

## How It Works

1. **Task Detection**: The extension monitors the Bolt interface for task completion by watching for the appearance and disappearance of the stop button.
2. **Content Extraction**: When a task completes, it extracts relevant information including:
   - Your last message to Bolt
   - Bolt's response
   - Artifact information (files created/modified)
   - Any pinned messages or errors
3. **AI Processing** (Optional): If an Anthropic API key is provided, the extracted content is sent to Claude for summarization.
4. **Discord Notification**: The summary (or raw Bolt message) is sent to your configured Discord webhook.
5. **Auto Discuss Mode**: If enabled, the extension automatically switches Bolt to discuss mode to help save tokens.

## Troubleshooting

- **No Discord Notifications**:
  - Ensure the "Discord Webhook URL" is correctly entered and saved.
  - Test the notification using the "Test Notification" button in the popup. If the test fails, double-check your webhook URL in Discord.
  - Verify that the extension has the necessary permissions (check `chrome://extensions` > "Bolt Automations by Squash" > "Details" > "Site access").
  - Ensure you are on `bolt.new` for the content script to activate.
  - Check your browser's console (F12) for any errors related to the extension.

- **AI Summaries Not Working**:
  - Ensure your "Anthropic API Key" is correctly entered and saved.
  - Verify that your Anthropic API key is active and has sufficient credits.
  - Check the browser's console for any errors related to the Anthropic API calls.

- **Extension Not Detecting Task Completion**:
  - Ensure the extension is enabled in `chrome://extensions`.
  - Refresh the `bolt.new` page after installing or updating the extension.
  - The extension relies on specific DOM elements on `bolt.new`. If the Bolt UI changes significantly, the extension might need an update.

## Development

To contribute or develop locally:

1. Clone the repository.
2. Install dependencies (`npm install`).
3. Run `npm run dev` for development with hot-reloading (for popup changes).
4. For content script changes, you'll need to run `npm run build` and then reload the extension in `chrome://extensions` (click the refresh icon on the extension card).

## File Structure

```
bolt-automations/
├── background/          # Background script for handling notifications
├── content/            # Content script for monitoring Bolt interface
├── popup/              # Extension popup interface
├── src/                # Shared utilities and types
├── public/             # Static assets and manifest
├── dist/               # Built extension files (generated)
└── README.md           # This file
```

## Privacy & Security

- All API keys and webhook URLs are stored locally in your browser using Chrome's storage API.
- No data is sent to any servers other than the ones you explicitly configure (Discord webhook, Anthropic API).
- The extension only operates on `bolt.new` domains.
- All communication is encrypted using HTTPS.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions, please visit [Squash](https://www.trysquash.dev/) or create an issue in the repository.