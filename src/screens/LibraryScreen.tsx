import React, { useState, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getBookmarks, removeBookmark } from '../storage';
import type { BookmarkedManga } from '../storage';
import type { RootStackParamList } from '../types/manga';
import BookmarkCard from '../components/molecules/BookmarkCard';
import { styles } from './styles/LibraryScreen';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const [bookmarks, setBookmarks] = useState<BookmarkedManga[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, [])
  );

  const handleRemove = async (mangaId: string) => {
    await removeBookmark(mangaId);
    setBookmarks(prev => prev.filter(m => m.id !== mangaId));
  };

  if (!bookmarks.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>Your library is empty.</Text>
          <Text style={styles.emptySubtext}>Bookmark manga from the Home tab to save them here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookmarkCard
            item={item}
            onPress={() => navigation.navigate('MangaDetail', { mangaId: item.id, title: item.title })}
            onRemove={() => handleRemove(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

