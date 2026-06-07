export type ContentRating = 'safe' | 'suggestive' | 'erotica' | 'pornographic';
export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
export type SortOption = 'followedCount' | 'rating' | 'latestUpdated' | 'newest' | 'oldest';

export interface MangaFilters {
  contentRating: ContentRating[];
  status: MangaStatus[];
  sortBy: SortOption;
  includedTags: string[];
  year: string;
}

export const DEFAULT_FILTERS: MangaFilters = {
  contentRating: ['safe', 'suggestive'],
  status: [],
  sortBy: 'followedCount',
  includedTags: [],
  year: '',
};

export function activeFilterCount(f: MangaFilters): number {
  let n = f.status.length + f.includedTags.length;
  if (f.sortBy !== 'followedCount') n++;
  if (f.year) n++;
  const def = new Set(['safe', 'suggestive']);
  const cur = new Set(f.contentRating);
  if (def.size !== cur.size || !['safe', 'suggestive'].every(r => cur.has(r as ContentRating))) n++;
  return n;
}

export function sortToOrder(sort: SortOption): Record<string, string> {
  switch (sort) {
    case 'followedCount': return { followedCount: 'desc' };
    case 'rating':        return { rating: 'desc' };
    case 'latestUpdated': return { updatedAt: 'desc' };
    case 'newest':        return { createdAt: 'desc' };
    case 'oldest':        return { createdAt: 'asc' };
  }
}
