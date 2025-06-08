import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, Check, Globe, Info, Key, Save, Settings2, Zap } from 'lucide-react';
import { NotificationSentMessage } from '../src/chrome-messages';
import { Settings } from '../src/types';
import { getSettings, saveSettings } from '../src/utils/storage';
import './popup.css';

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiProvider: 'anthropic',
    anthropicApiKey: '',
    geminiApiKey: '',
    openaiApiKey: '',
    discordWebhookUrl: '',
    autoDiscussMode: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    };
    
    loadSettings();
  }, []);

  // Listen for messages from the background script
  useEffect(() => {
    const handleMessage = (message: NotificationSentMessage) => {
      if (message.action === 'notificationSent') {
        if (message.success) {
          setStatus({
            message: 'Notification sent successfully!',
            type: 'success'
          });
        } else {
          setStatus({
            message: `Error: ${message.error || 'Failed to send notification'}`,
            type: 'error'
          });
        }
        setIsTestingNotification(false);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setStatus({ message: '', type: null });
    
    try {
      await saveSettings(settings);
      setStatus({
        message: 'Settings saved successfully!',
        type: 'success'
      });
    } catch (error) {
      setStatus({
        message: `Error: ${error instanceof Error ? error.message : 'Failed to save settings'}`,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    setStatus({ message: '', type: null });
    
    try {
      await chrome.runtime.sendMessage({ action: 'testNotification' });
    } catch (error) {
      setStatus({
        message: `Error: ${error instanceof Error ? error.message : 'Failed to test notification'}`,
        type: 'error'
      });
      setIsTestingNotification(false);
    }
  };

  // Get the API key field for the selected provider
  const renderApiKeyField = () => {
    const provider = settings.apiProvider;
    const providerConfig = {
      anthropic: {
        label: 'Anthropic API Key',
        placeholder: 'sk-ant-api...',
        value: settings.anthropicApiKey,
        name: 'anthropicApiKey'
      },
      gemini: {
        label: 'Gemini API Key',
        placeholder: 'AIza...',
        value: settings.geminiApiKey,
        name: 'geminiApiKey'
      },
      openai: {
        label: 'OpenAI API Key',
        placeholder: 'sk-...',
        value: settings.openaiApiKey,
        name: 'openaiApiKey'
      }
    };

    const config = providerConfig[provider];

    return (
      <div className="form-group">
        <label htmlFor={config.name}>
          <Key size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {config.label} (AI Summaries)
        </label>
        <input
          type="password"
          id={config.name}
          name={config.name}
          className="form-control"
          value={config.value}
          onChange={handleChange}
          placeholder={config.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Bolt Automations</h1>
            <p className="subtitle">
              <a href="https://www.trysquash.dev/" target="_blank" rel="noreferrer">
                by Squash
              </a>
            </p>
          </div>
        </div>
      </header>
      
      <main className="content">
        <div className="card">
          <h2 className="card-title">
            <Globe size={16} />
            About
          </h2>
          <div className="about-content-wrapper">
            <p className="instructions">
              This extension automates Bolt task monitoring on bolt.new and sends notifications to Discord.
            </p>
            <img 
              src="/assets/black_circle_360x360.png" 
              alt="Bolt Logo" 
              className="about-logo"
            />
          </div>
        </div>

        <details className="card">
          <summary className="card-title">
            <Info size={16} />
            Settings Guide
          </summary>
          <p className="text-sm text-gray-600 mb-4">
            All API keys and webhook URLs are stored locally in your browser and are never sent to any external servers.
          </p>
          <div className="settings-guide">
            <div className="guide-item">
              <h3 className="guide-title">
                <Settings2 size={14} />
                Auto-enable Discuss Mode
              </h3>
              <p className="guide-text">
                Automatically switches Bolt to discuss mode after task completion, saving you tokens.
              </p>
            </div>
            <div className="guide-item">
              <h3 className="guide-title">
                <Bell size={14} />
                Discord Webhook URL
              </h3>
              <p className="guide-text">
                The destination for all notifications. Create a webhook integration in your Discord server's channel settings to get this URL.
              </p>
            </div>
            <div className="guide-item">
              <h3 className="guide-title">
                <Key size={14} />
                AI Provider & API Key
              </h3>
              <p className="guide-text">
                Choose your preferred AI provider for generating summaries. Each provider uses a specific model:
              </p>
              <ul className="guide-text mt-2 ml-4 list-disc">
                <li><strong>Anthropic:</strong> Claude 3 Haiku</li>
                <li><strong>Google Gemini:</strong> Gemini 2.0 Flash Lite</li>
                <li><strong>OpenAI:</strong> GPT-4o Mini</li>
              </ul>
              <p className="guide-text mt-2">
                Without an API key, only Bolt's last message will be sent.
              </p>
            </div>
          </div>
        </details>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoDiscussMode"
                checked={settings.autoDiscussMode}
                onChange={handleChange}
                className="form-checkbox"
              />
              Auto-enable discuss mode
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="discordWebhookUrl">
              <Bell size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Discord Webhook URL (Notifications)
            </label>
            <input
              type="url"
              id="discordWebhookUrl"
              name="discordWebhookUrl"
              className="form-control"
              value={settings.discordWebhookUrl}
              onChange={handleChange}
              placeholder="https://discord.com/api/webhooks/..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiProvider">
              <Settings2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              AI Provider
            </label>
            <select
              id="apiProvider"
              name="apiProvider"
              className="form-control"
              value={settings.apiProvider}
              onChange={handleChange}
            >
              <option value="anthropic">Anthropic (Claude 3 Haiku)</option>
              <option value="gemini">Google Gemini (2.0 Flash Lite)</option>
              <option value="openai">OpenAI (GPT-4o Mini)</option>
            </select>
          </div>
          
          {renderApiKeyField()}
          
          <div className="button-group">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="btn-icon" />
                  Save Settings
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestNotification}
              disabled={isSaving || isTestingNotification}
            >
              {isTestingNotification ? (
                <>
                  <span className="spinner"></span>
                  Testing...
                </>
              ) : (
                <>
                  <Zap size={16} className="btn-icon" />
                  Test Notification
                </>
              )}
            </button>
          </div>
        </form>
        
        {status.type && (
          <div className={`status status-${status.type}`}>
            {status.type === 'success' ? (
              <Check size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            ) : (
              <AlertCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            )}
            {status.message}
          </div>
        )}
      </main>
    </div>
  );
};