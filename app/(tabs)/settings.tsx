import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  IconButton,
  RadioButton,
  Switch,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';

import { Colors } from '@/constants/Colors';
import { ThemeMode, useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import FolderBrowser from '../../components/FolderBrowser';
import { usePDFSettings } from '../../hooks/usePDFSettings';
import { useReadingHistory } from '../../hooks/useReadingHistory';

export default function SettingsPage() {
  const colorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useTheme();
  const paperTheme = usePaperTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { settings, loading, saveSettings, resetSettings } = usePDFSettings();
  const { clearAllHistory, getRecentlyReadManga } = useReadingHistory();
  const [tempDistance, setTempDistance] = useState('0');
  const [tempPDFFolder, setTempPDFFolder] = useState('');
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);

  // Cập nhật tempDistance khi settings thay đổi
  useEffect(() => {
    setTempDistance(settings.distanceBetweenPages.toString());
    setTempPDFFolder(settings.defaultPDFFolder);
  }, [settings.distanceBetweenPages, settings.defaultPDFFolder]);

  const handlePageIndicatorToggle = async (value: boolean) => {
    const success = await saveSettings({ showPageIndicator: value });
    if (!success) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    }
  };

  const handleDistanceChange = (text: string) => {
    setTempDistance(text);
  };

  const handleDistanceSave = async () => {
    const distance = parseInt(tempDistance);
    if (isNaN(distance) || distance < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ (>= 0)');
      setTempDistance(settings.distanceBetweenPages.toString());
      return;
    }
    
    const success = await saveSettings({ distanceBetweenPages: distance });
    if (!success) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    }
  };

  const handlePDFFolderChange = (text: string) => {
    setTempPDFFolder(text);
  };

  const handlePDFFolderSave = async () => {
    const success = await saveSettings({ defaultPDFFolder: tempPDFFolder.trim() });
    if (!success) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    }
  };

  const handleOpenFolderBrowser = () => {
    setShowFolderBrowser(true);
  };

  const handleFolderSelect = async (folderPath: string) => {
    setTempPDFFolder(folderPath);
    setShowFolderBrowser(false);
    
    // Tự động lưu sau khi chọn folder
    const success = await saveSettings({ defaultPDFFolder: folderPath });
    if (!success) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    }
  };

  const handleCancelFolderBrowser = () => {
    setShowFolderBrowser(false);
  };

  const handleClearReadingHistory = () => {
    const recentManga = getRecentlyReadManga();
    
    Alert.alert(
      'Xóa lịch sử đọc',
      `Bạn có chắc muốn xóa toàn bộ lịch sử đọc?\n\nHiện có ${recentManga.length} truyện trong lịch sử.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              Alert.alert('Thành công', 'Đã xóa toàn bộ lịch sử đọc');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa lịch sử đọc');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải cài đặt...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.onBackground }]}>
            Cài đặt
          </Text>

          {/* Theme Settings */}
          <Card style={styles.card}>
            <Card.Title 
              title="Giao diện" 
              subtitle="Chọn chế độ hiển thị sáng/tối"
              left={(props) => <IconButton {...props} icon="palette" />}
            />
            <Card.Content>
              <RadioButton.Group 
                onValueChange={(value) => setThemeMode(value as ThemeMode)} 
                value={themeMode}
              >
                <View style={styles.radioRow}>
                  <RadioButton value="light" />
                  <Text variant="bodyMedium" style={[styles.radioLabel, { color: paperTheme.colors.onSurface }]}>
                    Sáng
                  </Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="dark" />
                  <Text variant="bodyMedium" style={[styles.radioLabel, { color: paperTheme.colors.onSurface }]}>
                    Tối
                  </Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="system" />
                  <Text variant="bodyMedium" style={[styles.radioLabel, { color: paperTheme.colors.onSurface }]}>
                    Theo hệ thống
                  </Text>
                </View>
              </RadioButton.Group>
            </Card.Content>
          </Card>

          <Text variant="headlineSmall" style={[styles.subtitle, { color: paperTheme.colors.onBackground }]}>
            Cài đặt PDF Viewer
          </Text>

        {/* Page Indicator Settings */}
        <Card style={styles.card}>
          <Card.Title 
            title="Hiển thị chỉ số trang" 
            subtitle="Bật/tắt hiển thị số trang hiện tại"
            left={(props) => <IconButton {...props} icon="file-document-outline" />}
          />
          <Card.Content>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">Hiển thị "Page X of Y"</Text>
              <Switch
                value={settings.showPageIndicator}
                onValueChange={handlePageIndicatorToggle}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Distance Between Pages */}
        <Card style={styles.card}>
          <Card.Title 
            title="Khoảng cách giữa các trang" 
            subtitle="Điều chỉnh khoảng trống giữa các trang PDF"
            left={(props) => <IconButton {...props} icon="format-line-spacing" />}
          />
          <Card.Content>
            <View style={styles.inputRow}>
              <TextInput
                label="Khoảng cách (pixel)"
                value={tempDistance}
                onChangeText={handleDistanceChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.textInput}
                right={
                  <TextInput.Affix text="px" />
                }
              />
              <Button
                mode="contained"
                onPress={handleDistanceSave}
                style={styles.saveButton}
                disabled={tempDistance === settings.distanceBetweenPages.toString()}
              >
                Lưu
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.hint}>
              Giá trị 0 = các trang sát nhau, giá trị lớn hơn = khoảng cách nhiều hơn
            </Text>
          </Card.Content>
        </Card>

        {/* Default PDF Folder */}
        <Card style={styles.card}>
          <Card.Title 
            title="Thư mục PDF mặc định" 
            subtitle="Đường dẫn thư mục để mở PDF file"
            left={(props) => <IconButton {...props} icon="folder-outline" />}
          />
          <Card.Content>
            <View style={styles.folderRow}>
              <TextInput
                label="Đường dẫn thư mục"
                value={tempPDFFolder || 'Chưa chọn thư mục'}
                mode="outlined"
                style={styles.folderInput}
                editable={false}
                right={
                  <TextInput.Icon 
                    icon="folder-open" 
                    onPress={handleOpenFolderBrowser}
                  />
                }
              />
            </View>
            <View style={styles.folderActions}>
              <Button
                mode="contained"
                onPress={handleOpenFolderBrowser}
                style={styles.browseButton}
                icon="folder-search"
              >
                Chọn thư mục
              </Button>
              {tempPDFFolder && (
                <Button
                  mode="outlined"
                  onPress={() => handleFolderSelect('')}
                  style={styles.clearButton}
                  icon="close"
                >
                  Xóa
                </Button>
              )}
            </View>
            <Text variant="bodySmall" style={styles.hint}>
              Nhấn "Chọn thư mục" để duyệt và chọn thư mục chứa file PDF
            </Text>
          </Card.Content>
        </Card>

        {/* Reading History Settings */}
        <Card style={[styles.settingCard, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Title
            title="Lịch sử đọc"
            subtitle="Quản lý lịch sử đọc truyện"
            left={(props) => <IconButton {...props} icon="history" />}
          />
          <Card.Content>
            <View style={styles.historyInfo}>
              <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurface }}>
                Lịch sử đọc giúp bạn theo dõi tiến độ đọc truyện và tiếp tục từ chapter cuối đã đọc.
              </Text>
              <Text variant="bodySmall" style={[styles.hint, { marginTop: 8 }]}>
                Hiện có {getRecentlyReadManga().length} truyện trong lịch sử
              </Text>
            </View>
            <View style={styles.historyActions}>
              <Button
                mode="outlined"
                onPress={handleClearReadingHistory}
                style={styles.clearHistoryButton}
                icon="delete-outline"
                buttonColor={paperTheme.colors.errorContainer}
                textColor={paperTheme.colors.error}
              >
                Xóa toàn bộ lịch sử
              </Button>
            </View>
          </Card.Content>
        </Card>

        </View>
      </ScrollView>
      
      <Modal
        visible={showFolderBrowser}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <FolderBrowser
          onFolderSelect={handleFolderSelect}
          onCancel={handleCancelFolderBrowser}
          initialPath={tempPDFFolder || "/storage/emulated/0"}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
  },
  saveButton: {
    alignSelf: 'flex-end',
  },
  hint: {
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  resetButton: {
    alignSelf: 'flex-start',
  },
  folderRow: {
    marginBottom: 12,
  },
  folderInput: {
    flex: 1,
  },
  folderActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  browseButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    marginLeft: 8,
    flex: 1,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  settingCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  historyInfo: {
    marginBottom: 16,
  },
  historyActions: {
    alignItems: 'flex-start',
  },
  clearHistoryButton: {
    borderColor: '#ef4444',
  },
});
