import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  bookmarks: 'bookmarks',
  readChapters: 'readChapters',
};

// ---------- Bookmarks ----------

export interface BookmarkedManga {
  id: string;
  title: string;
  coverUrl: string | null;
  status: string;
  savedAt: number;
}

export async function getBookmarks(): Promise<BookmarkedManga[]> {
  const raw = await AsyncStorage.getItem(KEYS.bookmarks);
  return raw ? JSON.parse(raw) : [];
}

export async function addBookmark(manga: BookmarkedManga): Promise<void> {
  const existing = await getBookmarks();
  const filtered = existing.filter(m => m.id !== manga.id);
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify([manga, ...filtered]));
}

export async function removeBookmark(mangaId: string): Promise<void> {
  const existing = await getBookmarks();
  await AsyncStorage.setItem(
    KEYS.bookmarks,
    JSON.stringify(existing.filter(m => m.id !== mangaId))
  );
}

export async function isBookmarked(mangaId: string): Promise<boolean> {
  const existing = await getBookmarks();
  return existing.some(m => m.id === mangaId);
}

// ---------- Chapter progress ----------

export async function getReadChapters(mangaId: string): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(`${KEYS.readChapters}:${mangaId}`);
  return raw ? new Set(JSON.parse(raw)) : new Set();
}

export async function markChapterRead(mangaId: string, chapterId: string): Promise<void> {
  const existing = await getReadChapters(mangaId);
  existing.add(chapterId);
  await AsyncStorage.setItem(
    `${KEYS.readChapters}:${mangaId}`,
    JSON.stringify([...existing])
  );
}

export async function setLastReadChapter(mangaId: string, chapterId: string): Promise<void> {
  await AsyncStorage.setItem(`lastRead:${mangaId}`, chapterId);
}
