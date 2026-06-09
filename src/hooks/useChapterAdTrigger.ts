import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch {
  // Native module unavailable (Expo Go)
}

const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-2991215686912199/1396182615',
  ios: null,
});

const CHAPTERS_READ_KEY = '@manga_hub_chapters_read_count';
const AD_INTERVAL = 5;

export function useChapterAdTrigger(isPremium: boolean) {
  const adRef = useRef<any>(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    if (!InterstitialAd || isPremium) return;

    const unitId = INTERSTITIAL_AD_UNIT_ID ?? TestIds?.INTERSTITIAL;
    if (!unitId) return;
    const ad = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      adLoadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      adLoadedRef.current = false;
      ad.load();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, [isPremium]);

  const onChapterRead = async () => {
    if (!InterstitialAd || isPremium) return;

    const raw = await AsyncStorage.getItem(CHAPTERS_READ_KEY);
    const count = (parseInt(raw ?? '0', 10) || 0) + 1;
    await AsyncStorage.setItem(CHAPTERS_READ_KEY, String(count));

    if (count % AD_INTERVAL === 0 && adRef.current && adLoadedRef.current) {
      adRef.current.show();
    }
  };

  return { onChapterRead };
}
