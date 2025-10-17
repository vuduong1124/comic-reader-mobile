# Contributing to Comic Reader Mobile

First off, thank you for considering contributing to Comic Reader Mobile! 🎉

The following is a set of guidelines for contributing to this project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: **Be respectful and professional**. Please help us maintain a positive and welcoming community.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - Device: [e.g. Samsung Galaxy S21]
 - OS: [e.g. Android 13]
 - App Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, examples, or additional context.
```

### Your First Code Contribution

Unsure where to begin? You can start by looking through `good-first-issue` and `help-wanted` issues:

- **Good First Issue** - Issues which should only require a few lines of code
- **Help Wanted** - Issues which are a bit more involved

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Ensure code follows project standards
4. Update documentation if needed
5. Write/update tests if applicable
6. Create Pull Request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 1.22.0
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup Steps

1. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/comic-reader-mobile.git
cd comic-reader-mobile
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

4. **Run on device/emulator:**
```bash
npm run android  # Android
npm run ios      # iOS (macOS only)
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests passing

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

Examples:
feat(pdf): add bookmark functionality
fix(history): resolve crash on clear all
docs: update API documentation
refactor(hooks): simplify useReadingHistory
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build/tooling changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots here
```

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types
interface Props {
  title: string;
  onPress: () => void;
}

// ❌ Bad: Using any
const Component = (props: any) => { };
```

### React

```typescript
// ✅ Good: Functional component with hooks
const MyComponent: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0);
  return <Text>{title}</Text>;
};

// ❌ Bad: Class component (avoid unless necessary)
class MyComponent extends React.Component { }
```

### Naming Conventions

- **Components**: PascalCase - `FileManager.tsx`
- **Hooks**: camelCase with `use` prefix - `useReadingHistory.ts`
- **Constants**: UPPER_SNAKE_CASE - `DEFAULT_FOLDER`
- **Variables**: camelCase - `mangaList`
- **Private functions**: Start with `_` - `_handlePrivate()`

### File Organization

```typescript
// 1. External imports
import React from 'react';
import { View } from 'react-native';

// 2. Internal imports
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

// 3. Relative imports
import FileManager from './components/FileManager';

// 4. Types
import type { MangaData } from './types';
```

### Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate with discount because API doesn't provide it
const total = calculateTotal(items, discount);

// ❌ Bad: Obvious comment
// Set count to 0
const count = 0;

/**
 * ✅ Good: Function documentation
 * Scans folder for manga directories.
 * A manga folder must contain data.json and main.jpg.
 * 
 * @param path - Absolute path to scan
 * @returns Array of manga items
 */
const scanForManga = async (path: string) => { };
```

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
# Simple commit
feat(pdf): add page zoom functionality

# Detailed commit
fix(history): prevent crash when clearing history

Fixed a race condition where clearing history while
a manga was being read caused the app to crash.

Closes #123
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line max 72 characters
- Reference issues in footer

## Issue Guidelines

### Creating Issues

**Good Issue Title:**
- ✅ "PDF viewer crashes when opening large files"
- ✅ "Add search functionality to manga library"
- ❌ "Bug"
- ❌ "Help needed"

**Good Issue Description:**
- Clear and concise
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on

## Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] FileManager loads manga correctly
- [ ] PDF viewer displays properly
- [ ] Page navigation works
- [ ] History saves correctly
- [ ] Settings persist
- [ ] Theme switching works
- [ ] No console errors

### Writing Tests (when implemented)

```typescript
// Example unit test
describe('useReadingHistory', () => {
  it('should update chapter progress', async () => {
    const { result } = renderHook(() => useReadingHistory());
    
    await act(async () => {
      await result.current.updateChapterProgress(
        '/path/manga',
        'Manga',
        '/path/chapter',
        'Chapter 1',
        10,
        20
      );
    });
    
    const history = result.current.getMangaHistory('/path/manga');
    expect(history?.lastReadChapter?.currentPage).toBe(10);
  });
});
```

## Documentation

### When to Update Docs

- Adding new features
- Changing existing APIs
- Fixing bugs that affect usage
- Adding/changing configuration

### Documentation Files

- `README.md` - Project overview
- `ARCHITECTURE.md` - System architecture
- `API.md` - API reference
- `DEVELOPMENT.md` - Dev guide
- `CHANGELOG.md` - Version history

## Questions?

Feel free to:
- Open an issue with `question` label
- Email: vuduong1124@example.com
- Check existing documentation

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commits

Thank you for contributing! 🎉

---

**Remember**: The goal is to make this project better together. Every contribution, no matter how small, is valued and appreciated!
