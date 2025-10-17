# 📚 Comic Reader Mobile

Ứng dụng đọc truyện/manga di động được xây dựng bằng React Native và Expo, hỗ trợ đọc file PDF với nhiều tính năng nâng cao.

## 📖 Tổng quan

**Comic Reader Mobile** là một ứng dụng mobile đọc truyện tranh/manga dưới dạng PDF, được phát triển với React Native Expo. Ứng dụng hỗ trợ quản lý thư viện truyện, lưu lịch sử đọc, và cung cấp trải nghiệm đọc tối ưu với nhiều tùy chỉnh.

### ✨ Tính năng chính

- 📱 **Quản lý thư viện truyện**: Browse và quản lý manga từ thư mục local
- 📖 **Đọc PDF**: Đọc các chapter manga dưới dạng PDF với UI tối ưu
- 💾 **Lịch sử đọc**: Tự động lưu tiến độ đọc của từng chapter
- 🎨 **Theme**: Hỗ trợ Light/Dark mode và theo hệ thống
- ⚙️ **Tùy chỉnh**: Điều chỉnh khoảng cách giữa các trang, folder mặc định
- 📂 **File Manager**: Browse folder để chọn thư mục chứa manga
- 🔄 **Navigation**: Chuyển chapter dễ dàng với các nút điều hướng
- 📊 **Thống kê**: Xem số chapter đã đọc và tiến độ

## 🏗️ Kiến trúc dự án

### Công nghệ sử dụng

- **Framework**: React Native 0.79.5 + Expo SDK 53
- **Navigation**: Expo Router 5.1.4
- **UI Components**: React Native Paper 5.14.5
- **State Management**: React Hooks (useState, useContext, useEffect)
- **Storage**: AsyncStorage để lưu settings và lịch sử
- **PDF Reader**: react-native-pdf 6.7.7
- **File System**: react-native-fs 2.20.0
- **Language**: TypeScript 5.8.3

### Cấu trúc thư mục

```
comic-reader-mobile/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout với ThemeProvider
│   ├── +not-found.tsx           # 404 page
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx          # Tab layout config
│       ├── index.tsx            # Home tab - File Manager
│       └── settings.tsx         # Settings tab
│
├── components/                   # React components
│   ├── FileManager.tsx          # Quản lý thư viện manga (916 dòng)
│   ├── FolderBrowser.tsx        # Browse folder để chọn thư mục
│   ├── PDFViewer.tsx            # Component đọc PDF (327 dòng)
│   ├── ReadingHistoryScreen.tsx # Màn hình lịch sử đọc (212 dòng)
│   ├── Header.tsx               # Header component
│   ├── HapticTab.tsx            # Tab với haptic feedback
│   └── ui/                      # UI components
│       ├── IconSymbol.tsx
│       ├── TabBarBackground.tsx
│       └── ...
│
├── hooks/                        # Custom React Hooks
│   ├── useReadingHistory.ts     # Hook quản lý lịch sử đọc (165 dòng)
│   ├── usePDFSettings.ts        # Hook quản lý settings PDF (69 dòng)
│   ├── useColorScheme.ts        # Hook theme color
│   └── useThemeColor.ts         # Hook lấy màu theo theme
│
├── context/                      # React Context
│   └── ThemeContext.tsx         # Context quản lý theme (76 dòng)
│
├── constants/                    # Constants
│   └── Colors.ts                # Color palette cho light/dark mode
│
├── assets/                       # Static assets
│   ├── images/                  # Icons, splash screen
│   ├── fonts/                   # Custom fonts
│   └── web.css                  # Web styles
│
├── scripts/                      # Utility scripts
│   └── reset-project.js         # Script reset project
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── eslint.config.js             # ESLint config
├── build-apk.bat                # Script build APK (Windows)
└── fastbuild.bat                # Script fast build (Windows)
```

## 📦 Data Models

### MangaData Interface
Cấu trúc dữ liệu manga được lưu trong file `data.json`:

```typescript
interface MangaData {
  title: string;              // Tên manga
  url: string;                // URL nguồn
  path: string;               // Đường dẫn local
  mainPhoto: string;          // Ảnh thumbnail (main.jpg)
  chapters: Array<{
    title: string;            // Tên chapter
    link: string;             // Link chapter
  }>;
  total: number;              // Tổng số chapter
  isDownload: boolean;        // Đã download hay chưa
  downloadComplete: number;   // Số chapter đã download
  status: string;             // Trạng thái
}
```

### Reading History
Lịch sử đọc được lưu trong AsyncStorage:

```typescript
interface ReadingProgress {
  chapterPath: string;        // Đường dẫn chapter
  chapterName: string;        // Tên chapter
  currentPage: number;        // Trang hiện tại
  totalPages: number;         // Tổng số trang
  lastReadTime: number;       // Thời gian đọc cuối
  isCompleted: boolean;       // Đã đọc xong chưa
}

interface MangaReadingHistory {
  mangaPath: string;          // Đường dẫn manga
  mangaTitle: string;         // Tên manga
  lastReadChapter?: ReadingProgress;  // Chapter đọc cuối
  readChapters: string[];     // Danh sách chapter đã đọc
  lastAccessTime: number;     // Thời gian truy cập cuối
}
```

### PDF Settings
Cài đặt người dùng:

```typescript
interface PDFSettings {
  showPageIndicator: boolean;    // Hiển thị số trang
  distanceBetweenPages: number;  // Khoảng cách giữa các trang
  defaultPDFFolder: string;      // Thư mục manga mặc định
}
```

## 🎯 Luồng hoạt động chính

### 1. Khởi động ứng dụng
1. Load theme preference từ AsyncStorage
2. Load PDF settings (folder mặc định, spacing...)
3. Load lịch sử đọc
4. Navigate đến Home tab (FileManager)

### 2. Quản lý thư viện (FileManager)
1. Scan thư mục mặc định hoặc được chọn
2. Tìm các folder manga (có `data.json` + `main.jpg`)
3. Hiển thị danh sách manga với thumbnail
4. Hiển thị progress bar cho manga đang download
5. Cache chapter list để tránh re-scan

### 3. Đọc manga
1. User chọn manga → Hiển thị danh sách chapter
2. User chọn chapter → Mở PDFViewer
3. PDFViewer tự động:
   - Restore trang cuối đọc (nếu có)
   - Lưu tiến độ khi đổi trang
   - Auto-hide controls sau 3 giây
   - Hiển thị nút Next/Previous chapter
4. Khi đọc xong → Tự động hiện controls + gợi ý chapter tiếp theo

### 4. Lịch sử đọc
1. Tự động lưu tiến độ mỗi khi đổi trang
2. Đánh dấu chapter đã đọc
3. Lưu thời gian đọc cuối
4. Hiển thị danh sách manga đã đọc gần đây
5. Cho phép xóa lịch sử từng manga hoặc toàn bộ

## 🔧 Các Hook quan trọng

### useReadingHistory
Quản lý lịch sử đọc:

```typescript
const {
  updateChapterProgress,    // Cập nhật tiến độ đọc
  markChapterAsRead,        // Đánh dấu đã đọc
  getMangaHistory,          // Lấy lịch sử 1 manga
  isChapterRead,            // Kiểm tra đã đọc chưa
  getLastReadChapter,       // Lấy chapter đọc cuối
  getRecentlyReadManga,     // Lấy danh sách đã đọc gần đây
  clearMangaHistory,        // Xóa lịch sử 1 manga
  clearAllHistory,          // Xóa toàn bộ lịch sử
} = useReadingHistory();
```

### usePDFSettings
Quản lý cài đặt:

```typescript
const {
  settings,          // Object settings hiện tại
  loading,           // Loading state
  saveSettings,      // Lưu settings mới
  resetSettings,     // Reset về mặc định
  loadSettings,      // Reload settings
} = usePDFSettings();
```

### useTheme
Quản lý theme:

```typescript
const {
  theme,           // 'light' | 'dark' (theme thực tế đang dùng)
  themeMode,       // 'light' | 'dark' | 'system'
  setThemeMode,    // Set theme mode
  toggleTheme,     // Toggle giữa các mode
} = useTheme();
```

## 🎨 Theming

Ứng dụng hỗ trợ 3 chế độ theme:
- **Light Mode**: Theme sáng
- **Dark Mode**: Theme tối
- **System**: Theo hệ thống

Colors được định nghĩa trong `constants/Colors.ts`:

```typescript
export const Colors = {
  light: {
    background: '#ffffff',
    text: '#000000',
    primary: '#007AFF',
    // ...
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    primary: '#0A84FF',
    // ...
  }
};
```

## 📱 Cấu hình Android

### Permissions
Ứng dụng yêu cầu các quyền sau (trong `app.json`):
- `READ_EXTERNAL_STORAGE`: Đọc file từ storage
- `WRITE_EXTERNAL_STORAGE`: Ghi file (Android < 10)
- `MANAGE_EXTERNAL_STORAGE`: Quản lý storage (Android 11+)
- `READ_MEDIA_IMAGES`: Đọc ảnh (Android 13+)
- `READ_MEDIA_VIDEO`: Đọc video (Android 13+)
- `READ_MEDIA_AUDIO`: Đọc audio (Android 13+)

### Build Configuration
- **Package**: `com.minhduc08.expoplatform`
- **ABI Filters**: `arm64-v8a`, `x86_64` (tối ưu kích thước APK)
- **New Architecture**: Enabled
- **Edge to Edge**: Enabled

### Default Folder
Manga mặc định được lưu tại:
```
/storage/emulated/0/Android/media/com.minhduc08.expoplatform/TruyenPDF
```

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js >= 18
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android development)
- Xcode (cho iOS development - chỉ trên macOS)

### Cài đặt dependencies

```bash
npm install
```

### Chạy development

```bash
# Start Expo development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (chỉ macOS)
npm run ios

# Chạy trên web
npm run web
```

### Build APK (Windows)

```bash
# Build APK cục bộ
.\build-apk.bat

# Fast build
.\fastbuild.bat
```

### Build với EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK for Android
eas build -p android --profile preview

# Build for production
eas build -p android --profile production
```

## 📝 Scripts

### package.json scripts

- `npm start`: Khởi động Expo development server
- `npm run android`: Chạy trên Android emulator/device
- `npm run ios`: Chạy trên iOS simulator/device
- `npm run web`: Chạy trên web browser
- `npm run lint`: Chạy ESLint
- `npm run reset-project`: Reset project về trạng thái ban đầu

## 🗂️ Cấu trúc Manga Folder

Mỗi manga folder cần có cấu trúc:

```
MangaName/
├── data.json          # Metadata manga
├── main.jpg           # Thumbnail manga
├── Chapter 1.pdf      # Chapter PDF files
├── Chapter 2.pdf
├── Chapter 3.pdf
└── ...
```

**data.json** ví dụ:
```json
{
  "title": "One Piece",
  "url": "https://example.com/manga/one-piece",
  "path": "/storage/.../TruyenPDF/OnePiece",
  "mainPhoto": "main.jpg",
  "chapters": [
    {
      "title": "Chapter 1: Romance Dawn",
      "link": "chapter-1-url"
    }
  ],
  "total": 1000,
  "isDownload": true,
  "downloadComplete": 50,
  "status": "ongoing"
}
```

## 🔍 Tính năng nổi bật

### 1. Auto-save Reading Progress
- Tự động lưu trang hiện tại mỗi khi user đổi trang
- Restore vị trí cuối khi mở lại chapter
- Đánh dấu chapter đã đọc xong

### 2. Smart Chapter Navigation
- Nút Previous/Next chapter với disable state thông minh
- Gợi ý chapter tiếp theo khi đọc xong
- Continue reading từ màn hình lịch sử

### 3. Folder Browser
- Browse toàn bộ storage để chọn thư mục
- Hiển thị icon folder/file phân biệt
- Hỗ trợ navigate parent folder
- Lưu folder mặc định

### 4. Cache & Performance
- Cache danh sách chapter để tránh re-scan
- Loading state riêng cho từng manga
- Lazy load manga data
- Optimize re-render với React.memo và useCallback

### 5. Reading Statistics
- Số chapter đã đọc
- Thời gian đọc cuối
- Progress bar mỗi chapter
- Danh sách manga đã đọc gần đây

## 🐛 Troubleshooting

### Lỗi Permission
Nếu app không thể đọc file:
1. Kiểm tra permissions trong Settings > Apps > Comic Reader
2. Grant quyền "Manage all files" (Android 11+)
3. Restart app

### PDF không hiển thị
1. Kiểm tra file PDF có hợp lệ không
2. Kiểm tra đường dẫn file có đúng không
3. Clear cache và reload

### Lịch sử đọc bị mất
- Lịch sử lưu trong AsyncStorage
- Không bị mất khi restart app
- Chỉ mất khi clear app data hoặc uninstall

## 🔮 Future Improvements

### Tính năng có thể thêm:
- [ ] Bookmark trang cụ thể
- [ ] Search manga trong thư viện
- [ ] Filter manga theo status/genre
- [ ] Cloud sync lịch sử đọc
- [ ] Đọc online từ các nguồn web
- [ ] Download manager tích hợp
- [ ] Reading mode (left-to-right, right-to-left)
- [ ] Zoom and pan trong PDF viewer
- [ ] Dark mode cho PDF viewer
- [ ] Export/Import lịch sử đọc

### Cải thiện hiệu năng:
- [ ] Virtual list cho manga library lớn
- [ ] Lazy load thumbnails
- [ ] Optimize PDF cache
- [ ] Background sync

## 📄 License

Private project - All rights reserved

## 👨‍💻 Developer

**Vũ Dương**
- GitHub: [@vuduong1124](https://github.com/vuduong1124)
- Project: comic-reader-mobile

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub repository.

---

**Built with ❤️ using React Native & Expo**
