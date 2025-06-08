# Contributing to Bolt Automations

Thank you for your interest in contributing to Bolt Automations! This guide will help you get started with development and creating releases.

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or pnpm
- Chrome browser for testing

### Getting Started
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bolt-automations-browser-extension.git
   cd bolt-automations-browser-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist` folder

### Development Workflow
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production version
- Make changes in the source files
- The extension will rebuild automatically in dev mode

### Project Structure
```
├── background/     # Background service worker
├── content/        # Content scripts injected into bolt.new
├── popup/          # Extension popup UI
├── src/            # Shared utilities and types
├── public/         # Static assets and manifest
└── dist/           # Built extension (git ignored)
```

## Creating a Release

### For Maintainers

1. **Update Version Numbers**
   - Update version in `public/manifest.json`
   - Update version in `package.json`
   - Keep versions in sync

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Bump version to v1.0.1"
   git push origin main
   ```

3. **Create and Push Tag**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **GitHub Actions will automatically:**
   - Build the extension
   - Create a zip file named `bolt-automations-v1.0.1.zip`
   - Create a GitHub release with the zip attached
   - Generate release notes from commits

### Manual Release (if needed)
You can also trigger a release manually from the GitHub Actions tab by running the "Build and Release Extension" workflow.

### Release Checklist
- [ ] All tests pass
- [ ] Version numbers updated in both files
- [ ] Changes documented in commit messages
- [ ] Tag matches version number format (v1.0.0)

## Code Guidelines

### TypeScript
- Always use TypeScript over JavaScript
- Define proper types for all function parameters and returns
- Use descriptive variable and function names

### API Changes
- When adding new API providers:
  - Add types in `src/types.ts`
  - Add API logic in `src/utils/api.ts`
  - Update UI in `popup/popup.tsx`
  - Document the model used in README

### Testing
- Test all three API providers before release
- Verify Discord notifications work
- Check that token-saving features work on bolt.new

## Submitting Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with clear messages

3. Push to your fork and create a Pull Request

4. Ensure CI checks pass

5. Wait for review from maintainers

## Questions?

Open an issue if you have questions or need help getting started!