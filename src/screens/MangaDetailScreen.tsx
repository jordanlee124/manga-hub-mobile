import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  fetchMangaById,
  fetchChapters,
  normalizeChapter,
  getCoverFromRelationships,
  getCoverUrl,
  getDescription,
  getTitle,
} from '../api/mangadex';
import { isBookmarked, addBookmark, removeBookmark, getReadChapters } from '../storage';
import type { Manga, RootStackParamList } from '../types/manga';
import type { NormalizedChapter } from '../types/chapter';
import CoverImage from '../components/atoms/CoverImage';
import { ChapterRow, ChapterVersionRow } from '../components/molecules/ChapterRow';
import { styles } from './styles/MangaDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'MangaDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'MangaDetail'>;

type ChapterGroupItem = {
  type: 'chapter-group';
  chapterNum: string;
  primary: NormalizedChapter;
  versions: NormalizedChapter[];
};
type ChapterVersionItem = { type: 'chapter-version'; chapter: NormalizedChapter; versionIndex: number };
type ListItem = ChapterGroupItem | ChapterVersionItem;

function groupByChapterNum(chapters: NormalizedChapter[]): { chapterNum: string; versions: NormalizedChapter[] }[] {
  const map = new Map<string, NormalizedChapter[]>();
  for (const ch of chapters) {
    const num = ch.chapterNum ?? 'Oneshot';
    if (!map.has(num)) map.set(num, []);
    map.get(num)!.push(ch);
  }
  return [...map.entries()]
    .sort(([a], [b]) => {
      if (a === 'Oneshot') return 1;
      if (b === 'Oneshot') return -1;
      return parseFloat(a) - parseFloat(b);
    })
    .map(([chapterNum, versions]) => ({ chapterNum, versions }));
}

export default function MangaDetailScreen() {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const { mangaId, title } = route.params;

  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<NormalizedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mangaRes, chaptersRes] = await Promise.all([
          fetchMangaById(mangaId),
          fetchChapters(mangaId, 500),
        ]);
        if (cancelled) return;
        setManga(mangaRes);
        const normalized = chaptersRes.data.map(normalizeChapter).filter(c => c.pages > 0);
        setChapters(normalized);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mangaId]);

  useFocusEffect(
    useCallback(() => {
      isBookmarked(mangaId).then(setBookmarked);
      getReadChapters(mangaId).then(setReadChapters);
    }, [mangaId])
  );

  const toggleBookmark = async () => {
    if (!manga) return;
    if (bookmarked) {
      await removeBookmark(mangaId);
      setBookmarked(false);
    } else {
      const cover = getCoverFromRelationships(manga.relationships);
      const coverUrl = cover ? getCoverUrl(manga.id, cover.attributes.fileName) : null;
      await addBookmark({
        id: manga.id,
        title: getTitle(manga.attributes.title, manga.attributes.altTitles),
        coverUrl,
        status: manga.attributes.status,
        savedAt: Date.now(),
      });
      setBookmarked(true);
    }
  };

  const toggleChapter = useCallback((chapterNum: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(chapterNum) ? next.delete(chapterNum) : next.add(chapterNum);
      return next;
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleBookmark}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
        >
          <Text style={{ fontSize: 24, lineHeight: 28, textAlign: 'center', color: bookmarked ? '#f1c40f' : '#fff' }}>
            {bookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [bookmarked, manga]);

  const cover = manga ? getCoverFromRelationships(manga.relationships) : null;
  const coverUrl = cover && manga ? getCoverUrl(manga.id, cover.attributes.fileName, 512) : null;
  const description = manga ? getDescription(manga.attributes.description) : '';
  const displayTitle = manga ? getTitle(manga.attributes.title, manga.attributes.altTitles) : title;
  const tags = manga?.attributes.tags
    .map(t => t.attributes.name['en'] ?? Object.values(t.attributes.name)[0])
    .filter(Boolean) ?? [];
  const readCount = chapters.filter(c => readChapters.has(c.id)).length;

  const chapterGroups = useMemo(() => groupByChapterNum(chapters), [chapters]);

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    for (const { chapterNum, versions } of chapterGroups) {
      items.push({ type: 'chapter-group', chapterNum, primary: versions[0], versions });
      if (versions.length > 1 && expandedChapters.has(chapterNum)) {
        versions.forEach((ch, i) =>
          items.push({ type: 'chapter-version', chapter: ch, versionIndex: i + 1 })
        );
      }
    }
    return items;
  }, [chapterGroups, expandedChapters]);

  const chapterList = useMemo(
    () => chapterGroups.map(g => ({ id: g.versions[0].id, chapterNum: g.chapterNum })),
    [chapterGroups]
  );

  const goToReader = (chapter: NormalizedChapter) => {
    const idx = chapterGroups.findIndex(g => g.versions.some(v => v.id === chapter.id));
    navigation.navigate('Reader', {
      chapterId: chapter.id,
      mangaId,
      title: displayTitle,
      chapter: chapter.chapterNum,
      source: chapter.source,
      chapterList,
      chapterIndex: Math.max(0, idx),
    });
  };

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.header}>
        <CoverImage uri={coverUrl} style={styles.cover} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.status}>{manga?.attributes.status}</Text>
          {manga?.attributes.year ? <Text style={styles.meta}>Year: {manga.attributes.year}</Text> : null}
          <View style={styles.tags}>
            {tags.slice(0, 6).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 8, marginBottom: 4 }]}>Description</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.chaptersTitleRow}>
        <Text style={styles.sectionTitle}>
          Chapters ({chapters.length})
          {readCount > 0 && <Text style={styles.readProgress}> · {readCount} read</Text>}
        </Text>
      </View>
    </View>
  ), [coverUrl, displayTitle, manga, tags, description, chapters.length, readCount]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'chapter-group') {
      return (
        <ChapterRow
          chapterNum={item.chapterNum}
          title={item.primary.title}
          pages={item.primary.pages}
          isRead={readChapters.has(item.primary.id)}
          versionsCount={item.versions.length}
          expanded={expandedChapters.has(item.chapterNum)}
          onPress={() => goToReader(item.primary)}
          onToggleVersions={() => toggleChapter(item.chapterNum)}
        />
      );
    }
    return (
      <ChapterVersionRow
        versionIndex={item.versionIndex}
        groupName={item.chapter.scanlationGroup ?? `Version ${item.versionIndex}`}
        pages={item.chapter.pages}
        isRead={readChapters.has(item.chapter.id)}
        onPress={() => goToReader(item.chapter)}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={listData}
      keyExtractor={item =>
        item.type === 'chapter-group' ? `grp-${item.chapterNum}` : `ver-${item.chapter.id}`
      }
      ListHeaderComponent={renderHeader}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}

