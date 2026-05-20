
import Modal from './Modal';
import { ImportRecord, KnowledgeItem } from '../types';
import { useState } from 'react';
import KnowledgeDetailModal from './KnowledgeDetailModal';

interface ImportRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ImportRecord | null;
}

const ImportRecordDetailModal = ({ isOpen, onClose, record }: ImportRecordDetailModalProps) => {
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  if (!record) return null;

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'wechat': return '微信';
      case 'links': return '链接导入';
      case 'zhihu': return '知乎';
      case 'csdn': return 'CSDN';
      default: return platform;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'wechat': return '💬';
      case 'links': return '🔗';
      case 'zhihu': return '🔍';
      case 'csdn': return '💻';
      default: return '📥';
    }
  };

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`导入记录详情`} size="xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-4xl">{getPlatformIcon(record.platform)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getPlatformName(record.platform)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(record.importedAt).toLocaleString('zh-CN')}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-green-600 dark:text-green-400">
                  成功: {record.successCount}
                </span>
                {record.failedCount > 0 && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    失败: {record.failedCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              导入的内容 ({record.items.length} 条)
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {record.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {item.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <KnowledgeDetailModal
        isOpen={showItemDetail}
        onClose={() => {
          setShowItemDetail(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </>
  );
};

export default ImportRecordDetailModal;

