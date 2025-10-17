import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import DeviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text,
  useTheme as usePaperTheme
} from 'react-native-paper';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FileItem {
  name: string;
  path: string;
  size: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
  modificationTime?: number;
}

interface FolderBrowserProps {
  onFolderSelect: (path: string) => void;
  onCancel: () => void;
  initialPath?: string;
}

async function requestPermission() {
  if (Platform.OS === "android") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission not granted!");
      return false;
    }
  }
  return true;
}

export default function FolderBrowser({ onFolderSelect, onCancel, initialPath }: FolderBrowserProps) {
  const colorScheme = useColorScheme();
  const paperTheme = usePaperTheme();
  const colors = Colors[colorScheme ?? 'light'];
  // Tạo đường dẫn Android/media/[package_name]/TruyenPDF
  const packageName = Platform.OS === "android" ? DeviceInfo.getBundleId() : "";
  const mediaFolder = Platform.OS === "android"
    ? `${RNFS.ExternalStorageDirectoryPath}/Android/media/${packageName}/TruyenPDF`
    : RNFS.DocumentDirectoryPath;
  const [currentPath, setCurrentPath] = useState<string>(initialPath || mediaFolder);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  useEffect(() => {
    if (currentPath) {
      // Tạo folder nếu chưa tồn tại
      RNFS.mkdir(currentPath)
        .then(() => scanDirectory(currentPath))
        .catch(() => scanDirectory(currentPath));
    }
  }, [currentPath]);

  const scanDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError("Không có quyền truy cập!");
        setLoading(false);
        return;
      }
      
      const files = await RNFS.readDir(path);
      
      // Chỉ lấy các folder và sắp xếp theo tên
      const folderItems = files
        .filter(file => file.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));
      
      setFolders(folderItems);
      
      console.log(`Scanned ${path}: Found ${folderItems.length} folders`);
    } catch (error: any) {
      console.error('Error scanning directory:', error);
      setError(`Lỗi đọc thư mục: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const navigateToFolder = (folder: FileItem) => {
    setPathHistory(prev => [...prev, currentPath]);
    setCurrentPath(folder.path);
  };

  const navigateBack = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      setCurrentPath(previousPath);
    } else {
      // Nếu không có history, thử lên thư mục cha
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      if (parentPath && parentPath !== currentPath) {
        setCurrentPath(parentPath);
      }
    }
  };

  const navigateToParent = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (parentPath && parentPath !== currentPath) {
      setPathHistory(prev => [...prev, currentPath]);
      setCurrentPath(parentPath);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    scanDirectory(currentPath);
  };

  const handleSelectCurrentFolder = () => {
    onFolderSelect(currentPath);
  };

  const renderFolderItem = ({ item }: { item: FileItem }) => (
    <TouchableOpacity onPress={() => navigateToFolder(item)}>
      <Card style={[styles.folderItem, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content style={styles.folderContent}>
          <View style={styles.folderInfo}>
            <Ionicons
              name="folder"
              size={24}
              color="#4285F4"
            />
            <View style={styles.folderDetails}>
              <Text variant="bodyMedium" numberOfLines={1} style={{ color: paperTheme.colors.onSurface }}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={[styles.folderPath, { color: paperTheme.colors.onSurfaceVariant }]}>
                {item.path}
              </Text>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
            iconColor={paperTheme.colors.onSurfaceVariant}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { 
      backgroundColor: paperTheme.colors.surface,
      borderBottomColor: paperTheme.colors.outline 
    }]}>
      <View style={styles.navigationBar}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={paperTheme.colors.onSurface}
          onPress={navigateBack}
          disabled={pathHistory.length === 0 && currentPath === "/storage/emulated/0"}
        />
        <IconButton
          icon="arrow-up"
          size={24}
          iconColor={paperTheme.colors.onSurface}
          onPress={navigateToParent}
          disabled={currentPath === "/" || currentPath === "/storage/emulated/0"}
        />
        <IconButton
          icon="refresh"
          size={24}
          iconColor={paperTheme.colors.onSurface}
          onPress={handleRefresh}
        />
      </View>
      
      <View style={styles.pathContainer}>
        <Text variant="bodySmall" style={[styles.currentPath, { color: paperTheme.colors.onSurfaceVariant }]} numberOfLines={2}>
          Thư mục hiện tại: {currentPath}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleSelectCurrentFolder}
          style={styles.selectButton}
          icon="check"
        >
          Chọn thư mục này
        </Button>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.cancelButton}
        >
          Hủy
        </Button>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: paperTheme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text variant="titleMedium" style={[styles.errorTitle, { color: paperTheme.colors.error }]}>
          Lỗi đọc thư mục
        </Text>
        <Text variant="bodyMedium" style={[styles.errorMessage, { color: paperTheme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => scanDirectory(currentPath)} style={styles.retryButton}>
          Thử lại
        </Button>
        <Button mode="outlined" onPress={onCancel} style={styles.cancelButton}>
          Hủy
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}> 
      {/* Hiển thị đường dẫn Android/media cho người dùng biết nơi chép file */}
      <View style={{ padding: 12, backgroundColor: '#eee', borderBottomWidth: 1, borderColor: '#ccc' }}>
        <Text style={{ fontSize: 14, color: colors.text }}>
          Thư mục truyện của app: {mediaFolder}
        </Text>
        <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Hãy chép file PDF vào thư mục này (Android/media/{packageName}/TruyenPDF) để app đọc được trên mọi phiên bản Android.
        </Text>
      </View>
      {renderHeader()}
      
      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>Đang tải danh sách thư mục...</Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolderItem}
          keyExtractor={(item) => item.path}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[paperTheme.colors.primary]}
              progressBackgroundColor={paperTheme.colors.surface}
            />
          }
          contentContainerStyle={[styles.listContainer, { backgroundColor: paperTheme.colors.background }]}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  pathContainer: {
    marginBottom: 12,
  },
  currentPath: {
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  folderItem: {
    marginBottom: 8,
  },
  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderDetails: {
    marginLeft: 12,
    flex: 1,
  },
  folderPath: {
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginBottom: 8,
  },
});
