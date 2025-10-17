import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme
} from 'react-native-paper';

import { MangaReadingHistory, useReadingHistory } from '../hooks/useReadingHistory';

interface ReadingHistoryScreenProps {
  onMangaSelect?: (mangaPath: string) => void;
}

export default function ReadingHistoryScreen({ onMangaSelect }: ReadingHistoryScreenProps) {
  const paperTheme = usePaperTheme();
  const { getRecentlyReadManga, clearAllHistory, clearMangaHistory } = useReadingHistory();
  
  const recentManga = getRecentlyReadManga();

  const formatLastReadTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return `${Math.floor(diff / 86400000)} ngày trước`;
  };

  const handleClearAllHistory = async () => {
    await clearAllHistory();
  };

  const handleClearMangaHistory = async (mangaPath: string) => {
    await clearMangaHistory(mangaPath);
  };

  const renderHistoryItem = ({ item }: { item: MangaReadingHistory }) => (
    <TouchableOpacity onPress={() => onMangaSelect?.(item.mangaPath)}>
      <Card style={[styles.historyItem, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content style={styles.historyContent}>
          <View style={styles.historyInfo}>
            <View style={styles.historyDetails}>
              <Text variant="titleMedium" numberOfLines={2} style={[styles.mangaTitle, { color: paperTheme.colors.onSurface }]}>
                {item.mangaTitle}
              </Text>
              
              {item.lastReadChapter && (
                <>
                  <Text variant="bodySmall" style={[styles.chapterInfo, { color: paperTheme.colors.primary }]}>
                    📖 {item.lastReadChapter.chapterName.replace('.pdf', '')}
                  </Text>
                  <Text variant="bodySmall" style={[styles.progressInfo, { color: paperTheme.colors.onSurfaceVariant }]}>
                    Trang {item.lastReadChapter.currentPage}/{item.lastReadChapter.totalPages}
                    {item.lastReadChapter.isCompleted && ' • Đã hoàn thành'}
                  </Text>
                </>
              )}
              
              <Text variant="bodySmall" style={[styles.readStats, { color: paperTheme.colors.onSurfaceVariant }]}>
                Đã đọc {item.readChapters.length} chương • {formatLastReadTime(item.lastAccessTime)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleClearMangaHistory(item.mangaPath)}
            >
              <Ionicons name="trash-outline" size={20} color={paperTheme.colors.error} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      {/* Header */}
      <Card style={[styles.header, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Ionicons name="time" size={24} color={paperTheme.colors.primary} />
            <Text variant="titleLarge" style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
              Lịch sử đọc
            </Text>
          </View>
          
          {recentManga.length > 0 && (
            <Button 
              mode="outlined" 
              onPress={handleClearAllHistory}
              compact
              icon="trash-outline"
            >
              Xóa tất cả
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* History List */}
      {recentManga.length > 0 ? (
        <FlatList
          data={recentManga}
          keyExtractor={(item) => item.mangaPath}
          renderItem={renderHistoryItem}
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyHistory}>
          <Ionicons name="book-outline" size={64} color={paperTheme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={[styles.emptyTitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            Chưa có lịch sử đọc
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            Bắt đầu đọc truyện để xem lịch sử tại đây
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    elevation: 1,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    borderRadius: 12,
  },
  historyContent: {
    padding: 16,
  },
  historyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyDetails: {
    flex: 1,
  },
  mangaTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chapterInfo: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  progressInfo: {
    marginBottom: 4,
  },
  readStats: {
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});
