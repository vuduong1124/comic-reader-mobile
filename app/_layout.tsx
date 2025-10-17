import { ThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

function AppContent() {  
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      const packageName = DeviceInfo.getBundleId();
      const mediaFolder = `${RNFS.ExternalStorageDirectoryPath}/Android/media/${packageName}/TruyenPDF`;
      RNFS.mkdir(mediaFolder).catch(() => {});
    }
  }, []);
  const colorScheme = useColorScheme();

  // Tạo custom paper theme để match với colors
  const paperTheme = colorScheme === 'dark' 
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          background: '#151718',
          surface: '#1f2937',
          surfaceVariant: '#374151',
          onSurface: '#ECEDEE',
          onSurfaceVariant: '#9BA1A6',
        }
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          background: '#ffffff',
          surface: '#f9fafb',
          surfaceVariant: '#f3f4f6',
          onSurface: '#11181C',
          onSurfaceVariant: '#687076',
        }
      };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar 
          style={colorScheme === 'dark' ? 'light' : 'dark'} 
          backgroundColor={colorScheme === 'dark' ? '#151718' : '#ffffff'}
        />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
