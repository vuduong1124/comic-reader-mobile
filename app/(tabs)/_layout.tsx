import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { Header } from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <SafeAreaProvider>
      <SafeAreaView 
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? 'light'].background }
        ]} 
        edges={['top', 'bottom']}
      >
        <Header />
        <View style={styles.content}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
              tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarStyle: [
                styles.tabBar,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                }
              ],
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarIconStyle: styles.tabBarIcon,
              tabBarItemStyle: styles.tabBarItem,
            }}>

            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
              }}
            />

            <Tabs.Screen
              name="settings"
              options={{
                title: 'Settings',
                tabBarIcon: ({ color }) => <IconSymbol size={24} name="paperplane.fill" color={color} />,
              }}
            />
          </Tabs>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    borderTopWidth: 1
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500'
  },
  tabBarIcon: {
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});
