export type ItemStatus = "inbox" | "reading" | "archived";
export type ThemePreference = "system" | "light" | "dark";

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Item {
  id: string;
  url: string;
  title: string | null;
  excerpt: string | null;
  author: string | null;
  siteName: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  readingTimeMin: number | null;
  status: ItemStatus;
  createdAt: string;
  readAt: string | null;
  tags: Tag[];
}

export interface Highlight {
  id: string;
  itemId: string;
  text: string;
  note: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  displayName: string | null;
  theme: ThemePreference;
  createdAt: string;
}

export interface EnrichedMetadata {
  url: string;
  title: string | null;
  excerpt: string | null;
  author: string | null;
  siteName: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  readingTimeMin: number;
}

export interface ItemFilters {
  status?: ItemStatus;
  tagId?: string;
  search?: string;
}

export interface WeeklyStat {
  weekLabel: string;
  saved: number;
  read: number;
}

export interface TagDistributionEntry {
  tagId: string;
  name: string;
  color: string;
  count: number;
}

export interface Stats {
  totalItems: number;
  totalReadingTimeMin: number;
  archivedCount: number;
  weeklyActivity: WeeklyStat[];
  tagDistribution: TagDistributionEntry[];
}
