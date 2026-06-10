import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettings, ReadingMode } from '../context/SettingsContext';
import { usePurchases } from '../context/PurchasesContext';
import type { RootStackParamList } from '../types/manga';
import { styles } from './styles/SettingsScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MODES: { value: ReadingMode; label: string; description: string }[] = [
  {
    value: 'vertical',
    label: 'Top-Down Scroll',
    description: 'Scroll vertically through pages (webtoon style)',
  },
  {
    value: 'ltr',
    label: 'Left to Right',
    description: 'Swipe horizontally, pages flow left to right',
  },
  {
    value: 'rtl',
    label: 'Right to Left',
    description: 'Swipe horizontally, pages flow right to left (manga style)',
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { readingMode, setReadingMode } = useSettings();
  const { isPremium, restore } = usePurchases();
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
      Alert.alert('Restored', isPremium ? 'Premium access restored!' : 'No active purchases found.');
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.premiumBannerTitle}>
              {isPremium ? '★ Premium Active' : 'Upgrade to Premium'}
            </Text>
            <Text style={styles.premiumBannerSubtitle}>
              {isPremium ? 'Thank you for your support!' : 'Remove ads and support the app'}
            </Text>
          </View>
          {!isPremium && <Text style={styles.premiumBannerArrow}>›</Text>}
        </TouchableOpacity>
        {!isPremium && (
          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={restoring}>
            {restoring
              ? <ActivityIndicator color="#e74c3c" />
              : <Text style={styles.restoreBtnText}>Restore purchases</Text>
            }
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Mode</Text>
        {MODES.map(mode => {
          const selected = readingMode === mode.value;
          return (
            <TouchableOpacity
              key={mode.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setReadingMode(mode.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {mode.label}
                </Text>
                <Text style={styles.optionDesc}>{mode.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

