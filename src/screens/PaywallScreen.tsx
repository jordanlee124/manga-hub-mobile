import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { PurchasesPackage } from 'react-native-purchases';
import { usePurchases } from '../context/PurchasesContext';
import { styles } from './styles/PaywallScreen';

const BENEFITS = [
  { icon: '🚫', text: 'Remove all ads' },
  { icon: '⚡', text: 'Faster image loading (no ad delays)' },
  { icon: '❤️', text: 'Support the app development' },
];

function packageLabel(pkg: PurchasesPackage): { title: string; price: string; isBest: boolean } {
  const period = pkg.packageType;
  const price = pkg.product.priceString;
  if (period === 'ANNUAL') return { title: 'Annual', price: `${price} / year`, isBest: true };
  if (period === 'MONTHLY') return { title: 'Monthly', price: `${price} / month`, isBest: false };
  if (period === 'LIFETIME') return { title: 'Lifetime', price: `${price} once`, isBest: false };
  return { title: pkg.product.title, price, isBest: false };
}

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { offerings, isPremium, purchase, restore, isLoading } = usePurchases();
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const packages = offerings?.current?.availablePackages ?? [];

  // Auto-select the first package once loaded
  React.useEffect(() => {
    if (packages.length > 0 && !selected) {
      const annual = packages.find(p => p.packageType === 'ANNUAL');
      setSelected(annual ?? packages[0]);
    }
  }, [packages]);

  const handlePurchase = async () => {
    if (!selected) return;
    setPurchasing(true);
    try {
      await purchase(selected);
      Alert.alert('Welcome to Premium!', 'Thank you for your support.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      await restore();
      Alert.alert('Restored', isPremium ? 'Premium access restored!' : 'No active purchases found.');
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MANGA HUB PREMIUM</Text>
        </View>

        <Text style={styles.title}>Better reading,{'\n'}no distractions</Text>
        <Text style={styles.subtitle}>
          Unlock a cleaner experience and support{'\n'}continued development.
        </Text>

        <View style={styles.benefitsList}>
          {BENEFITS.map(b => (
            <View key={b.text} style={styles.benefit}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {packages.length === 0 ? (
          <Text style={{ color: '#888', marginBottom: 24 }}>No plans available right now.</Text>
        ) : (
          <View style={styles.packagesRow}>
            {packages.map(pkg => {
              const { title, price, isBest } = packageLabel(pkg);
              const isSelected = selected?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.package, isSelected && styles.packageSelected]}
                  onPress={() => setSelected(pkg)}
                  activeOpacity={0.8}
                >
                  <View style={styles.packageTopRow}>
                    <Text style={styles.packageTitle}>{title}</Text>
                    {isBest && (
                      <View style={styles.packageBadge}>
                        <Text style={styles.packageBadgeText}>BEST VALUE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.packagePrice}>{price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.purchaseBtn, (!selected || purchasing) && styles.purchaseBtnDisabled]}
          onPress={handlePurchase}
          disabled={!selected || purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseBtnText}>
              {isPremium ? 'Already Premium' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={purchasing}>
          <Text style={styles.restoreBtnText}>Restore purchases</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment will be charged to your store account at confirmation of purchase.
          Subscriptions renew automatically unless cancelled at least 24 hours before the end of the period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
