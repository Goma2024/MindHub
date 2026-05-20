
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  avatar: string;
  createdAt: Date;
  subscription: 'free' | 'standard' | 'pro';
}

export type KnowledgeType = 'article' | 'note' | 'image' | 'link' | 'video';
export type KnowledgeSource = 'wechat' | 'browser' | 'zhihu' | 'csdn' | 'local' | 'links' | 'pdf-image';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  source: KnowledgeSource;
  tags: string[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  importedAt?: Date;
  userId: string;
  importRecordId?: string;
  url?: string;
}

export type ImportPlatform = 'wechat' | 'links' | 'zhihu' | 'csdn' | 'pdf-image';
export type ImportStatus = 'success' | 'failed' | 'pending';

export interface ImportRecord {
  id: string;
  platform: ImportPlatform;
  status: ImportStatus;
  totalCount: number;
  successCount: number;
  failedCount: number;
  importedAt: Date;
  userId: string;
  items: KnowledgeItem[];
}

export interface SearchRecord {
  id: string;
  query: string;
  timestamp: string | Date;
  resultCount: number;
  userId: string;
  results?: KnowledgeItem[];
  aiSummary?: string;
}

export interface AppState {
  user: User | null;
  users: User[];
  knowledgeItems: KnowledgeItem[];
  importRecords: ImportRecord[];
  searchRecords: SearchRecord[];
  isLoading: boolean;
  darkMode: boolean;
  categories: string[];
  tags: string[];
}

