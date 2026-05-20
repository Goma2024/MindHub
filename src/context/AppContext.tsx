
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, KnowledgeItem, ImportRecord, SearchRecord } from '../types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_KNOWLEDGE_ITEMS'; payload: KnowledgeItem[] }
  | { type: 'UPDATE_KNOWLEDGE_ITEM'; payload: KnowledgeItem }
  | { type: 'DELETE_KNOWLEDGE_ITEM'; payload: string }
  | { type: 'ADD_IMPORT_RECORD'; payload: ImportRecord }
  | { type: 'DELETE_IMPORT_RECORD'; payload: string }
  | { type: 'ADD_SEARCH_RECORD'; payload: SearchRecord }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'CLEAR_USER_DATA' };

const initialState: AppState = {
  user: null,
  users: [
    {
      id: 'user-001',
      email: 'user@example.com',
      password: '123456',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      createdAt: new Date('2024-01-01'),
      subscription: 'free' as const,
    },
  ],
  knowledgeItems: [],
  importRecords: [],
  searchRecords: [],
  isLoading: false,
  darkMode: false,
  categories: ['工作方法', '技术', '自我提升', '学习笔记'],
  tags: ['时间管理', '效率', 'React', '前端', '阅读', '学习'],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'ADD_USER':
      if (state.users.find(u => u.email === action.payload.email)) return state;
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_KNOWLEDGE_ITEMS':
      return { ...state, knowledgeItems: [...state.knowledgeItems, ...action.payload] };
    case 'UPDATE_KNOWLEDGE_ITEM':
      return {
        ...state,
        knowledgeItems: state.knowledgeItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_KNOWLEDGE_ITEM':
      return {
        ...state,
        knowledgeItems: state.knowledgeItems.filter(item => item.id !== action.payload),
      };
    case 'ADD_IMPORT_RECORD':
      return { ...state, importRecords: [action.payload, ...state.importRecords] };
    case 'DELETE_IMPORT_RECORD':
      return { ...state, importRecords: state.importRecords.filter(record => record.id !== action.payload) };
    case 'ADD_SEARCH_RECORD':
      return { ...state, searchRecords: [action.payload, ...state.searchRecords] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'ADD_CATEGORY':
      if (state.categories.includes(action.payload)) return state;
      return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c !== action.payload) };
    case 'ADD_TAG':
      if (state.tags.includes(action.payload)) return state;
      return { ...state, tags: [...state.tags, action.payload] };
    case 'DELETE_TAG':
      return { ...state, tags: state.tags.filter(t => t !== action.payload) };
    case 'CLEAR_USER_DATA':
      return {
        ...state,
        knowledgeItems: [],
        importRecords: [],
        searchRecords: [],
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // 从本地存储加载初始状态
  const loadState = (): AppState => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // 恢复Date对象
        return {
          ...parsedState,
          users: parsedState.users ? parsedState.users.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt)
          })) : initialState.users,
          knowledgeItems: parsedState.knowledgeItems ? parsedState.knowledgeItems.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            importedAt: item.importedAt ? new Date(item.importedAt) : undefined
          })) : [],
          importRecords: parsedState.importRecords ? parsedState.importRecords.map((record: any) => ({
            ...record,
            importedAt: new Date(record.importedAt),
            items: record.items ? record.items.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              importedAt: item.importedAt ? new Date(item.importedAt) : undefined
            })) : []
          })) : [],
          searchRecords: parsedState.searchRecords ? parsedState.searchRecords.map((record: any) => ({
            ...record,
            timestamp: new Date(record.timestamp)
          })) : [],
          categories: parsedState.categories || initialState.categories,
          tags: parsedState.tags || initialState.tags
        };
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(appReducer, loadState());

  // 保存状态到本地存储
  useEffect(() => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('appState', serializedState);
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

