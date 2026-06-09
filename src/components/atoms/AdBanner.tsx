import React from 'react';
import { View, Platform } from 'react-native';
import { styles } from './styles/AdBanner';
import { usePurchases } from '../../context/PurchasesContext';

const BANNER_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-2991215686912199/7085241535',
  ios: null,
});

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
  const unitId = BANNER_AD_UNIT_ID ?? TestIds?.BANNER;
  if (!BannerAd || isPremium || !unitId) return null;
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

