
import { User, KnowledgeItem, ImportRecord, SearchRecord } from '../types';

export const mockUser: User = {
  id: 'user-001',
  email: 'user@example.com',
  name: '张三',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
  createdAt: new Date('2024-01-01'),
  subscription: 'free',
};

export const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: 'item-001',
    title: '番茄工作法详解',
    content: '番茄工作法是一种时间管理方法，它将工作分解为25分钟的工作间隔，每个间隔后休息5分钟。这种方法可以帮助提高专注力和工作效率，特别适合需要长时间集中注意力的任务。',
    type: 'article',
    source: 'wechat',
    tags: ['时间管理', '效率'],
    categories: ['工作方法'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    importedAt: new Date('2024-01-20'),
    userId: 'user-001',
  },
  {
    id: 'item-002',
    title: 'React Hooks最佳实践',
    content: 'useState和useEffect是React Hooks中最常用的两个钩子。useState用于管理组件状态，useEffect用于处理副作用。正确使用这两个钩子可以让组件更加清晰和高效。',
    type: 'note',
    source: 'local',
    tags: ['React', '前端'],
    categories: ['技术'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    importedAt: new Date('2024-02-05'),
    userId: 'user-001',
  },
  {
    id: 'item-003',
    title: '如何高效阅读一本书',
    content: '主动阅读、做笔记、定期复习是高效阅读的三个关键。主动阅读意味着边读边思考，做笔记可以帮助整理思路，定期复习可以巩固记忆。',
    type: 'article',
    source: 'zhihu',
    tags: ['阅读', '学习'],
    categories: ['自我提升'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    importedAt: new Date('2024-02-10'),
    userId: 'user-001',
  },
];

export const mockImportRecords: ImportRecord[] = [
  {
    id: 'import-001',
    platform: 'wechat',
    status: 'success',
    totalCount: 23,
    successCount: 22,
    failedCount: 1,
    importedAt: new Date('2024-02-10'),
    userId: 'user-001',
    items: mockKnowledgeItems.slice(0, 2),
  },
];

export const mockSearchRecords: SearchRecord[] = [
  {
    id: 'search-001',
    query: '番茄工作法',
    results: mockKnowledgeItems.slice(0, 1),
    timestamp: new Date('2024-02-15'),
    resultCount: 1,
    userId: 'user-001',
  },
];
