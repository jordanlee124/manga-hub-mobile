export type ChapterSource = 'mangadex';

export interface NormalizedChapter {
  id: string;
  source: ChapterSource;
  chapterNum: string | null;
  volume: string | null;
  title: string | null;
  pages: number;
  scanlationGroup: string | null;
}
