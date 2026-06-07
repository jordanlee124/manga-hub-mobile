import React from 'react';
import { View } from 'react-native';
import { styles } from './styles/AdBanner';
import { usePurchases } from '../../context/PurchasesContext';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {
  // Native module unavailable (Expo Go) — renders nothing
}

export default function AdBanner() {
  const { isPremium } = usePurchases();
  if (!BannerAd || isPremium) return null;
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

