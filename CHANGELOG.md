# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-17

### 🎉 Initial Release

#### ✨ Features
- **Manga Library Management**
  - Browse manga from local storage
  - Thumbnail preview with main.jpg
  - Automatic manga detection (data.json + main.jpg)
  - Progress bar for downloading manga
  - Cache chapter list to avoid re-scanning

- **PDF Reader**
  - Read manga chapters in PDF format
  - Swipe to change pages
  - Auto-hide controls after 3 seconds
  - Page indicator (current/total)
  - Smooth navigation between chapters
  - Next/Previous chapter buttons
  - Auto-show controls when finishing chapter

- **Reading History**
  - Auto-save reading progress on page change
  - Track last read chapter and page
  - Display recently read manga list
  - Show reading statistics (chapters read, last access time)
  - Continue reading from last position
  - Mark chapters as completed
  - Delete history per manga or all at once

- **Settings & Customization**
  - Theme switching (Light/Dark/System)
  - Folder browser to select manga directory
  - Adjust distance between PDF pages
  - Toggle page indicator visibility
  - Set default PDF folder
  - Reset settings to default

- **User Interface**
  - Material Design with React Native Paper
  - Responsive layout
  - Haptic feedback on interactions
  - Loading states with progress indicators
  - Error handling with user-friendly messages
  - Pull-to-refresh support

#### 🏗️ Technical Implementation
- **Architecture**
  - Component-based architecture
  - React Hooks for state management
  - Context API for global state (Theme)
  - Custom Hooks for business logic
  - File-based routing with Expo Router

- **Storage**
  - AsyncStorage for settings and history
  - react-native-fs for file system access
  - In-memory cache for performance
  - PDF caching (1 hour expiration)

- **Performance**
  - Lazy loading components
  - Memoized callbacks and values
  - Optimized FlatList rendering
  - Image caching
  - Debounced auto-save

#### 📱 Platform Support
- Android 5.0+ (API 21+)
- iOS 13.0+ (ready, not tested)
- Web (experimental support)

#### 🔒 Permissions
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE (Android < 10)
- MANAGE_EXTERNAL_STORAGE (Android 11+)
- READ_MEDIA_* (Android 13+)

#### 📦 Dependencies
- React Native 0.79.5
- Expo SDK 53.0.20
- TypeScript 5.8.3
- React Native Paper 5.14.5
- React Native PDF 6.7.7
- React Native FS 2.20.0
- AsyncStorage 2.2.0

#### 📝 Documentation
- README.md - Project overview and quick start
- ARCHITECTURE.md - Detailed architecture documentation
- API.md - Complete API reference
- DEVELOPMENT.md - Development guide
- PROJECT_SUMMARY.md - Executive summary
- CHANGELOG.md - Version history

#### 🐛 Known Issues
- Large libraries (1000+ manga) may have slow initial load
- No search functionality yet
- No bookmark system for specific pages
- No cloud sync support

#### 🔮 Future Plans
- Search manga by title
- Filter by status/genre
- Bookmark system
- Cloud backup
- Online reading support
- Download manager integration

---

## [Unreleased]

### Planned for 1.1.0
- [ ] Search functionality
- [ ] Filter options
- [ ] Bookmark system
- [ ] Reading statistics dashboard
- [ ] Export/Import history

### Planned for 1.2.0
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Multiple reading modes (RTL, LTR, Vertical)
- [ ] Dark mode for PDF viewer
- [ ] Zoom and pan in PDF
- [ ] Page prefetching

### Planned for 2.0.0
- [ ] Online reading from web sources
- [ ] Integrated download manager
- [ ] Social features (sharing, recommendations)
- [ ] Multiple libraries support
- [ ] Collections and tags

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-10-17 | Initial release with core features |

---

## How to Update

### For Users
1. Download latest APK from releases
2. Uninstall old version (optional, for clean install)
3. Install new version
4. Grant necessary permissions

### For Developers
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run android
# or
.\build-apk.bat
```

---

## Upgrade Notes

### 1.0.0
- First public release
- No migration needed

---

## Contributors

- **Vũ Dương** - [@vuduong1124](https://github.com/vuduong1124) - Initial work

---

## Support

For issues, questions, or suggestions:
- GitHub Issues: https://github.com/vuduong1124/comic-reader-mobile/issues
- Email: vuduong1124@example.com

---

**Note**: This is a living document. All notable changes will be documented here.
