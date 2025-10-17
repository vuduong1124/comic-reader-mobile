import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Pdf from "react-native-pdf";

import { usePDFSettings } from "../hooks/usePDFSettings";
import { useReadingHistory } from "../hooks/useReadingHistory";

interface Props {
  filePath: string; // path file pdf được chọn
  onClose?: () => void; // callback khi đóng PDF
  onNext?: () => void; // callback chuyển PDF tiếp theo
  onPrevious?: () => void; // callback chuyển PDF trước đó
  hasNext?: boolean; // có PDF tiếp theo không
  hasPrevious?: boolean; // có PDF trước đó không
  currentIndex?: number; // vị trí hiện tại trong danh sách
  totalCount?: number; // tổng số PDF
  mangaPath?: string; // đường dẫn manga (để lưu lịch sử)
  mangaTitle?: string; // tên manga (để lưu lịch sử)
}

const PDFViewer: React.FC<Props> = ({
  filePath,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  currentIndex = 1,
  totalCount = 1,
  mangaPath,
  mangaTitle,
}) => {
  const { settings } = usePDFSettings();
  const { updateChapterProgress } = useReadingHistory();
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const source = { uri: "file://" + filePath, cache: true, expiration: 1000 * 60 * 60 }; //1h cache

  // Hide status bar when component mounts, restore when unmounts
  useEffect(() => {
    StatusBar.setHidden(true, "fade");

    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, []);

  // Auto-hide controls sau 3 giây (tăng thời gian để ít flicker hơn)
  useEffect(() => {
    if (showControls) {
      // Clear timeout cũ
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (currentPage < totalPages) {
        // Set timeout mới
        hideTimeoutRef.current = setTimeout(() => {
          hideControls();
        }, 3000); // Tăng từ 2s lên 3s
      }
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showControls]);

  const showControlsWithAnimation = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 150, // Giảm thời gian animation
      useNativeDriver: true,
    }).start();
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 150, // Giảm thời gian animation
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  // Lưu tiến độ đọc khi thay đổi trang
  useEffect(() => {
    if (mangaPath && mangaTitle && currentPage > 0 && totalPages > 0) {
      const fileName = filePath.split("/").pop() || "";
      updateChapterProgress(mangaPath, mangaTitle, filePath, fileName, currentPage, totalPages);

      // Kiểm tra nếu đã đọc xong chapter này và có chapter tiếp theo
      if (currentPage >= totalPages && hasNext) {
        // Có thể thêm notification hoặc popup gợi ý đọc chapter tiếp theo
        console.log("Chapter completed! Next chapter available.");
      }
    }
  }, [currentPage, totalPages, mangaPath, mangaTitle, filePath, updateChapterProgress, hasNext]);

  const handlePDFPress = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsWithAnimation();
    }
  };

  return (
    <View style={styles.container}>
      {/* translucent backgroundColor="transparent"  */}
      <StatusBar hidden />
      <View style={styles.pdfContainer}>
        <Pdf
          source={source}
          onPageChanged={(page, numberOfPages) => {
            setCurrentPage(page);
            setTotalPages(numberOfPages);
            if (numberOfPages > 0 && page >= numberOfPages - 1) {
              setShowControls(true);
              Animated.timing(controlsOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }).start();
            } else if (showControls && page > 2) {
              // Clear timeout cũ
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
              }
              hideControls();
            }
          }}
          onError={(error: any) => {
            console.log("Lỗi PDF:", error);
            Alert.alert("Lỗi PDF", error.message);
          }}
          fitPolicy={0}
          spacing={settings.distanceBetweenPages}
          maxScale={1.0}
          enableDoubleTapZoom={false}
          style={styles.pdf}
          renderActivityIndicator={() => (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải PDF...</Text>
            </View>
          )}
        />
      </View>

      {/* Overlay Controls */}
      {showControls && (
        <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]} pointerEvents="box-none">
          {/* Top bar with file info */}
          <View style={styles.topBar} pointerEvents="box-none">
            <Text style={styles.fileInfo} numberOfLines={1}>
              {filePath.split("/").pop()} ({currentIndex}/{totalCount})
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls} pointerEvents="box-none">
            <View style={styles.navigationControls}>
              <TouchableOpacity
                style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
                onPress={onPrevious}
                disabled={!hasPrevious}
              >
                <Ionicons name="chevron-back" size={24} color={hasPrevious ? "white" : "#666"} />
                <Text style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
                  {hasPrevious ? `Lùi` : "Đầu tiên"}
                </Text>
              </TouchableOpacity>

              {settings.showPageIndicator && (
                <View style={styles.pageInfo}>
                  <Text style={styles.pageText}>
                    Trang {currentPage} / {totalPages}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
                onPress={onNext}
                disabled={!hasNext}
              >
                <Text style={[styles.navButtonText, !hasNext && styles.navButtonTextDisabled]}>
                  {hasNext ? `Tiếp` : "Cuối cùng"}
                </Text>
                <Ionicons name="chevron-forward" size={24} color={hasNext ? "white" : "#666"} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Toggle controls button - always visible in corner */}
      {!showControls && (
        <TouchableOpacity style={styles.toggleButton} onPress={handlePDFPress}>
          <Ionicons name={showControls ? "eye-off" : "eye"} size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "transparent",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fileInfo: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  bottomControls: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  pageInfo: {
    alignItems: "center",
  },
  pageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    minWidth: 80,
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  navButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 5,
  },
  navButtonTextDisabled: {
    color: "#666",
  },
  toggleButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
});

export default PDFViewer;
