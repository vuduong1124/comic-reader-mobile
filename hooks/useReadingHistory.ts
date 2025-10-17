import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface ReadingProgress {
  chapterPath: string;
  chapterName: string;
  currentPage: number;
  totalPages: number;
  lastReadTime: number;
  isCompleted: boolean;
}

export interface MangaReadingHistory {
  mangaPath: string;
  mangaTitle: string;
  lastReadChapter?: ReadingProgress;
  readChapters: string[]; // Array of chapter paths that were read
  lastAccessTime: number;
}

const READING_HISTORY_KEY = 'mangaReadingHistory';

export const useReadingHistory = () => {
  const [history, setHistory] = useState<Record<string, MangaReadingHistory>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(READING_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (updatedHistory: Record<string, MangaReadingHistory>) => {
    try {
      await AsyncStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  };

  // Cập nhật tiến độ đọc của 1 chapter
  const updateChapterProgress = async (
    mangaPath: string,
    mangaTitle: string,
    chapterPath: string,
    chapterName: string,
    currentPage: number,
    totalPages: number
  ) => {
    const now = Date.now();
    const isCompleted = currentPage >= totalPages;

    const newProgress: ReadingProgress = {
      chapterPath,
      chapterName,
      currentPage,
      totalPages,
      lastReadTime: now,
      isCompleted
    };

    const updatedHistory = { ...history };
    
    if (!updatedHistory[mangaPath]) {
      updatedHistory[mangaPath] = {
        mangaPath,
        mangaTitle,
        readChapters: [],
        lastAccessTime: now
      };
    }

    // Cập nhật chapter hiện tại
    updatedHistory[mangaPath].lastReadChapter = newProgress;
    updatedHistory[mangaPath].lastAccessTime = now;

    // Thêm vào danh sách đã đọc nếu chưa có
    if (!updatedHistory[mangaPath].readChapters.includes(chapterPath)) {
      updatedHistory[mangaPath].readChapters.push(chapterPath);
    }

    await saveHistory(updatedHistory);
  };

  // Đánh dấu chapter đã hoàn thành
  const markChapterAsRead = async (mangaPath: string, chapterPath: string) => {
    const updatedHistory = { ...history };
    
    if (updatedHistory[mangaPath]) {
      if (!updatedHistory[mangaPath].readChapters.includes(chapterPath)) {
        updatedHistory[mangaPath].readChapters.push(chapterPath);
        updatedHistory[mangaPath].lastAccessTime = Date.now();
        await saveHistory(updatedHistory);
      }
    }
  };

  // Lấy lịch sử đọc của 1 truyện
  const getMangaHistory = (mangaPath: string): MangaReadingHistory | null => {
    return history[mangaPath] || null;
  };

  // Kiểm tra chapter đã đọc chưa
  const isChapterRead = (mangaPath: string, chapterPath: string): boolean => {
    const mangaHistory = history[mangaPath];
    return mangaHistory ? mangaHistory.readChapters.includes(chapterPath) : false;
  };

  // Lấy chapter cuối đọc
  const getLastReadChapter = (mangaPath: string): ReadingProgress | null => {
    const mangaHistory = history[mangaPath];
    return mangaHistory?.lastReadChapter || null;
  };

  // Xóa lịch sử đọc của 1 truyện
  const clearMangaHistory = async (mangaPath: string) => {
    const updatedHistory = { ...history };
    delete updatedHistory[mangaPath];
    await saveHistory(updatedHistory);
  };

  // Xóa toàn bộ lịch sử
  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem(READING_HISTORY_KEY);
      setHistory({});
    } catch (error) {
      console.error('Error clearing reading history:', error);
    }
  };

  // Lấy danh sách truyện đã đọc gần đây (sắp xếp theo thời gian)
  const getRecentlyReadManga = (): MangaReadingHistory[] => {
    return Object.values(history)
      .sort((a, b) => b.lastAccessTime - a.lastAccessTime);
  };

  return {
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
    loadHistory
  };
};
