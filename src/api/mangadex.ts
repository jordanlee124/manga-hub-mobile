import axios from 'axios';
import { cache, TTL } from '../cache';
import { sortToOrder } from '../types/filters';
import type { MangaFilters } from '../types/filters';
import type {
  Manga,
  MangaListResponse,
  ChapterListResponse,
  ChapterPages,
  CoverArt,
  Chapter,
} from '../types/manga';
import type { NormalizedChapter } from '../types/chapter';

export function normalizeChapter(ch: Chapter): NormalizedChapter {
  const group = ch.relationships.find(r => r.type === 'scanlation_group');
  return {
    id: ch.id,
    source: 'mangadex',
    chapterNum: ch.attributes.chapter,
    volume: ch.attributes.volume,
    title: ch.attributes.title,
    pages: ch.attributes.pages,
    scanlationGroup: group?.attributes?.name ?? null,
  };
}

const api = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 15000,
});

export interface TagItem {
  id: string;
  name: string;
  group: string;
}

export function getCoverUrl(mangaId: string, fileName: string, size: 256 | 512 = 256): string {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${size}.jpg`;
}

export async function fetchTags(): Promise<TagItem[]> {
  return cache.getOrFetch(
    'tags',
    async () => {
      const { data } = await api.get('/manga/tag');
      return (data.data as any[]).map(t => ({
        id: t.id,
        name: t.attributes.name['en'] ?? Object.values(t.attributes.name)[0],
        group: t.attributes.group,
      }));
    },
    24 * 60 * 60 * 1000 // 24 hours
  );
}

function buildFilterKey(query: string, filters: MangaFilters, limit: number, offset: number): string {
  const f = filters;
  return `manga:${query}:${f.sortBy}:${f.status.join(',')}:${f.contentRating.join(',')}:${f.includedTags.join(',')}:${f.year}:${limit}:${offset}`;
}

export async function fetchPopularManga(
  filters: MangaFilters,
  limit = 20,
  offset = 0
): Promise<MangaListResponse> {
  return cache.getOrFetch(
    buildFilterKey('', filters, limit, offset),
    async () => {
      const { data } = await api.get('/manga', {
        params: {
          limit,
          offset,
          order: sortToOrder(filters.sortBy),
          contentRating: filters.contentRating,
          status: filters.status.length ? filters.status : undefined,
          includedTags: filters.includedTags.length ? filters.includedTags : undefined,
          year: filters.year || undefined,
          includes: ['cover_art'],
          availableTranslatedLanguage: ['en'],
          hasAvailableChapters: true,
        },
      });
      return data;
    },
    TTL.POPULAR
  );
}

export async function searchManga(
  query: string,
  filters: MangaFilters,
  limit = 20,
  offset = 0
): Promise<MangaListResponse> {
  return cache.getOrFetch(
    buildFilterKey(query, filters, limit, offset),
    async () => {
      const { data } = await api.get('/manga', {
        params: {
          title: query,
          limit,
          offset,
          order: filters.sortBy === 'followedCount'
            ? { relevance: 'desc' }
            : sortToOrder(filters.sortBy),
          contentRating: filters.contentRating,
          status: filters.status.length ? filters.status : undefined,
          includedTags: filters.includedTags.length ? filters.includedTags : undefined,
          year: filters.year || undefined,
          includes: ['cover_art'],
          availableTranslatedLanguage: ['en'],
          hasAvailableChapters: true,
        },
      });
      return data;
    },
    TTL.SEARCH
  );
}

export async function fetchMangaById(mangaId: string): Promise<Manga> {
  return cache.getOrFetch(
    `manga:${mangaId}`,
    async () => {
      const { data } = await api.get(`/manga/${mangaId}`, {
        params: { includes: ['cover_art', 'author', 'artist'] },
      });
      return data.data;
    },
    TTL.MANGA
  );
}

export async function fetchChapters(
  mangaId: string,
  limit = 100,
  offset = 0
): Promise<ChapterListResponse> {
  return cache.getOrFetch(
    `chapters:${mangaId}:${limit}:${offset}`,
    async () => {
      const { data } = await api.get(`/manga/${mangaId}/feed`, {
        params: {
          limit,
          offset,
          translatedLanguage: ['en'],
          order: { chapter: 'asc' },
          includes: ['scanlation_group', 'user'],
        },
      });
      return data;
    },
    TTL.CHAPTERS
  );
}

export async function filterReadableManga(mangas: Manga[]): Promise<Manga[]> {
  if (!mangas.length) return [];
  const results = await Promise.all(
    mangas.map(async m => {
      try {
        const { data } = await api.get(`/manga/${m.id}/feed`, {
          params: { translatedLanguage: ['en'], limit: 100, order: { chapter: 'asc' } },
        });
        const hasReadable = (data.data as any[]).some(
          (ch: any) => (ch.attributes?.pages ?? 0) > 0
        );
        return hasReadable ? m : null;
      } catch {
        return m;
      }
    })
  );
  return results.filter((m): m is Manga => m !== null);
}

export async function fetchChapterPages(chapterId: string): Promise<ChapterPages> {
  return cache.getOrFetch(
    `pages:${chapterId}`,
    async () => {
      const { data } = await api.get(`/at-home/server/${chapterId}`);
      return data;
    },
    TTL.PAGES
  );
}

export function getCoverFromRelationships(
  relationships: { id: string; type: string; attributes?: Record<string, any> }[]
): CoverArt | null {
  const rel = relationships.find(r => r.type === 'cover_art');
  if (!rel || !rel.attributes) return null;
  return {
    id: rel.id,
    type: 'cover_art',
    attributes: {
      fileName: rel.attributes.fileName,
      volume: rel.attributes.volume ?? null,
    },
  };
}

export function getTitle(
  title: Record<string, string>,
  altTitles?: Record<string, string>[]
): string {
  if (title['en']) return title['en'];
  if (altTitles) {
    const enAlt = altTitles.find(t => 'en' in t);
    if (enAlt) return enAlt['en'];
  }
  return title['ja-ro'] ?? title['ja'] ?? Object.values(title)[0] ?? 'Unknown';
}

export function getDescription(desc: Record<string, string>): string {
  return desc['en'] ?? Object.values(desc)[0] ?? 'No description available.';
}
