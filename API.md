# 📘 API Documentation - Comic Reader Mobile

## Custom Hooks API

### useReadingHistory

Hook quản lý lịch sử đọc truyện.

#### Import

```typescript
import { useReadingHistory } from '@/hooks/useReadingHistory';
```

#### Usage

```typescript
const {
  history,
  loading,
  updateChapterProgress,
  markChapterAsRead,
  getMangaHistory,
  isChapterRead,
  getLastReadChapter,
  clearMangaHistory,
  clearAllHistory,
  getRecentlyReadManga,
} = useReadingHistory();
```

#### Return Values

##### `history`
- **Type**: `Record<string, MangaReadingHistory>`
- **Description**: Object chứa toàn bộ lịch sử đọc, key là manga path

##### `loading`
- **Type**: `boolean`
- **Description**: True khi đang load history từ AsyncStorage

#### Methods

##### `updateChapterProgress`

Cập nhật tiến độ đọc của 1 chapter.

```typescript
updateChapterProgress(
  mangaPath: string,
  mangaTitle: string,
  chapterPath: string,
  chapterName: string,
  currentPage: number,
  totalPages: number
): Promise<void>
```

**Parameters:**
- `mangaPath`: Đường dẫn thư mục manga
- `mangaTitle`: Tên manga
- `chapterPath`: Đường dẫn file chapter PDF
- `chapterName`: Tên chapter
- `currentPage`: Trang hiện tại (1-indexed)
- `totalPages`: Tổng số trang

**Example:**
```typescript
await updateChapterProgress(
  '/storage/.../OnePiece',
  'One Piece',
  '/storage/.../OnePiece/Chapter 1.pdf',
  'Chapter 1.pdf',
  15,
  20
);
```

##### `markChapterAsRead`

Đánh dấu chapter đã đọc (không cần biết tiến độ chi tiết).

```typescript
markChapterAsRead(
  mangaPath: string,
  chapterPath: string
): Promise<void>
```

##### `getMangaHistory`

Lấy lịch sử đọc của 1 manga.

```typescript
getMangaHistory(mangaPath: string): MangaReadingHistory | null
```

**Returns:** Object lịch sử hoặc null nếu chưa đọc

**Example:**
```typescript
const history = getMangaHistory('/storage/.../OnePiece');
if (history) {
  console.log('Last read:', history.lastReadChapter?.chapterName);
  console.log('Total chapters read:', history.readChapters.length);
}
```

##### `isChapterRead`

Kiểm tra chapter đã đọc chưa.

```typescript
isChapterRead(
  mangaPath: string,
  chapterPath: string
): boolean
```

**Example:**
```typescript
const isRead = isChapterRead(
  '/storage/.../OnePiece',
  '/storage/.../OnePiece/Chapter 1.pdf'
);

<Text style={{ color: isRead ? 'green' : 'gray' }}>
  Chapter 1 {isRead && '✓'}
</Text>
```

##### `getLastReadChapter`

Lấy chapter đọc cuối cùng của manga.

```typescript
getLastReadChapter(mangaPath: string): ReadingProgress | null
```

**Returns:** Object ReadingProgress hoặc null

**Example:**
```typescript
const lastChapter = getLastReadChapter('/storage/.../OnePiece');
if (lastChapter) {
  console.log('Continue reading:', lastChapter.chapterName);
  console.log('From page:', lastChapter.currentPage);
}
```

##### `clearMangaHistory`

Xóa lịch sử đọc của 1 manga.

```typescript
clearMangaHistory(mangaPath: string): Promise<void>
```

##### `clearAllHistory`

Xóa toàn bộ lịch sử đọc.

```typescript
clearAllHistory(): Promise<void>
```

##### `getRecentlyReadManga`

Lấy danh sách manga đã đọc gần đây (sorted theo thời gian).

```typescript
getRecentlyReadManga(): MangaReadingHistory[]
```

**Returns:** Array manga history, sorted từ mới nhất đến cũ nhất

**Example:**
```typescript
const recentManga = getRecentlyReadManga();

recentManga.forEach(manga => {
  console.log(manga.mangaTitle, '- Last read:', new Date(manga.lastAccessTime));
});
```

---

### usePDFSettings

Hook quản lý cài đặt PDF viewer.

#### Import

```typescript
import { usePDFSettings } from '@/hooks/usePDFSettings';
```

#### Usage

```typescript
const {
  settings,
  loading,
  saveSettings,
  resetSettings,
  loadSettings,
} = usePDFSettings();
```

#### Return Values

##### `settings`
- **Type**: `PDFSettings`
- **Description**: Object chứa các cài đặt hiện tại

```typescript
interface PDFSettings {
  showPageIndicator: boolean;
  distanceBetweenPages: number;
  defaultPDFFolder: string;
}
```

##### `loading`
- **Type**: `boolean`
- **Description**: True khi đang load settings

#### Methods

##### `saveSettings`

Lưu settings mới (merge với settings hiện tại).

```typescript
saveSettings(newSettings: Partial<PDFSettings>): Promise<boolean>
```

**Returns:** `true` nếu lưu thành công, `false` nếu có lỗi

**Example:**
```typescript
// Chỉ cập nhật 1 field
await saveSettings({ distanceBetweenPages: 10 });

// Cập nhật nhiều fields
await saveSettings({
  showPageIndicator: false,
  distanceBetweenPages: 5,
});
```

##### `resetSettings`

Reset settings về giá trị mặc định.

```typescript
resetSettings(): Promise<boolean>
```

**Example:**
```typescript
const success = await resetSettings();
if (success) {
  Alert.alert('Thành công', 'Đã reset cài đặt về mặc định');
}
```

##### `loadSettings`

Reload settings từ AsyncStorage (thường không cần gọi thủ công).

```typescript
loadSettings(): Promise<void>
```

---

### useTheme

Hook quản lý theme của ứng dụng.

#### Import

```typescript
import { useTheme } from '@/context/ThemeContext';
```

#### Usage

```typescript
const {
  theme,
  themeMode,
  setThemeMode,
  toggleTheme,
} = useTheme();
```

#### Return Values

##### `theme`
- **Type**: `'light' | 'dark'`
- **Description**: Theme thực tế đang được sử dụng (sau khi resolve 'system')

##### `themeMode`
- **Type**: `'light' | 'dark' | 'system'`
- **Description**: User preference (có thể là 'system')

#### Methods

##### `setThemeMode`

Set theme mode.

```typescript
setThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void>
```

**Example:**
```typescript
// Set light mode
await setThemeMode('light');

// Set dark mode
await setThemeMode('dark');

// Follow system
await setThemeMode('system');
```

##### `toggleTheme`

Toggle giữa light → dark → system → light.

```typescript
toggleTheme(): void
```

---

### useColorScheme

Hook lấy color scheme hiện tại.

#### Import

```typescript
import { useColorScheme } from '@/hooks/useColorScheme';
```

#### Usage

```typescript
const colorScheme = useColorScheme();
// Returns: 'light' | 'dark'

const colors = Colors[colorScheme ?? 'light'];
```

---

## Component Props API

### PDFViewer

Component hiển thị PDF với các controls điều khiển.

#### Import

```typescript
import PDFViewer from '@/components/PDFViewer';
```

#### Props

```typescript
interface PDFViewerProps {
  filePath: string;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalCount?: number;
  mangaPath?: string;
  mangaTitle?: string;
}
```

##### `filePath` (required)
- **Type**: `string`
- **Description**: Đường dẫn tuyệt đối đến file PDF

##### `onClose`
- **Type**: `() => void`
- **Description**: Callback khi user nhấn nút đóng

##### `onNext`
- **Type**: `() => void`
- **Description**: Callback khi user nhấn nút next chapter

##### `onPrevious`
- **Type**: `() => void`
- **Description**: Callback khi user nhấn nút previous chapter

##### `hasNext`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Có chapter tiếp theo không (để enable/disable nút Next)

##### `hasPrevious`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Có chapter trước không (để enable/disable nút Previous)

##### `currentIndex`
- **Type**: `number`
- **Default**: `1`
- **Description**: Vị trí chapter hiện tại (1-indexed)

##### `totalCount`
- **Type**: `number`
- **Default**: `1`
- **Description**: Tổng số chapter

##### `mangaPath`
- **Type**: `string`
- **Description**: Đường dẫn thư mục manga (để lưu lịch sử)

##### `mangaTitle`
- **Type**: `string`
- **Description**: Tên manga (để hiển thị trong lịch sử)

#### Example

```typescript
<PDFViewer
  filePath="/storage/.../OnePiece/Chapter 1.pdf"
  onClose={() => setShowPDF(false)}
  onNext={() => loadNextChapter()}
  onPrevious={() => loadPrevChapter()}
  hasNext={currentIndex < totalChapters}
  hasPrevious={currentIndex > 1}
  currentIndex={1}
  totalCount={100}
  mangaPath="/storage/.../OnePiece"
  mangaTitle="One Piece"
/>
```

---

### FileManager

Component quản lý thư viện manga.

#### Import

```typescript
import FileManager from '@/components/FileManager';
```

#### Props

```typescript
interface FileManagerProps {
  onFileSelect?: (path: string) => void;
  onPathChange?: (path: string) => void;
}
```

##### `onFileSelect`
- **Type**: `(path: string) => void`
- **Description**: Callback khi user chọn 1 file PDF

##### `onPathChange`
- **Type**: `(path: string) => void`
- **Description**: Callback khi current path thay đổi

#### Example

```typescript
<FileManager
  onFileSelect={(path) => console.log('Selected:', path)}
  onPathChange={(path) => console.log('Path changed:', path)}
/>
```

---

### FolderBrowser

Component browse folders trong storage.

#### Import

```typescript
import FolderBrowser from '@/components/FolderBrowser';
```

#### Props

```typescript
interface FolderBrowserProps {
  onFolderSelect: (path: string) => void;
  onCancel: () => void;
  initialPath?: string;
}
```

##### `onFolderSelect` (required)
- **Type**: `(path: string) => void`
- **Description**: Callback khi user chọn folder

##### `onCancel` (required)
- **Type**: `() => void`
- **Description**: Callback khi user nhấn Cancel

##### `initialPath`
- **Type**: `string`
- **Description**: Folder khởi đầu khi mở browser

#### Example

```typescript
<Modal visible={showBrowser}>
  <FolderBrowser
    initialPath="/storage/emulated/0"
    onFolderSelect={(path) => {
      setSelectedPath(path);
      setShowBrowser(false);
    }}
    onCancel={() => setShowBrowser(false)}
  />
</Modal>
```

---

### ReadingHistoryScreen

Component hiển thị lịch sử đọc.

#### Import

```typescript
import ReadingHistoryScreen from '@/components/ReadingHistoryScreen';
```

#### Props

```typescript
interface ReadingHistoryScreenProps {
  onMangaSelect?: (mangaPath: string) => void;
}
```

##### `onMangaSelect`
- **Type**: `(mangaPath: string) => void`
- **Description**: Callback khi user click vào manga trong lịch sử

#### Example

```typescript
<ReadingHistoryScreen
  onMangaSelect={(path) => {
    // Navigate to manga detail
    navigateToManga(path);
  }}
/>
```

---

## Data Types

### MangaData

Dữ liệu manga được lưu trong `data.json`.

```typescript
interface MangaData {
  title: string;              // Tên manga
  url: string;                // URL nguồn (web)
  path: string;               // Đường dẫn local folder
  mainPhoto: string;          // Tên file ảnh thumbnail
  chapters: Chapter[];        // Danh sách chapter metadata
  total: number;              // Tổng số chapter
  isDownload: boolean;        // Đã download hay chưa
  downloadComplete: number;   // Số chapter đã download
  status: string;             // Trạng thái (ongoing/completed)
}

interface Chapter {
  title: string;              // Tên chapter
  link: string;               // Link web chapter
}
```

---

### MangaItem

Object manga hiển thị trong UI.

```typescript
interface MangaItem {
  name: string;               // Tên folder
  path: string;               // Đường dẫn folder
  title: string;              // Tên manga (từ data.json)
  thumbnail: string;          // Đường dẫn file thumbnail
  data: MangaData;            // Full manga data
}
```

---

### ReadingProgress

Tiến độ đọc của 1 chapter.

```typescript
interface ReadingProgress {
  chapterPath: string;        // Đường dẫn file chapter
  chapterName: string;        // Tên chapter
  currentPage: number;        // Trang hiện tại (1-indexed)
  totalPages: number;         // Tổng số trang
  lastReadTime: number;       // Timestamp đọc cuối
  isCompleted: boolean;       // Đã đọc xong chưa
}
```

---

### MangaReadingHistory

Lịch sử đọc của 1 manga.

```typescript
interface MangaReadingHistory {
  mangaPath: string;          // Đường dẫn folder manga
  mangaTitle: string;         // Tên manga
  lastReadChapter?: ReadingProgress;  // Chapter đọc cuối
  readChapters: string[];     // Array đường dẫn chapters đã đọc
  lastAccessTime: number;     // Timestamp truy cập cuối
}
```

---

### PDFSettings

Cài đặt PDF viewer.

```typescript
interface PDFSettings {
  showPageIndicator: boolean;    // Hiển thị số trang (default: true)
  distanceBetweenPages: number;  // Khoảng cách trang (px) (default: 0)
  defaultPDFFolder: string;      // Folder mặc định
}
```

**Default values:**
```typescript
{
  showPageIndicator: true,
  distanceBetweenPages: 0,
  defaultPDFFolder: '/storage/emulated/0/Android/media'
}
```

---

### FileItem

Object file/folder từ react-native-fs.

```typescript
interface FileItem {
  name: string;               // Tên file/folder
  path: string;               // Đường dẫn đầy đủ
  size: number;               // Kích thước (bytes)
  isFile: () => boolean;      // Check là file
  isDirectory: () => boolean; // Check là folder
  modificationTime?: number;  // Timestamp modified
}
```

---

## Constants

### Colors

Color palette cho light và dark theme.

```typescript
import { Colors } from '@/constants/Colors';

const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? 'light'];

// Usage
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```

**Available colors:**
- `background`: Màu nền chính
- `text`: Màu text chính
- `primary`: Màu primary (brand color)
- `secondary`: Màu secondary
- `tint`: Màu tint cho icons
- `icon`: Màu icon mặc định
- `tabIconDefault`: Màu tab icon default
- `tabIconSelected`: Màu tab icon selected

---

## AsyncStorage Keys

Keys được sử dụng để lưu data trong AsyncStorage:

| Key | Type | Description |
|-----|------|-------------|
| `@theme_mode` | `ThemeMode` | User theme preference |
| `pdfViewerSettings` | `PDFSettings` | PDF viewer settings |
| `mangaReadingHistory` | `Record<string, MangaReadingHistory>` | Reading history |

---

## File System Paths

### Android Default Paths

```typescript
// Base storage
const EXTERNAL_STORAGE = '/storage/emulated/0';

// App-specific folder (scoped storage)
const APP_FOLDER = `${EXTERNAL_STORAGE}/Android/media/${packageName}`;

// Default manga folder
const MANGA_FOLDER = `${APP_FOLDER}/TruyenPDF`;
```

### Accessing Files

```typescript
import RNFS from 'react-native-fs';

// Read directory
const files = await RNFS.readDir(path);

// Read file content
const content = await RNFS.readFile(filePath, 'utf8');

// Check if exists
const exists = await RNFS.exists(filePath);

// Get file info
const stat = await RNFS.stat(filePath);
```

---

## Permissions

### Required Permissions (Android)

```json
[
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE",
  "MANAGE_EXTERNAL_STORAGE",
  "READ_MEDIA_IMAGES",
  "READ_MEDIA_VIDEO",
  "READ_MEDIA_AUDIO"
]
```

### Request Permission

```typescript
import * as MediaLibrary from 'expo-media-library';

const requestPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

// Usage
const hasPermission = await requestPermission();
if (!hasPermission) {
  Alert.alert('Permission denied');
}
```

---

## Error Codes

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Permission not granted` | User denied permission | Request permission again |
| `File not found` | Path không tồn tại | Check path validity |
| `Cannot read directory` | Không có quyền đọc folder | Grant storage permission |
| `Invalid PDF` | File PDF bị lỗi | Check file integrity |
| `AsyncStorage error` | Lỗi read/write storage | Check storage space |

---

**Document Version**: 1.0  
**Last Updated**: October 17, 2025
