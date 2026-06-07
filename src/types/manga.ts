export interface LocalizedString {
  [lang: string]: string;
}

export interface MangaTag {
  id: string;
  type: 'tag';
  attributes: {
    name: LocalizedString;
    group: string;
  };
}

export interface Relationship {
  id: string;
  type: string;
  attributes?: Record<string, any>;
}

export interface Manga {
  id: string;
  type: 'manga';
  attributes: {
    title: LocalizedString;
    altTitles: LocalizedString[];
    description: LocalizedString;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    year: number | null;
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
    tags: MangaTag[];
    lastVolume: string | null;
    lastChapter: string | null;
    availableTranslatedLanguage?: string[];
  };
  relationships: Relationship[];
}

export interface Chapter {
  id: string;
  type: 'chapter';
  attributes: {
    title: string | null;
    volume: string | null;
    chapter: string | null;
    pages: number;
    translatedLanguage: string;
    publishAt: string;
    externalUrl: string | null;
  };
  relationships: Relationship[];
}

export interface CoverArt {
  id: string;
  type: 'cover_art';
  attributes: {
    fileName: string;
    volume: string | null;
  };
}

export interface ChapterPages {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaListResponse {
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
}

export interface ChapterListResponse {
  data: Chapter[];
  limit: number;
  offset: number;
  total: number;
}

export type RootStackParamList = {
  Home: undefined;
  MangaDetail: { mangaId: string; title: string; coverUrl?: string | null };
  Reader: {
    chapterId: string;
    mangaId: string;
    title: string;
    chapter: string | null;
    source: 'mangadex';
    chapterList?: { id: string; chapterNum: string | null }[];
    chapterIndex?: number;
  };
  FilterScreen: undefined;
  Paywall: undefined;
};
