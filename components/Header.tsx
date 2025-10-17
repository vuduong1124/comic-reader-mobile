import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function Header() {
  const colorScheme = useColorScheme();
  const { themeMode, toggleTheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'wb-sunny';
      case 'dark':
        return 'brightness-2';
      case 'system':
        return 'brightness-auto';
      default:
        return 'brightness-auto';
    }
  };
  
  return (
    <View style={[styles.header, { 
      backgroundColor: colors.headerBackground || colors.background,
      borderBottomColor: colors.border 
    }]}>
      <View style={styles.leftSection}>
        <MaterialIcons size={28} name="star" color="#6366f1" />
      </View>
      
      <View style={styles.centerContent} />
      
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          onPress={toggleTheme}
        >
          <MaterialIcons size={22} name={getThemeIcon()} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => console.log('Search pressed')}
        >
          <MaterialIcons size={22} name="search" color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => console.log('Notification pressed')}
        >
          <MaterialIcons size={22} name="notifications" color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
});
