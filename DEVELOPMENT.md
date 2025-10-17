# 🛠️ Development Guide - Comic Reader Mobile

## 📋 Table of Contents

1. [Setup Development Environment](#setup-development-environment)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Git Workflow](#git-workflow)
5. [Building and Testing](#building-and-testing)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## Setup Development Environment

### Prerequisites

#### Required Software

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0 hoặc **yarn**: >= 1.22.0
- **Git**: Latest version
- **Expo CLI**: Cài đặt global

```bash
npm install -g expo-cli eas-cli
```

#### For Android Development

- **Android Studio**: Latest stable version
- **Android SDK**: API 33+ (Android 13+)
- **JDK**: Version 17 (recommended)
- **Android Emulator** hoặc **Physical Device**

#### For iOS Development (macOS only)

- **Xcode**: Latest version
- **CocoaPods**: Latest version
- **iOS Simulator** hoặc **Physical Device**

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/vuduong1124/comic-reader-mobile.git
cd comic-reader-mobile
```

#### 2. Install Dependencies

```bash
npm install
# hoặc
yarn install
```

#### 3. Configure Environment

Không cần file `.env` cho project này, tất cả config nằm trong `app.json`.

#### 4. Verify Installation

```bash
# Check Expo CLI
expo --version

# Check Node version
node --version

# Check npm/yarn version
npm --version
```

#### 5. Start Development Server

```bash
npm start
# hoặc
expo start
```

Scan QR code với Expo Go app để test trên device.

---

## Project Structure

### Folder Organization

```
comic-reader-mobile/
├── app/                    # Expo Router (pages)
│   ├── _layout.tsx        # Root layout
│   ├── +not-found.tsx     # 404 page
│   └── (tabs)/            # Tab navigation group
│       ├── _layout.tsx
│       ├── index.tsx
│       └── settings.tsx
│
├── components/             # Reusable components
│   ├── FileManager.tsx
│   ├── PDFViewer.tsx
│   ├── ReadingHistoryScreen.tsx
│   ├── FolderBrowser.tsx
│   ├── Header.tsx
│   └── ui/                # UI primitives
│
├── hooks/                  # Custom React Hooks
│   ├── useReadingHistory.ts
│   ├── usePDFSettings.ts
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
│
├── context/                # React Context providers
│   └── ThemeContext.tsx
│
├── constants/              # App constants
│   └── Colors.ts
│
├── assets/                 # Static assets
│   ├── images/
│   └── fonts/
│
└── scripts/                # Utility scripts
    └── reset-project.js
```

### File Naming Conventions

- **Components**: PascalCase - `FileManager.tsx`
- **Hooks**: camelCase với prefix `use` - `useReadingHistory.ts`
- **Context**: PascalCase với suffix `Context` - `ThemeContext.tsx`
- **Constants**: PascalCase - `Colors.ts`
- **Types**: PascalCase với suffix `Type` hoặc `Interface`

### Import Order Convention

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';

// 2. Internal modules (@ alias)
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { usePDFSettings } from '@/hooks/usePDFSettings';

// 3. Relative imports
import FileManager from './components/FileManager';
import { formatDate } from './utils';

// 4. Types
import type { MangaData } from './types';
```

---

## Coding Standards

### TypeScript

#### Type Safety

```typescript
// ✅ Good: Explicit types
interface Props {
  title: string;
  onPress: () => void;
}

const Component: React.FC<Props> = ({ title, onPress }) => {
  // ...
};

// ❌ Bad: Any type
const Component = ({ title, onPress }: any) => {
  // ...
};
```

#### Avoid `any`

```typescript
// ✅ Good: Proper typing
const handleData = (data: MangaData) => {
  console.log(data.title);
};

// ❌ Bad: Using any
const handleData = (data: any) => {
  console.log(data.title);
};
```

#### Use Type Guards

```typescript
// ✅ Good: Type guard
const isValidManga = (data: unknown): data is MangaData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'chapters' in data
  );
};
```

### React Best Practices

#### Functional Components

```typescript
// ✅ Good: Functional component with hooks
const MyComponent: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0);
  
  return <Text>{title}: {count}</Text>;
};

// ❌ Bad: Class component (avoid unless necessary)
class MyComponent extends React.Component {
  // ...
}
```

#### Custom Hooks

```typescript
// ✅ Good: Reusable custom hook
const useMangaData = (path: string) => {
  const [data, setData] = useState<MangaData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData(path).then(setData).finally(() => setLoading(false));
  }, [path]);
  
  return { data, loading };
};
```

#### Memoization

```typescript
// ✅ Good: Memoize expensive computations
const sortedManga = useMemo(() => {
  return manga.sort((a, b) => a.title.localeCompare(b.title));
}, [manga]);

// ✅ Good: Memoize callbacks
const handlePress = useCallback(() => {
  onPress(data);
}, [data, onPress]);
```

#### Avoid Inline Functions in Render

```typescript
// ❌ Bad: New function on every render
<Button onPress={() => handlePress(item)} />

// ✅ Good: Memoized callback
const handleItemPress = useCallback(() => {
  handlePress(item);
}, [item, handlePress]);

<Button onPress={handleItemPress} />
```

### React Native Best Practices

#### Use StyleSheet.create

```typescript
// ✅ Good: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

// ❌ Bad: Inline styles
<View style={{ flex: 1, padding: 16 }} />
```

#### Optimize FlatList

```typescript
// ✅ Good: Optimized FlatList
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}
/>
```

#### Handle Async Properly

```typescript
// ✅ Good: Error handling
const loadData = async () => {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// ❌ Bad: No error handling
const loadData = async () => {
  const data = await fetchData();
  setData(data);
};
```

### Code Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate total with discount because API doesn't provide it
const totalWithDiscount = calculateTotal(items, discount);

// ❌ Bad: Obvious comment
// Set the count variable to 0
const count = 0;

// ✅ Good: Complex logic explanation
/**
 * Scan folder để tìm manga folders.
 * Manga folder phải có data.json và main.jpg.
 * Cache kết quả để tránh re-scan.
 */
const scanForManga = async (path: string) => {
  // ...
};
```

### ESLint Configuration

File `.eslintrc.js` được config với:

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_' 
    }],
  },
};
```

---

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent production fixes

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Code style (formatting, no logic change)
refactor: Refactoring (no feature/bug change)
perf:     Performance improvement
test:     Add/update tests
chore:    Build/tooling changes

# Examples
feat(pdf): add auto-save reading progress
fix(history): fix crash when clearing all history
docs: update README with API documentation
refactor(hooks): extract common logic to custom hook
```

### Workflow Example

```bash
# 1. Create feature branch
git checkout -b feature/bookmark-system

# 2. Make changes and commit
git add .
git commit -m "feat(bookmark): add bookmark functionality"

# 3. Push to remote
git push origin feature/bookmark-system

# 4. Create Pull Request on GitHub

# 5. After review, merge to develop

# 6. Delete feature branch
git branch -d feature/bookmark-system
```

---

## Building and Testing

### Development Build

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

### Production Build

#### Build APK (Local)

```bash
# Windows
.\build-apk.bat

# Linux/macOS
./build-apk.sh
```

#### Build with EAS

```bash
# Login
eas login

# Configure (first time only)
eas build:configure

# Build APK for Android
eas build -p android --profile preview

# Build AAB for Play Store
eas build -p android --profile production

# Build for iOS
eas build -p ios --profile production
```

### Testing

#### Manual Testing Checklist

**FileManager:**
- [ ] Scan folder hiển thị đúng manga
- [ ] Thumbnail load đúng
- [ ] Click manga hiển thị chapter list
- [ ] Progress bar hiển thị đúng
- [ ] Cache hoạt động (không re-scan khi back)

**PDFViewer:**
- [ ] PDF load và hiển thị đúng
- [ ] Swipe để đổi trang
- [ ] Auto-hide controls
- [ ] Next/Previous buttons hoạt động
- [ ] Page indicator hiển thị đúng
- [ ] Lưu tiến độ khi đổi trang

**Reading History:**
- [ ] Hiển thị manga đã đọc
- [ ] Hiển thị tiến độ đúng
- [ ] Continue reading hoạt động
- [ ] Xóa lịch sử hoạt động
- [ ] Time format hiển thị đúng

**Settings:**
- [ ] Change theme hoạt động
- [ ] Change folder hoạt động
- [ ] Distance setting hoạt động
- [ ] Reset settings hoạt động

#### Unit Testing (Recommended)

```bash
# Install Jest and React Native Testing Library
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

**Example test:**

```typescript
// __tests__/hooks/useReadingHistory.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useReadingHistory } from '@/hooks/useReadingHistory';

describe('useReadingHistory', () => {
  it('should update chapter progress', async () => {
    const { result } = renderHook(() => useReadingHistory());
    
    await act(async () => {
      await result.current.updateChapterProgress(
        '/path/manga',
        'Manga Title',
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

---

## Debugging

### React Native Debugger

#### Setup

1. Download [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Install and run
3. Enable Debug Mode in app

#### Using Debugger

```bash
# Start app in debug mode
npm start

# In Expo app, shake device and select "Debug Remote JS"
```

### Console Logging

```typescript
// Development logs
console.log('Data:', data);
console.warn('Warning:', warning);
console.error('Error:', error);

// Remove logs in production
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### React DevTools

```bash
# Install globally
npm install -g react-devtools

# Run
react-devtools

# Connect from app (shake device → Debug)
```

### Common Debug Tasks

#### Check AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// View all keys
const keys = await AsyncStorage.getAllKeys();
console.log('Keys:', keys);

// View specific value
const value = await AsyncStorage.getItem('key');
console.log('Value:', value);

// Clear all (BE CAREFUL!)
await AsyncStorage.clear();
```

#### Check File System

```typescript
import RNFS from 'react-native-fs';

// List files
const files = await RNFS.readDir(path);
console.log('Files:', files);

// Check if exists
const exists = await RNFS.exists(path);
console.log('Exists:', exists);

// Get file info
const stat = await RNFS.stat(path);
console.log('File info:', stat);
```

#### Performance Profiling

```typescript
// Measure render time
const start = performance.now();
// ... render logic
const end = performance.now();
console.log('Render time:', end - start, 'ms');

// React Profiler
import { Profiler } from 'react';

<Profiler id="FileManager" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <FileManager />
</Profiler>
```

---

## Common Tasks

### Add New Screen

1. Create file in `app/` directory:

```typescript
// app/new-screen.tsx
export default function NewScreen() {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

2. Navigate to screen:

```typescript
import { router } from 'expo-router';

router.push('/new-screen');
```

### Add New Component

1. Create component file:

```typescript
// components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

2. Use component:

```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Hello" />
```

### Add New Hook

1. Create hook file:

```typescript
// hooks/useMyHook.ts
import { useState, useEffect } from 'react';

export const useMyHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [value]);
  
  return { value, setValue };
};
```

2. Use hook:

```typescript
import { useMyHook } from '@/hooks/useMyHook';

const { value, setValue } = useMyHook('initial');
```

### Add New Dependency

```bash
# Install package
npm install package-name

# For types (if needed)
npm install --save-dev @types/package-name

# Update pods (iOS only)
cd ios && pod install && cd ..
```

### Update App Icon

1. Replace file: `assets/images/icon.png` (1024x1024)
2. Replace file: `assets/images/adaptive-icon.png` (1024x1024)
3. Rebuild app

### Update Splash Screen

1. Replace file: `assets/images/splash-icon.png`
2. Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "backgroundColor": "#ffffff"
        }
      ]
    ]
  }
}
```

3. Rebuild app

---

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx react-native start --reset-cache

# Clear watchman
watchman watch-del-all
```

### Build Errors

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Delete build artifacts
rm -rf android/app/build
rm -rf node_modules
npm install

# iOS clean
cd ios && pod deintegrate && pod install && cd ..
```

### Permission Issues (Android)

1. Uninstall app
2. Grant permissions manually in Settings
3. Reinstall app

### AsyncStorage Issues

```bash
# Clear AsyncStorage
# In app, run:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### PDF Not Loading

- Check file exists: `await RNFS.exists(filePath)`
- Check file path format: Must be absolute path
- Check file extension: Must be `.pdf`
- Check permissions: Grant storage permission

### App Crashes

1. Check Logcat (Android):

```bash
adb logcat | grep -i "ReactNative"
```

2. Check Console (iOS):

```bash
# In Xcode, open Console app
# Filter by app bundle ID
```

3. Check error boundaries:

```typescript
// Add error boundary
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

## Performance Tips

### Optimize Images

```typescript
// Use expo-image instead of Image
import { Image } from 'expo-image';

<Image
  source={{ uri: path }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### Optimize Lists

```typescript
// Use getItemLayout for fixed-size items
const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

<FlatList
  data={items}
  getItemLayout={getItemLayout}
  removeClippedSubviews={true}
/>
```

### Lazy Loading

```typescript
// Lazy load components
const PDFViewer = React.lazy(() => import('./components/PDFViewer'));

<Suspense fallback={<Loading />}>
  <PDFViewer />
</Suspense>
```

---

**Document Version**: 1.0  
**Last Updated**: October 17, 2025
