import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Modal, Platform, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import { ActivityIndicator, Card, IconButton, ProgressBar, Text, useTheme as usePaperTheme } from "react-native-paper";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePDFSettings } from "../hooks/usePDFSettings";
import { useReadingHistory } from "../hooks/useReadingHistory";
import PDFViewer from "./PDFViewer";
interface FileItem {
  name: string;
  path: string;
  size: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
  modificationTime?: number;
}

interface MangaData {
  title: string;
  url: string;
  path: string;
  mainPhoto: string;
  chapters: Array<{
    title: string;
    link: string;
  }>;
  total: number;
  isDownload: boolean;
  downloadComplete: number;
  status: string;
}

interface MangaItem {
  name: string;
  path: string;
  title: string;
  thumbnail: string;
  data: MangaData;
}

interface ScanCDIMProps {
  onFileSelect?: (path: string) => void;
  onPathChange?: (path: string) => void;
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

export default function FileManager({ onFileSelect, onPathChange }: ScanCDIMProps) {
  const colorScheme = useColorScheme();
  const paperTheme = usePaperTheme();
  const colors = Colors[colorScheme ?? "light"];
  const { settings, loadSettings } = usePDFSettings();
  const { isChapterRead, updateChapterProgress, getMangaHistory, getLastReadChapter } = useReadingHistory();
  // Đồng bộ với FolderBrowser: Android/media/[package_name]/TruyenPDF
  const packageName = Platform.OS === "android" ? DeviceInfo.getBundleId() : "";
  const mediaFolder =
    Platform.OS === "android"
      ? `${RNFS.ExternalStorageDirectoryPath}/Android/media/${packageName}/TruyenPDF`
      : RNFS.DocumentDirectoryPath;
  const [currentPath, setCurrentPath] = useState<string>(settings.defaultPDFFolder || mediaFolder);
  const [mangaItems, setMangaItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mangaLoading, setMangaLoading] = useState(false); // ✅ Loading state cho khi load manga chapters
  const [loadingMangaPath, setLoadingMangaPath] = useState<string | null>(null); // ✅ Track manga nào đang loading
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPDFPath, setSelectedPDFPath] = useState<string | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<FileItem[]>([]);
  const [currentPDFIndex, setCurrentPDFIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"manga" | "chapters" | "pdf">("manga"); // manga list, chapter list, hoặc pdf viewer
  const [selectedManga, setSelectedManga] = useState<MangaItem | null>(null);
  const [mangaCache, setMangaCache] = useState<Record<string, FileItem[]>>({}); // ✅ Cache cho manga chapters

  // Chỉ reload settings khi tab được focus (không reload toàn bộ component)
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  // Theo dõi sự thay đổi của settings.defaultPDFFolder
  useEffect(() => {
    if (settings.defaultPDFFolder && settings.defaultPDFFolder !== currentPath) {
      setCurrentPath(settings.defaultPDFFolder);
    }
  }, [settings.defaultPDFFolder]);

  useEffect(() => {
    if (currentPath) {
      scanDirectory(currentPath);
      onPathChange?.(currentPath);
    }
  }, [currentPath]);
  const scanDirectory = async (path: string) => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError("Permission not granted!");
        setLoading(false);
        return;
      }

      const files = await RNFS.readDir(path);
      const mangaFolders: MangaItem[] = [];

      // Kiểm tra từng folder xem có phải manga folder không
      for (const file of files) {
        if (file.isDirectory()) {
          const dataJsonPath = `${file.path}/data.json`;
          const mainImagePath = `${file.path}/main.jpg`;

          try {
            // Kiểm tra xem có data.json và main.jpg không
            const dataExists = await RNFS.exists(dataJsonPath);
            const imageExists = await RNFS.exists(mainImagePath);

            if (dataExists && imageExists) {
              // Đọc data.json
              const dataContent = await RNFS.readFile(dataJsonPath, "utf8");
              const mangaData: MangaData = JSON.parse(dataContent);

              mangaFolders.push({
                name: file.name,
                path: file.path,
                title: mangaData.title,
                thumbnail: mainImagePath,
                data: mangaData,
              });
            }
          } catch (err) {
            console.log(`Error checking manga folder ${file.name}:`, err);
            // Bỏ qua folder có lỗi
          }
        }
      }

      // Sắp xếp manga folders theo tên
      mangaFolders.sort((a, b) => a.title.localeCompare(b.title, "vi", { numeric: true }));

      setMangaItems(mangaFolders);

      console.log(`Scanned ${path}: Found ${mangaFolders.length} manga folders`);
    } catch (error: any) {
      console.error("Error scanning directory:", error);
      setError(`Error reading directory: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMangaPress = async (manga: MangaItem) => {
    setMangaLoading(true); // ✅ Hiển thị loading khi load manga
    setLoadingMangaPath(manga.path); // ✅ Track manga đang loading
    try {
      // ✅ Kiểm tra cache trước
      if (mangaCache[manga.path]) {
        console.log(`Using cached chapters for ${manga.title}`);
        setSelectedManga(manga);
        setPdfFiles(mangaCache[manga.path]);
        setViewMode("chapters");
        setMangaLoading(false);
        setLoadingMangaPath(null);
        return;
      }

      // Scan PDF files trong manga folder
      const files = await RNFS.readDir(manga.path);
      const pdfFiles = files.filter((f) => f.isFile() && f.name.toLowerCase().endsWith(".pdf"));

      // Sắp xếp PDF theo thứ tự tự nhiên
      pdfFiles.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });

      if (pdfFiles.length > 0) {
        // ✅ Lưu vào cache
        setMangaCache((prev) => ({
          ...prev,
          [manga.path]: pdfFiles,
        }));

        setSelectedManga(manga);
        setPdfFiles(pdfFiles);
        setViewMode("chapters"); // Chuyển sang view danh sách chapters
      } else {
        setError("Không tìm thấy file PDF trong truyện này");
      }
    } catch (error: any) {
      console.error("Error loading manga PDFs:", error);
      setError(`Lỗi khi tải truyện: ${error.message}`);
    } finally {
      setMangaLoading(false); // ✅ Tắt loading
      setLoadingMangaPath(null); // ✅ Clear loading manga
    }
  };

  const handleChapterPress = (pdfFile: FileItem) => {
    const pdfIndex = pdfFiles.findIndex((pdf) => pdf.path === pdfFile.path);
    setCurrentPDFIndex(pdfIndex);
    setSelectedPDFPath(pdfFile.path);
    setViewMode("pdf");
    setShowPDFViewer(true);
    onFileSelect?.(pdfFile.path);

    // Cập nhật lịch sử đọc khi mở chapter
    if (selectedManga) {
      updateChapterProgress(
        selectedManga.path,
        selectedManga.title,
        pdfFile.path,
        pdfFile.name,
        1, // Bắt đầu từ trang 1
        1 // Sẽ cập nhật khi PDF load xong
      );
    }
  };

  const handleBackToChapters = () => {
    setShowPDFViewer(false);
    setSelectedPDFPath(null);
    setViewMode("chapters");
  };

  const handleBackToManga = () => {
    setViewMode("manga");
    setSelectedManga(null);
    setPdfFiles([]);
  };

  const handleClosePDFViewer = () => {
    if (selectedManga) {
      // Nếu đang đọc manga thì quay về danh sách chapters
      handleBackToChapters();
    } else {
      // Nếu đang đọc PDF riêng lẻ thì về manga list
      setShowPDFViewer(false);
      setSelectedPDFPath(null);
      setCurrentPDFIndex(0);
      setViewMode("manga");
      setSelectedManga(null);
    }
  };

  const handleNextPDF = () => {
    // Linear navigation: chỉ chuyển tiếp nếu không phải file cuối
    if (currentPDFIndex < pdfFiles.length - 1) {
      const nextIndex = currentPDFIndex + 1;
      const nextPDF = pdfFiles[nextIndex];
      setCurrentPDFIndex(nextIndex);
      setSelectedPDFPath(nextPDF.path);
      onFileSelect?.(nextPDF.path);

      // ✅ BUG FIX: Cập nhật lịch sử đọc khi chuyển chapter qua next
      if (selectedManga) {
        updateChapterProgress(
          selectedManga.path,
          selectedManga.title,
          nextPDF.path,
          nextPDF.name,
          1, // Bắt đầu từ trang 1
          1 // Sẽ cập nhật khi PDF load xong
        );
      }
    }
  };

  const handlePreviousPDF = () => {
    // Linear navigation: chỉ chuyển lùi nếu không phải file đầu
    if (currentPDFIndex > 0) {
      const prevIndex = currentPDFIndex - 1;
      const prevPDF = pdfFiles[prevIndex];
      setCurrentPDFIndex(prevIndex);
      setSelectedPDFPath(prevPDF.path);
      onFileSelect?.(prevPDF.path);

      // ✅ BUG FIX: Cập nhật lịch sử đọc khi chuyển chapter qua previous
      if (selectedManga) {
        updateChapterProgress(
          selectedManga.path,
          selectedManga.title,
          prevPDF.path,
          prevPDF.name,
          1, // Bắt đầu từ trang 1
          1 // Sẽ cập nhật khi PDF load xong
        );
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderChapterItem = ({ item }: { item: FileItem }) => {
    const isRead = selectedManga ? isChapterRead(selectedManga.path, item.path) : false;
    const isLastRead = selectedManga ? getLastReadChapter(selectedManga.path)?.chapterPath === item.path : false;

    return (
      <TouchableOpacity onPress={() => handleChapterPress(item)}>
        <Card
          style={[
            styles.fileItem,
            { backgroundColor: paperTheme.colors.surface },
            isLastRead && { borderColor: "#4CAF50", borderWidth: 2 }, // Border xanh cho chapter cuối đọc
          ]}
        >
          <Card.Content style={styles.fileContent}>
            <View style={styles.fileInfo}>
              <View style={styles.chapterIconContainer}>
                <Ionicons
                  name="document-text"
                  size={24}
                  color={isRead ? "#FF5722" : "#FF9F43"} // Đỏ nếu đã đọc, cam nếu chưa
                />
                {isRead && (
                  <View style={styles.readIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#FF5722" />
                  </View>
                )}
              </View>
              <View style={styles.fileDetails}>
                <Text
                  variant="bodyMedium"
                  numberOfLines={1}
                  style={{
                    color: isRead ? "#FF5722" : paperTheme.colors.onSurface,
                    fontWeight: isLastRead ? "bold" : "normal",
                  }}
                >
                  {item.name.replace(".pdf", "")}
                  {isLastRead && " (Đang đọc)"}
                </Text>
                <View style={styles.chapterMetadata}>
                  <Text
                    variant="bodySmall"
                    style={[styles.fileMetadata, { color: paperTheme.colors.onSurfaceVariant }]}
                  >
                    {formatFileSize(item.size)}
                  </Text>
                  {isRead && (
                    <Text variant="bodySmall" style={[styles.readStatus, { color: "#FF5722" }]}>
                      • Đã đọc
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <IconButton icon="chevron-right" size={20} iconColor={paperTheme.colors.onSurfaceVariant} />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderMangaItem = ({ item }: { item: MangaItem }) => {
    const mangaHistory = getMangaHistory(item.path);
    const lastReadChapter = getLastReadChapter(item.path);

    const handleContinueReading = async () => {
      if (lastReadChapter) {
        // Load manga trước (sẽ dùng cache nếu có)
        await handleMangaPress(item);

        // ✅ Sử dụng cache hoặc scan lại
        let chapterFiles: FileItem[];
        if (mangaCache[item.path]) {
          chapterFiles = mangaCache[item.path];
        } else {
          // Fallback nếu cache không có
          const files = await RNFS.readDir(item.path);
          chapterFiles = files.filter((f) => f.isFile() && f.name.toLowerCase().endsWith(".pdf"));
          chapterFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
        }

        // Tìm chapter cuối đọc
        const chapterIndex = chapterFiles.findIndex((pdf) => pdf.path === lastReadChapter.chapterPath);
        if (chapterIndex >= 0) {
          const chapterFile = chapterFiles[chapterIndex];
          setCurrentPDFIndex(chapterIndex);
          setSelectedPDFPath(chapterFile.path);
          setViewMode("pdf");
          setShowPDFViewer(true);
          onFileSelect?.(chapterFile.path);
        }
      } else {
        handleMangaPress(item);
      }
    };

    return (
      <TouchableOpacity onPress={() => handleMangaPress(item)} disabled={loadingMangaPath === item.path}>
        <Card
          style={[
            styles.mangaItem,
            { backgroundColor: paperTheme.colors.surface },
            loadingMangaPath === item.path && { opacity: 0.7 }, // ✅ Dim khi đang loading
          ]}
        >
          <Card.Content style={styles.mangaContent}>
            <View style={styles.mangaInfo}>
              <View style={styles.thumbnailContainer}>
                <Image source={{ uri: `file://${item.thumbnail}` }} style={styles.mangaThumbnail} resizeMode="cover" />
                {/* ✅ Loading overlay trên thumbnail */}
                {loadingMangaPath === item.path && (
                  <View style={styles.thumbnailLoadingOverlay}>
                    <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.mangaDetails}>
                <Text
                  variant="titleMedium"
                  numberOfLines={2}
                  style={[styles.mangaTitle, { color: paperTheme.colors.onSurface }]}
                >
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={[styles.mangaMetadata, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {item.data.total} chương • {item.data.status === "completed" ? "Hoàn thành" : "Đang cập nhật"}
                </Text>
                <Text variant="bodySmall" style={[styles.mangaMetadata, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Đã tải: {item.data.downloadComplete}/{item.data.total} chương
                </Text>
                {/* Hiển thị trạng thái đọc */}
                {mangaHistory && (
                  <>
                    <Text variant="bodySmall" style={[styles.mangaMetadata, { color: "#4CAF50", fontWeight: "bold" }]}>
                      📖 Đã đọc {mangaHistory.readChapters.length} chương
                      {lastReadChapter && ` • Cuối: ${lastReadChapter.chapterName.replace(".pdf", "")}`}
                    </Text>

                    {/* Progress bar cho tiến độ đọc truyện */}
                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={item.data.total > 0 ? mangaHistory.readChapters.length / item.data.total : 0}
                        style={styles.progressBar}
                        color="#4CAF50"
                      />
                      <Text
                        variant="bodySmall"
                        style={[styles.progressText, { color: paperTheme.colors.onSurfaceVariant }]}
                      >
                        {item.data.total > 0
                          ? Math.round((mangaHistory.readChapters.length / item.data.total) * 100)
                          : 0}
                        %
                      </Text>
                    </View>
                  </>
                )}

                {/* Nút tiếp tục đọc */}
                {lastReadChapter && (
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: paperTheme.colors.primary }]}
                    onPress={handleContinueReading}
                  >
                    <Ionicons name="play" size={16} color={paperTheme.colors.onPrimary} />
                    <Text style={[styles.continueButtonText, { color: paperTheme.colors.onPrimary }]}>
                      Tiếp tục đọc
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: paperTheme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text variant="headlineSmall" style={[styles.errorTitle, { color: paperTheme.colors.onBackground }]}>
          Lỗi truy cập
        </Text>
        <Text variant="bodyMedium" style={[styles.errorMessage, { color: paperTheme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={() => scanDirectory(currentPath)}
        >
          <Text style={[styles.retryButtonText, { color: paperTheme.colors.onPrimary }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      {/* Modal for PDF Viewer - Full Screen */}
      <Modal
        visible={showPDFViewer && !!selectedPDFPath}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        {selectedPDFPath && (
          <PDFViewer
            filePath={selectedPDFPath}
            onClose={handleClosePDFViewer}
            onNext={handleNextPDF}
            onPrevious={handlePreviousPDF}
            hasNext={currentPDFIndex < pdfFiles.length - 1} // Chỉ true nếu không phải file cuối
            hasPrevious={currentPDFIndex > 0} // Chỉ true nếu không phải file đầu
            currentIndex={currentPDFIndex + 1}
            totalCount={pdfFiles.length}
            mangaPath={selectedManga?.path}
            mangaTitle={selectedManga?.title}
          />
        )}
      </Modal>

      {viewMode === "chapters" && selectedManga ? (
        <>
          {/* Header cho chapters view */}
          <Card style={[styles.pathHeader, { backgroundColor: paperTheme.colors.surface }]}>
            <Card.Content style={styles.pathContent}>
              <View style={styles.pathInfo}>
                <TouchableOpacity onPress={handleBackToManga} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={20} color={paperTheme.colors.primary} />
                </TouchableOpacity>
                <View style={styles.mangaHeaderInfo}>
                  <Text
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={[styles.mangaHeaderTitle, { color: paperTheme.colors.onSurface }]}
                  >
                    {selectedManga.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.mangaHeaderSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}
                  >
                    {pdfFiles.length} chương
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* ✅ Loading overlay khi đang load manga chapters */}
          {mangaLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
              <ActivityIndicator size="large" color={paperTheme.colors.primary} />
              <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>
                Đang tải danh sách chương...
              </Text>
            </View>
          ) : (
            /* Chapters List */
            <FlatList
              data={pdfFiles}
              keyExtractor={(item, index) => `chapter-${item.path}-${index}`}
              renderItem={renderChapterItem}
              style={[styles.fileList, { backgroundColor: paperTheme.colors.background }]}
              // Tự động scroll đến vị trí chapter đã đọc gần nhất
              initialScrollIndex={(() => {
                if (selectedManga) {
                  const lastReadChapter = getLastReadChapter(selectedManga.path);
                  if (lastReadChapter) {
                    const idx = pdfFiles.findIndex((pdf) => pdf.path === lastReadChapter.chapterPath);
                    return idx >= 0 ? idx : 0;
                  }
                }
                return 0;
              })()}
              getItemLayout={(data, index) => ({
                length: 80, // Chiều cao mỗi item, chỉnh lại nếu cần
                offset: 80 * index,
                index,
              })}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="document-outline" size={48} color={paperTheme.colors.onSurfaceVariant} />
                  <Text
                    variant="bodyMedium"
                    style={[styles.emptyListText, { color: paperTheme.colors.onSurfaceVariant }]}
                  >
                    Không tìm thấy chapter nào trong truyện này
                  </Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <>
          {/* Header hiển thị đường dẫn hiện tại */}
          <Card style={[styles.pathHeader, { backgroundColor: paperTheme.colors.surface }]}>
            <Card.Content style={styles.pathContent}>
              <View style={styles.pathInfo}>
                <Ionicons name="library" size={20} color={paperTheme.colors.primary} />
                <Text
                  variant="bodySmall"
                  style={[styles.pathText, { color: paperTheme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {currentPath
                    .replace("/storage/emulated/0", "/Phone")
                    .replace("/Android/media/com.minhduc08.expoplatform/", "/")}
                </Text>
              </View>
              <Text variant="bodySmall" style={[styles.fileCount, { color: paperTheme.colors.onSurfaceVariant }]}>
                {mangaItems.length} truyện
              </Text>
            </Card.Content>
          </Card>

          {loading && !refreshing ? (
            <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
              <ActivityIndicator size="large" color={paperTheme.colors.primary} />
              <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>Đang quét thư mục...</Text>
            </View>
          ) : (
            <>
              {/* Manga List */}
              {mangaItems.length > 0 ? (
                <FlatList
                  data={mangaItems}
                  keyExtractor={(item, index) => `manga-${item.path}-${index}`}
                  renderItem={renderMangaItem}
                  style={[styles.fileList, { backgroundColor: paperTheme.colors.background }]}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => {
                        setRefreshing(true);
                        setMangaCache({}); // ✅ Clear cache khi refresh để ensure data mới nhất
                        scanDirectory(currentPath);
                      }}
                      colors={[paperTheme.colors.primary]}
                      progressBackgroundColor={paperTheme.colors.surface}
                    />
                  }
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={[styles.emptyList, { backgroundColor: paperTheme.colors.background }]}>
                  <Ionicons name="library-outline" size={48} color={paperTheme.colors.onSurfaceVariant} />
                  <Text
                    variant="bodyMedium"
                    style={[styles.emptyListText, { color: paperTheme.colors.onSurfaceVariant }]}
                  >
                    Không tìm thấy truyện nào có cấu trúc đúng trong thư mục này
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.emptyListSubText, { color: paperTheme.colors.onSurfaceVariant }]}
                  >
                    Truyện cần có file data.json và main.jpg
                  </Text>
                </View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdfViewer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: "bold",
  },
  pathHeader: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    elevation: 1,
    borderRadius: 8,
  },
  pathContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pathInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pathText: {
    marginLeft: 8,
    flex: 1,
  },
  fileCount: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
    borderRadius: 8,
  },
  fileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileMetadata: {
    marginTop: 2,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyListText: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyListSubText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
  },
  mangaItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    borderRadius: 12,
  },
  mangaContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  mangaInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mangaThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  mangaDetails: {
    flex: 1,
    marginLeft: 16,
  },
  mangaTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  mangaMetadata: {
    marginBottom: 2,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: "bold",
  },
  mangaList: {
    maxHeight: 400, // Giới hạn chiều cao để không chiếm hết màn hình
  },
  backButton: {
    paddingRight: 12,
  },
  mangaHeaderInfo: {
    flex: 1,
  },
  mangaHeaderTitle: {
    fontWeight: "bold",
  },
  mangaHeaderSubtitle: {
    marginTop: 2,
  },
  chapterIconContainer: {
    position: "relative",
    marginRight: 12,
  },
  readIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 8,
  },
  chapterMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  readStatus: {
    marginLeft: 4,
    fontWeight: "bold",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  continueButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    minWidth: 35,
    textAlign: "right",
  },
  // ✅ Styles mới cho loading states
  thumbnailContainer: {
    position: "relative",
  },
  thumbnailLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
});
