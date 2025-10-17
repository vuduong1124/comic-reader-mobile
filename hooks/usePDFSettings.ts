import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface PDFSettings {
  showPageIndicator: boolean;
  distanceBetweenPages: number;
  defaultPDFFolder: string;
}

export const DEFAULT_PDF_SETTINGS: PDFSettings = {
  showPageIndicator: true,
  distanceBetweenPages: 0,
  defaultPDFFolder: '/storage/emulated/0/Android/media',
};

const SETTINGS_KEY = 'pdfViewerSettings';

export const usePDFSettings = () => {
  const [settings, setSettings] = useState<PDFSettings>(DEFAULT_PDF_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_PDF_SETTINGS, ...parsedSettings });
      }
    } 
    catch (error) {
      console.error('Error loading PDF settings:', error);
    } 
    finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<PDFSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error saving PDF settings:', error);
      return false;
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      setSettings(DEFAULT_PDF_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting PDF settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    resetSettings,
    loadSettings,
  };
};
