
import { useState } from 'react';
import Modal from './Modal';
import { KnowledgeItem } from '../types';
import { useAppContext } from '../context/AppContext';

interface KnowledgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: KnowledgeItem | null;
}

const KnowledgeDetailModal = ({ isOpen, onClose, item }: KnowledgeDetailModalProps) => {
  const { dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<KnowledgeItem>({
    id: '',
    title: '',
    content: '',
    type: 'article',
    source: 'local',
    tags: [],
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '',
  });

  if (!item) return null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'wechat': return '💬';
      case 'browser': return '🌐';
      case 'zhihu': return '🔍';
      case 'csdn': return '💻';
      case 'local': return '📝';
      case 'links': return '🔗';
      default: return '📄';
    }
  };

  const handleEdit = () => {
    setEditedItem({ ...item });
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条知识吗？')) {
      dispatch({ type: 'DELETE_KNOWLEDGE_ITEM', payload: item.id });
      onClose();
    }
  };

  const handleSave = () => {
    const updatedItem = {
      ...editedItem,
      updatedAt: new Date(),
    };
    dispatch({ type: 'UPDATE_KNOWLEDGE_ITEM', payload: updatedItem });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={handleCancelEdit} title="编辑知识" size="xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题
            </label>
            <input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容
            </label>
            <textarea
              value={editedItem.content}
              onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类（逗号分隔）
            </label>
            <input
              type="text"
              value={editedItem.categories.join(', ')}
              onChange={(e) => setEditedItem({ ...editedItem, categories: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={editedItem.tags.join(', ')}
              onChange={(e) => setEditedItem({ ...editedItem, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.title} size="xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getSourceIcon(item.source)}</span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.type} · {new Date(item.importedAt || item.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>

        {item.categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</h3>
            <div className="flex flex-wrap gap-2">
              {item.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {item.content}
            </p>
            {item.url && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span className="mr-2">🔗</span>
                  <span>{item.url}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">创建时间：</span>
            {new Date(item.createdAt).toLocaleString('zh-CN')}
          </div>
          <div>
            <span className="font-medium">更新时间：</span>
            {new Date(item.updatedAt).toLocaleString('zh-CN')}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleEdit}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KnowledgeDetailModal;

