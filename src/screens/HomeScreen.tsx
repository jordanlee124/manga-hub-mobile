import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchPopularManga, searchManga, getTitle, filterReadableManga } from '../api/mangadex';
import { useFilters } from '../context/FiltersContext';
import { activeFilterCount } from '../types/filters';
import SearchBar from '../components/molecules/SearchBar';
import MangaCard from '../components/molecules/MangaCard';
import AdBanner from '../components/atoms/AdBanner';
import type { Manga, RootStackParamList } from '../types/manga';
import { styles } from './styles/HomeScreen';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { filters } = useFilters();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const filterCount = activeFilterCount(filters);

  const loadPage = useCallback(async (q: string, offset: number, replace: boolean) => {
    try {
      const res = q
        ? await searchManga(q, filters, PAGE_SIZE, offset)
        : await fetchPopularManga(filters, PAGE_SIZE, offset);
      const readable = await filterReadableManga(res.data);
      const newOffset = offset + res.data.length;
      offsetRef.current = newOffset;
      setHasMore(newOffset < res.total);
      setMangas(prev => replace ? readable : [...prev, ...readable]);
    } catch (e) {
      console.error(e);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    offsetRef.current = 0;
    loadPage(activeQuery, 0, true).finally(() => setLoading(false));
  }, [filters]);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    setActiveQuery(q);
    setLoading(true);
    offsetRef.current = 0;
    await loadPage(q, 0, true);
    setLoading(false);
  }, [query, loadPage]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPage(activeQuery, offsetRef.current, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, activeQuery, loadPage]);

  return (
    <View style={styles.container}>
      <AdBanner />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSearch}
        onFilterPress={() => navigation.navigate('FilterScreen')}
        filterCount={filterCount}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#e74c3c" />
      ) : (
        <FlatList
          data={mangas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MangaCard
              item={item}
              onPress={() => navigation.navigate('MangaDetail', {
                mangaId: item.id,
                title: getTitle(item.attributes.title, item.attributes.altTitles),
              })}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#e74c3c" style={styles.footerLoader} /> : null
          }
        />
      )}
    </View>
  );
}

