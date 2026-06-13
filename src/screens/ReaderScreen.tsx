import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchChapterPages } from '../api/mangadex';
import { markChapterRead, setLastReadChapter } from '../storage';
import type { RootStackParamList } from '../types/manga';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { usePurchases } from '../context/PurchasesContext';
import AdBanner from '../components/atoms/AdBanner';
import { useChapterAdTrigger } from '../hooks/useChapterAdTrigger';
import { styles, SCREEN_WIDTH } from './styles/ReaderScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Reader'>;


export default function ReaderScreen() {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const { chapterId, mangaId, title, source, chapterList = [], chapterIndex = 0 } = route.params;
  const { readingMode } = useSettings();
  const { isPremium } = usePurchases();
  const { onChapterRead } = useChapterAdTrigger(isPremium);
  const insets = useSafeAreaInsets();

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const dragStartOffsetRef = useRef(0);
  // Keep a ref in sync with currentPage to avoid stale closures in scroll callbacks
  const currentPageRef = useRef(0);
  const pagesLengthRef = useRef(0);

  const isHorizontal = readingMode !== 'vertical';
  const isRTL = readingMode === 'rtl';
  const displayPages = isRTL ? [...pages].reverse() : pages;

  const prevChapter = chapterIndex > 0 ? chapterList[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapterList.length - 1 ? chapterList[chapterIndex + 1] : null;

  useEffect(() => {
    setPages([]);
    setLoading(true);
    setCurrentPage(0);
    currentPageRef.current = 0;
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchChapterPages(chapterId);
        const urls = data.chapter.data.map(f => `${data.baseUrl}/data/${data.chapter.hash}/${f}`);
        if (!cancelled) {
          setPages(urls);
          pagesLengthRef.current = urls.length;
          markChapterRead(mangaId, chapterId);
          setLastReadChapter(mangaId, chapterId);
          onChapterRead();
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [chapterId]);

  // RTL: scroll to the end of the reversed list (which is page 1) after pages load
  useEffect(() => {
    if (isRTL && displayPages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [isRTL, displayPages.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const idx = viewableItems[0].index;
      const realPage = isRTL ? pagesLengthRef.current - 1 - idx : idx;
      setCurrentPage(realPage);
      currentPageRef.current = realPage;
    }
  }, [isRTL]);

  const goToChapter = useCallback((idx: number) => {
    const ch = chapterList[idx];
    if (!ch) return;
    navigation.replace('Reader', {
      chapterId: ch.id,
      mangaId,
      title,
      chapter: ch.chapterNum,
      source,
      chapterList,
      chapterIndex: idx,
    });
  }, [chapterList, mangaId, title, source, navigation]);

  const onScrollBeginDrag = useCallback((e: any) => {
    dragStartOffsetRef.current = e.nativeEvent.contentOffset.x;
  }, []);

  const onScrollEndDrag = useCallback((e: any) => {
    if (!isHorizontal) return;

    const { contentOffset, velocity } = e.nativeEvent;
    const vx: number = velocity?.x ?? 0;
    const dragDelta = contentOffset.x - dragStartOffsetRef.current;

    // velocity.x > 0 = content moved left = user swiped left = advancing in LTR
    // Fall back to drag delta when velocity is unavailable (some Android versions)
    let swipedLeft: boolean | null = null;
    if (Math.abs(vx) > 0.1) {
      swipedLeft = vx > 0;
    } else if (Math.abs(dragDelta) > 8) {
      swipedLeft = dragDelta > 0;
    }

    if (swipedLeft === null) return;

    const page = currentPageRef.current;
    const total = pagesLengthRef.current;

    if (isRTL) {
      // RTL reversed array: page 0 = p1 at max scroll, page N-1 = pN at min scroll
      // Swiping left at p1 (tries to exceed max offset) → previous chapter
      // Swiping right at pN (tries to go below 0) → next chapter
      if (page === 0 && swipedLeft && prevChapter) goToChapter(chapterIndex - 1);
      if (page === total - 1 && !swipedLeft && nextChapter) goToChapter(chapterIndex + 1);
    } else {
      // LTR: page 0 at min scroll, page N-1 at max scroll
      // Swiping right at p1 (tries to go below 0) → previous chapter
      // Swiping left at pN (tries to exceed max offset) → next chapter
      if (page === 0 && !swipedLeft && prevChapter) goToChapter(chapterIndex - 1);
      if (page === total - 1 && swipedLeft && nextChapter) goToChapter(chapterIndex + 1);
    }
  }, [isHorizontal, isRTL, prevChapter, nextChapter, chapterIndex, goToChapter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading chapter...</Text>
      </View>
    );
  }

  if (!pages.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No pages found for this chapter.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!uiVisible} />
      {uiVisible && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      )}
      <FlatList
        ref={flatListRef}
        data={displayPages}
        horizontal={isHorizontal}
        pagingEnabled={isHorizontal}
        keyExtractor={(_, i) => `${chapterId}-${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={1} onPress={() => setUiVisible(v => !v)}>
            <Image
              source={{ uri: item }}
              style={isHorizontal ? styles.pageHorizontal : styles.pageVertical}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(_, index) =>
          isHorizontal
            ? { length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index }
            : { length: SCREEN_WIDTH * 1.45, offset: SCREEN_WIDTH * 1.45 * index, index }
        }
      />
      {uiVisible && (
        <View style={[styles.navBar, !isPremium && styles.navBarWithAd, { bottom: (isPremium ? 0 : 50) + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.navButton, !prevChapter && styles.navButtonDisabled]}
            onPress={() => prevChapter && goToChapter(chapterIndex - 1)}
            disabled={!prevChapter}
          >
            <Text style={styles.navButtonText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.chapterLabel}>
            {route.params.chapter ? `Ch. ${route.params.chapter}` : 'Oneshot'}
            {'  '}{currentPage + 1} / {pages.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, !nextChapter && styles.navButtonDisabled]}
            onPress={() => nextChapter && goToChapter(chapterIndex + 1)}
            disabled={!nextChapter}
          >
            <Text style={styles.navButtonText}>Next ›</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isPremium && (
        <View style={[styles.adBannerFixed, { bottom: insets.bottom }]}>
          <AdBanner />
        </View>
      )}
    </View>
  );
}

