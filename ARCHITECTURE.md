# 🏗️ Kiến trúc Chi tiết - Comic Reader Mobile

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [Data Flow](#data-flow)
5. [Storage Strategy](#storage-strategy)
6. [Performance Optimization](#performance-optimization)

## Tổng quan

Ứng dụng được xây dựng theo mô hình **Component-Based Architecture** với **React Hooks** để quản lý state. Không sử dụng Redux hay MobX, thay vào đó sử dụng Context API và Custom Hooks.

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                     App Entry Point                      │
│                    (_layout.tsx)                         │
│                    ThemeProvider                         │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐            ┌────▼─────┐
    │  Home  │            │ Settings │
    │  Tab   │            │   Tab    │
    └───┬────┘            └────┬─────┘
        │                      │
    ┌───▼─────────┐       ┌───▼──────────┐
    │FileManager  │       │Settings Form │
    │Component    │       │Components    │
    └───┬─────────┘       └──────────────┘
        │
    ┌───▼─────────────────┐
    │  Manga List View    │
    └───┬─────────────────┘
        │
    ┌───▼─────────────────┐
    │  Chapter List View  │
    └───┬─────────────────┘
        │
    ┌───▼─────────────────┐
    │   PDF Viewer        │
    └─────────────────────┘
```

## Component Architecture

### 1. FileManager Component

**Trách nhiệm**: Quản lý thư viện manga và navigation giữa các view

**State Management**:
```typescript
// View States
- viewMode: 'manga' | 'chapters' | 'pdf'
- selectedManga: MangaItem | null
- currentPDFIndex: number

// Data States
- mangaItems: MangaItem[]
- pdfFiles: FileItem[]
- mangaCache: Record<string, FileItem[]>

// UI States
- loading: boolean
- mangaLoading: boolean
- loadingMangaPath: string | null
- refreshing: boolean
- error: string | null

// PDF Viewer States
- selectedPDFPath: string | null
- showPDFViewer: boolean
```

**Data Flow**:
```
User Action → State Update → Re-render → Effect Hook → API Call → State Update
```

**Key Methods**:
- `scanDirectory(path)`: Scan folder để tìm manga
- `loadChapters(manga)`: Load chapters của manga
- `handleMangaPress(manga)`: Xử lý khi click vào manga
- `handleChapterPress(file)`: Xử lý khi click vào chapter
- `handleNextChapter()`: Chuyển chapter tiếp theo
- `handlePreviousChapter()`: Quay lại chapter trước

### 2. PDFViewer Component

**Trách nhiệm**: Hiển thị và điều khiển PDF reader

**Props Interface**:
```typescript
interface PDFViewerProps {
  filePath: string;           // Required: đường dẫn PDF
  onClose?: () => void;       // Callback đóng viewer
  onNext?: () => void;        // Callback next chapter
  onPrevious?: () => void;    // Callback previous chapter
  hasNext?: boolean;          // Flag có chapter tiếp
  hasPrevious?: boolean;      // Flag có chapter trước
  currentIndex?: number;      // Vị trí hiện tại
  totalCount?: number;        // Tổng số chapter
  mangaPath?: string;         // Đường dẫn manga (cho history)
  mangaTitle?: string;        // Tên manga (cho history)
}
```

**State Management**:
```typescript
- showControls: boolean        // Hiển thị controls
- currentPage: number          // Trang hiện tại
- totalPages: number           // Tổng số trang
- controlsOpacity: Animated.Value  // Opacity animation
```

**Features**:
- Auto-hide controls sau 3 giây
- Auto-save reading progress mỗi khi đổi trang
- Show controls khi đọc xong chapter
- Restore trang cuối đọc khi mở lại
- Navigation buttons (Previous/Next chapter)

### 3. ReadingHistoryScreen Component

**Trách nhiệm**: Hiển thị lịch sử đọc

**Props**:
```typescript
interface ReadingHistoryScreenProps {
  onMangaSelect?: (mangaPath: string) => void;
}
```

**Features**:
- Hiển thị danh sách manga đã đọc gần đây
- Sắp xếp theo thời gian truy cập
- Hiển thị tiến độ đọc
- Xóa lịch sử từng manga
- Xóa toàn bộ lịch sử
- Format thời gian đọc (vừa xong, X phút trước, X giờ trước...)

### 4. FolderBrowser Component

**Trách nhiệm**: Browse folders trong storage

**Props**:
```typescript
interface FolderBrowserProps {
  onFolderSelect: (path: string) => void;
  onCancel: () => void;
  initialPath?: string;
}
```

**Features**:
- Hiển thị danh sách folders/files
- Navigate vào folder con
- Back về parent folder
- Icon phân biệt folder/file
- Select folder để set làm default

## State Management

### Context API

#### ThemeContext
```typescript
// Global theme state
{
  theme: 'light' | 'dark',        // Theme thực tế đang dùng
  themeMode: ThemeMode,           // User preference
  setThemeMode: (mode) => void,   // Set theme mode
  toggleTheme: () => void,        // Toggle theme
}
```

**Storage**: AsyncStorage key `@theme_mode`

### Custom Hooks

#### useReadingHistory

**Responsibility**: Quản lý toàn bộ lịch sử đọc

**State**:
```typescript
{
  history: Record<string, MangaReadingHistory>,
  loading: boolean,
}
```

**Storage**: AsyncStorage key `mangaReadingHistory`

**Data Structure**:
```typescript
{
  [mangaPath: string]: {
    mangaPath: string,
    mangaTitle: string,
    lastReadChapter: {
      chapterPath: string,
      chapterName: string,
      currentPage: number,
      totalPages: number,
      lastReadTime: number,
      isCompleted: boolean,
    },
    readChapters: string[],
    lastAccessTime: number,
  }
}
```

**Methods**:
- `updateChapterProgress()`: Cập nhật tiến độ đọc
- `markChapterAsRead()`: Đánh dấu đã đọc
- `getMangaHistory()`: Lấy lịch sử 1 manga
- `isChapterRead()`: Check chapter đã đọc chưa
- `getLastReadChapter()`: Lấy chapter đọc cuối
- `clearMangaHistory()`: Xóa lịch sử 1 manga
- `clearAllHistory()`: Xóa toàn bộ
- `getRecentlyReadManga()`: Lấy danh sách đã đọc (sorted)

#### usePDFSettings

**Responsibility**: Quản lý user settings

**State**:
```typescript
{
  settings: PDFSettings,
  loading: boolean,
}
```

**Storage**: AsyncStorage key `pdfViewerSettings`

**Settings Object**:
```typescript
{
  showPageIndicator: boolean,      // Default: true
  distanceBetweenPages: number,    // Default: 0
  defaultPDFFolder: string,        // Default: Android/media/.../TruyenPDF
}
```

**Methods**:
- `loadSettings()`: Load từ AsyncStorage
- `saveSettings(partial)`: Merge và save settings
- `resetSettings()`: Reset về default

#### useColorScheme

**Responsibility**: Lấy color scheme hiện tại

**Return**: `'light' | 'dark'`

**Logic**: 
- Nếu themeMode = 'system' → Theo system
- Nếu themeMode = 'light'/'dark' → Theo user choice

## Data Flow

### 1. App Initialization Flow

```
App Start
  ↓
Load Theme Preference (AsyncStorage)
  ↓
Load PDF Settings (AsyncStorage)
  ↓
Load Reading History (AsyncStorage)
  ↓
Navigate to Home Tab
  ↓
Scan Default Folder
  ↓
Display Manga List
```

### 2. Reading Flow

```
User clicks Manga
  ↓
Check cache for chapters
  ├─ Has cache → Use cached data
  └─ No cache → Scan folder → Cache result
  ↓
Display Chapter List
  ↓
User clicks Chapter
  ↓
Check reading history
  ├─ Has history → Restore last page
  └─ No history → Start from page 1
  ↓
Open PDF Viewer
  ↓
User reads (page changes)
  ↓
Auto-save progress (debounced)
  ↓
User finishes chapter
  ↓
Mark as completed
  ↓
Show Next Chapter button
```

### 3. Settings Flow

```
User changes setting
  ↓
Update local state
  ↓
Save to AsyncStorage
  ↓
Notify dependent components
  ↓
Re-render with new settings
```

## Storage Strategy

### AsyncStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `@theme_mode` | `ThemeMode` | User theme preference |
| `pdfViewerSettings` | `PDFSettings` | PDF viewer settings |
| `mangaReadingHistory` | `Record<string, MangaReadingHistory>` | Reading history |

### File System Structure

```
/storage/emulated/0/Android/media/com.minhduc08.expoplatform/TruyenPDF/
├── MangaName1/
│   ├── data.json
│   ├── main.jpg
│   ├── Chapter 1.pdf
│   └── Chapter 2.pdf
├── MangaName2/
│   ├── data.json
│   ├── main.jpg
│   └── ...
└── ...
```

### Cache Strategy

#### Manga Chapter Cache
- **Type**: In-memory cache (React state)
- **Key**: Manga path
- **Value**: Array of FileItem (chapter files)
- **Invalidation**: On component unmount
- **Purpose**: Tránh re-scan folder khi user back/forward

```typescript
const [mangaCache, setMangaCache] = useState<Record<string, FileItem[]>>({});
```

#### PDF Source Cache
- **Type**: PDF library cache
- **Duration**: 1 hour
- **Purpose**: Tránh reload PDF file khi đã xem gần đây

```typescript
const source = { 
  uri: "file://" + filePath, 
  cache: true, 
  expiration: 1000 * 60 * 60  // 1 hour
};
```

## Performance Optimization

### 1. Lazy Loading

- Manga list: Load khi user navigate vào folder
- Chapter list: Load khi user click vào manga
- Thumbnails: Load on-demand với React Native Image

### 2. Memoization

```typescript
// Memoize callbacks to prevent re-render
const handleMangaPress = useCallback((manga: MangaItem) => {
  // ...
}, [dependencies]);

// Memoize computed values
const sortedManga = useMemo(() => {
  return mangaItems.sort((a, b) => a.name.localeCompare(b.name));
}, [mangaItems]);
```

### 3. Debouncing

- Auto-save reading progress: Không save mỗi lần page change, chỉ save sau khi stable
- Folder scan: Debounce khi user type folder path

### 4. State Optimization

- Separate loading states: Global loading vs individual manga loading
- Avoid unnecessary re-renders: Use React.memo cho list items
- Batch state updates: Group related state changes

### 5. Image Optimization

- Thumbnail: Resize về kích thước nhỏ
- PDF pages: Render on-demand, unload off-screen pages
- Cache: Use React Native Image cache

### 6. List Rendering

```typescript
// Use FlatList with optimizations
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.path}
  initialNumToRender={10}        // Render 10 items initially
  maxToRenderPerBatch={5}        // Render 5 items per batch
  windowSize={5}                 // Keep 5 screens worth of items
  removeClippedSubviews={true}   // Unmount off-screen items
  getItemLayout={(data, index) => ({  // Skip measurement
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

## Error Handling

### File System Errors

```typescript
try {
  const files = await RNFS.readDir(path);
  // Process files
} catch (error) {
  if (error.message.includes('permission')) {
    setError('Không có quyền truy cập. Vui lòng cấp quyền trong Settings.');
  } else if (error.message.includes('not found')) {
    setError('Thư mục không tồn tại.');
  } else {
    setError('Lỗi đọc thư mục: ' + error.message);
  }
}
```

### PDF Loading Errors

```typescript
<Pdf
  source={source}
  onError={(error) => {
    console.log('PDF Error:', error);
    Alert.alert('Lỗi PDF', 'Không thể mở file PDF này.');
  }}
/>
```

### AsyncStorage Errors

```typescript
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  console.error('AsyncStorage Error:', error);
  // Fallback: Use in-memory state only
}
```

## Testing Strategy

### Unit Tests (Recommended)

- Custom Hooks: `useReadingHistory`, `usePDFSettings`
- Utility functions: Date formatting, path manipulation
- Data transformations: Manga data parsing

### Integration Tests (Recommended)

- FileManager: Scan → Display → Select flow
- PDFViewer: Open → Read → Save progress flow
- Settings: Change setting → Persist → Load flow

### E2E Tests (Recommended)

- Complete reading flow: Browse → Select manga → Select chapter → Read → Navigate
- Settings flow: Change theme → Change folder → Verify changes

## Security Considerations

### File System Access

- Validate file paths before access
- Check file extensions (only allow .pdf)
- Sanitize user input for folder paths

### Data Storage

- AsyncStorage is unencrypted (OK for non-sensitive data)
- Don't store passwords or sensitive info
- Clear cache on app uninstall

### Permissions

- Request minimum required permissions
- Explain why each permission is needed
- Handle permission denial gracefully

## Scalability

### Current Limitations

- In-memory cache: Limited by device RAM
- Sequential folder scan: Slow for large libraries
- No pagination: Load all manga at once

### Future Improvements

- Virtual list: Only render visible items
- Background sync: Scan folders in background
- Database: Use SQLite for large libraries
- Pagination: Load manga in batches
- Search index: Full-text search capability

---

**Document Version**: 1.0  
**Last Updated**: October 17, 2025
