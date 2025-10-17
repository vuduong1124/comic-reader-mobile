import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import FileManager from '../../components/FileManager';

export default function Page2() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FileManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 16,
    color: '#1f2937',
  },
});
