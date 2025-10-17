import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';

// Custom tab bar background for Android and Web
export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View 
      style={[
        styles.background, 
        { 
          backgroundColor: colors.background,
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
});
