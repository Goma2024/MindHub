
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { ImportPlatform, KnowledgeItem } from '../types';
import { generateAuthQRCode, checkAuthStatus, scrapeWebContent, convertImageToText } from '../utils/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: ImportPlatform;
}

type ImportStep = 'auth' | 'select' | 'settings' | 'importing' | 'complete';

const ImportModal = ({ isOpen, onClose, platform }: ImportModalProps) => {
  const { state, dispatch } = useAppContext();
  const [step, setStep] = useState<ImportStep>('auth');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('未分类');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [importProgress, setImportProgress] = useState(0);
  const [linksInput, setLinksInput] = useState('');
  const [importedItems, setImportedItems] = useState<KnowledgeItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [useAiCategory, setUseAiCategory] = useState(false);
  const [useAiTags, setUseAiTags] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [authChecking, setAuthChecking] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'generating' | 'scanning' | 'success' | 'failed'>('idle');

  const getPlatformName = (p: ImportPlatform) => {
    switch (p) {
      case 'wechat': return '微信';
      case 'links': return '链接导入';
      case 'zhihu': return '知乎';
      case 'csdn': return 'CSDN';
      case 'pdf-image': return 'PDF/图片';
    }
  };

  const getPlatformIcon = (p: ImportPlatform) => {
    switch (p) {
      case 'wechat': return '💬';
      case 'links': return '🔗';
      case 'zhihu': return '🔍';
      case 'csdn': return '💻';
      case 'pdf-image': return '📄';
    }
  };

  const mockFavorites = [
    { id: 'fav-1', title: '如何高效学习编程', content: '这是一篇关于编程学习方法的文章，包含了很多实用的技巧和建议。', url: 'https://example.com/programming' },
    { id: 'fav-2', title: 'React Hooks使用指南', content: '详细介绍React Hooks的使用技巧，包括useState、useEffect等钩子的最佳实践。', url: 'https://example.com/react-hooks' },
    { id: 'fav-3', title: '产品经理思维训练', content: '培养产品思维的重要性，以及如何从用户角度思考问题。', url: 'https://example.com/product-thinking' },
    { id: 'fav-4', title: '时间管理方法论', content: '有效的时间管理技巧，帮助你提高工作效率和生活质量。', url: 'https://example.com/time-management' },
    { id: 'fav-5', title: '前端开发最佳实践', content: '前端开发的一些最佳实践，包括代码规范、性能优化等方面。', url: 'https://example.com/frontend-best-practices' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (platform === 'links' || platform === 'pdf-image') {
        setStep('settings');
      } else {
        setStep('auth');
      }
      setSelectedItems([]);
      setSelectAll(false);
      setDefaultCategory('未分类');
      setSelectedTags([]);
      setNewTagInput('');
      setNewCategoryInput('');
      setUseAiCategory(false);
      setUseAiTags(false);
      setImportProgress(0);
      setLinksInput('');
      setImportedItems([]);
      setUploadedFiles([]);
      setFileInputKey(prev => prev + 1); // 重置文件输入
      setQrCodeUrl('');
      setAuthUrl('');
      setAuthChecking(false);
      setAuthStatus('idle');
    }
  }, [isOpen, platform]);

  // 平台特定的链接输入状态
  const [platformLinks, setPlatformLinks] = useState<string>('');

  useEffect(() => {
    if (isOpen && (platform === 'wechat' || platform === 'zhihu' || platform === 'csdn')) {
      setPlatformLinks('');
    }
  }, [isOpen, platform]);

  const handleAuth = async () => {
    try {
      // 显示授权中状态
      setAuthStatus('generating');
      
      // 生成授权二维码
      const { qrCodeUrl, authUrl } = await generateAuthQRCode(platform);
      setQrCodeUrl(qrCodeUrl);
      setAuthUrl(authUrl);
      setAuthStatus('scanning');
      
      // 开始轮询授权状态
      setAuthChecking(true);
      const maxAttempts = 30; // 最多尝试30次
      let attempts = 0;
      
      const checkAuth = async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          setAuthChecking(false);
          setAuthStatus('failed');
          alert(`${getPlatformName(platform)}授权超时，请重试`);
          return;
        }
        
        const authSuccess = await checkAuthStatus(platform);
        
        if (authSuccess) {
          setAuthChecking(false);
          setAuthStatus('success');
          setStep('select');
        } else {
          // 继续轮询
          setTimeout(checkAuth, 2000);
        }
      };
      
      // 开始第一次检查
      setTimeout(checkAuth, 2000);
    } catch (error) {
      console.error('授权失败:', error);
      setAuthStatus('failed');
      alert(`${getPlatformName(platform)}授权失败，请重试`);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockFavorites.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleNext = () => {
    setStep('settings');
  };

  const handleStartImport = async () => {
    setStep('importing');

    let itemsToImport: typeof mockFavorites = [];

    if (platform === 'links') {
      const links = linksInput.split('\n').filter(l => l.trim());
      itemsToImport = [];
      
      // 抓取链接内容
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        setImportProgress(Math.round((i / links.length) * 50));
        
        try {
          // 抓取网页内容
          const content = await scrapeWebContent(link);
          // 从内容中提取标题（如果scrapeWebContent返回的内容包含标题）
          const titleMatch = content.match(/标题: ([^\n]+)/);
          const title = titleMatch ? titleMatch[1] : `链接内容 ${i + 1}`;
          
          itemsToImport.push({
            id: `link-${Date.now()}-${i}`,
            title: title,
            content: content,
            url: link,
          });
        } catch (error) {
          console.error(`抓取链接 ${link} 失败:`, error);
          // 即使抓取失败，也添加一个条目，以便用户知道这个链接存在
          // 使用唯一的标题和内容，确保不会被去重逻辑过滤掉
          itemsToImport.push({
            id: `link-${Date.now()}-${i}`,
            title: `链接内容 ${i + 1} (失败)`,
            content: `无法抓取 ${link} 的内容，请检查网络连接或URL是否正确。\n\n错误信息: ${(error as Error).message}`,
            url: link,
          });
        }
      }
    } else if (platform === 'pdf-image') {
      itemsToImport = [];
      
      // 处理PDF/图片文件
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setImportProgress(Math.round((i / uploadedFiles.length) * 50));
        
        // 转换文件为文字
        const content = await convertFileToText(file);
        itemsToImport.push({
          id: `file-${Date.now()}-${i}`,
          title: file.name,
          content: content,
          url: '', // 添加默认的空url
        });
      }
    } else if ((platform === 'wechat' || platform === 'zhihu' || platform === 'csdn') && platformLinks.trim()) {
      // 处理平台链接导入
      const links = platformLinks.split('\n').filter(l => l.trim());
      itemsToImport = [];
      
      // 抓取平台链接内容
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        setImportProgress(Math.round((i / links.length) * 50));
        
        try {
          // 抓取网页内容
          const content = await scrapeWebContent(link);
          // 从内容中提取标题（如果scrapeWebContent返回的内容包含标题）
          const titleMatch = content.match(/标题: ([^\n]+)/);
          const title = titleMatch ? titleMatch[1] : `${getPlatformName(platform)}内容 ${i + 1}`;
          
          itemsToImport.push({
            id: `${platform}-${Date.now()}-${i}`,
            title: title,
            content: content,
            url: link,
          });
        } catch (error) {
          console.error(`抓取 ${getPlatformName(platform)} 链接 ${link} 失败:`, error);
          // 即使抓取失败，也添加一个条目，以便用户知道这个链接存在
          itemsToImport.push({
            id: `${platform}-${Date.now()}-${i}`,
            title: `${getPlatformName(platform)}内容 ${i + 1} (失败)`,
            content: `无法抓取 ${link} 的内容，请检查网络连接或URL是否正确。\n\n错误信息: ${(error as Error).message}`,
            url: link,
          });
        }
      }
    } else {
      // 传统的扫码授权后选择导入（使用模拟数据）
      itemsToImport = mockFavorites.filter(item => selectedItems.includes(item.id));
    }

    // 去重逻辑：基于标题和内容判断重复条目
    // 但对于失败的条目，即使内容相似也应该保留，因为它们代表不同的导入尝试
    const deduplicatedItems = itemsToImport.filter((itemToImport) => {
      // 检查是否已存在相同标题和内容的条目
      // 对于失败的条目，只检查标题是否完全相同
      if (itemToImport.title.includes('(失败)')) {
        return !state.knowledgeItems.some((existingItem) => {
          return existingItem.title === itemToImport.title;
        });
      }
      // 对于成功的条目，检查标题或内容是否相同
      return !state.knowledgeItems.some((existingItem) => {
        const hasSameTitle = existingItem.title === itemToImport.title;
        const hasSimilarContent = existingItem.content.trim() === itemToImport.content.trim();
        return hasSameTitle || hasSimilarContent;
      });
    });

    const newImportedItems: KnowledgeItem[] = deduplicatedItems.map((item, index) => {
      setImportProgress(50 + Math.round((index / deduplicatedItems.length) * 50));
      
      let itemCategory = defaultCategory;
      let itemTags = ['导入', getPlatformName(platform), ...selectedTags];
      
      // AI分类处理
      if (useAiCategory) {
        // 模拟AI分析内容并推荐分类
        // 这里简单实现，实际项目中可以使用真实的AI API
        const content = item.content.toLowerCase();
        let recommendedCategory = defaultCategory;
        
        // 基于内容关键词推荐分类
        if (content.includes('学习') || content.includes('教育') || content.includes('课程')) {
          recommendedCategory = '学习笔记';
        } else if (content.includes('工作') || content.includes('项目') || content.includes('任务')) {
          recommendedCategory = '工作方法';
        } else if (content.includes('技术') || content.includes('编程') || content.includes('开发')) {
          recommendedCategory = '技术';
        } else if (content.includes('生活') || content.includes('健康') || content.includes('娱乐')) {
          recommendedCategory = '生活';
        } else if (content.includes('管理') || content.includes('效率') || content.includes('时间')) {
          recommendedCategory = '自我提升';
        }
        
        // 如果推荐的分类不存在，添加到分类列表
        if (recommendedCategory !== '未分类' && !state.categories.includes(recommendedCategory)) {
          dispatch({ type: 'ADD_CATEGORY', payload: recommendedCategory });
        }
        
        itemCategory = recommendedCategory;
      }
      
      // AI标签处理
      if (useAiTags) {
        // 模拟AI分析内容并推荐标签
        // 这里简单实现，实际项目中可以使用真实的AI API
        const content = item.content.toLowerCase();
        const recommendedTags: string[] = [];
        
        // 基于内容关键词推荐标签
        if (content.includes('学习') || content.includes('教育')) {
          recommendedTags.push('学习');
        }
        if (content.includes('技术') || content.includes('编程')) {
          recommendedTags.push('技术');
        }
        if (content.includes('工作') || content.includes('项目')) {
          recommendedTags.push('工作');
        }
        if (content.includes('效率') || content.includes('时间')) {
          recommendedTags.push('效率');
        }
        if (content.includes('生活') || content.includes('健康')) {
          recommendedTags.push('生活');
        }
        if (content.includes('阅读') || content.includes('书籍')) {
          recommendedTags.push('阅读');
        }
        if (content.includes('前端') || content.includes('react')) {
          recommendedTags.push('前端');
        }
        if (content.includes('管理') || content.includes('领导')) {
          recommendedTags.push('管理');
        }
        
        // 限制推荐标签数量为2个
        const finalRecommendedTags = recommendedTags.slice(0, 2);
        
        // 添加推荐标签
        finalRecommendedTags.forEach(tag => {
          if (!itemTags.includes(tag)) {
            itemTags.push(tag);
            // 如果推荐的标签不存在，添加到标签列表
            if (!state.tags.includes(tag)) {
              dispatch({ type: 'ADD_TAG', payload: tag });
            }
          }
        });
      }
      
      return {
        id: `item-${Date.now()}-${index}`,
        title: item.title,
        content: item.content,
        type: 'article',
        source: platform,
        tags: itemTags,
        categories: [itemCategory],
        createdAt: new Date(),
        updatedAt: new Date(),
        importedAt: new Date(),
        userId: state.user?.id || '',
        url: item.url,
      };
    });

    setImportProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 根据实际成功和失败数量设置状态
    let importStatus: 'success' | 'failed' | 'partial' = 'success';
    if (newImportedItems.length === 0) {
      importStatus = 'failed';
    } else if (newImportedItems.length < itemsToImport.length) {
      importStatus = 'partial';
    }

    const newRecord = {
      id: `import-${Date.now()}`,
      platform,
      status: importStatus,
      totalCount: itemsToImport.length,
      successCount: newImportedItems.length,
      failedCount: itemsToImport.length - newImportedItems.length,
      importedAt: new Date(),
      userId: state.user?.id || '',
      items: newImportedItems,
    };

    dispatch({ type: 'ADD_IMPORT_RECORD', payload: newRecord });
    dispatch({ type: 'ADD_KNOWLEDGE_ITEMS', payload: newImportedItems });
    setImportedItems(newImportedItems);

    setStep('complete');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // 筛选PDF和图片文件
      const validFiles = files.filter(file => {
        const type = file.type;
        return type.includes('pdf') || type.includes('image/');
      });
      setUploadedFiles(validFiles);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 使用千问3 VL API进行PDF/图片转文字
  const convertFileToText = async (file: File): Promise<string> => {
    try {
      // 调用千问3 VL API进行图像转文字
      const text = await convertImageToText(file);
      return text;
    } catch (error) {
      console.error('文件转换失败:', error);
      // 返回错误信息，避免影响用户体验
      return `文件转换失败: ${(error as Error).message}\n\n请检查文件格式是否正确，或尝试使用其他文件。`;
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`导入${getPlatformName(platform)}`} size="xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">{getPlatformIcon(platform)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{getPlatformName(platform)}导入</h3>
            <div className="flex items-center space-x-2 mt-1">
              {['auth', 'select', 'settings', 'importing', 'complete'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    ['auth', 'select', 'settings', 'importing', 'complete'].indexOf(step) >= i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 4 && (
                    <div className={`w-8 h-1 mx-1 ${
                      ['auth', 'select', 'settings', 'importing', 'complete'].indexOf(step) > i
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {step === 'auth' && (
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{getPlatformIcon(platform)}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                导入{getPlatformName(platform)}内容
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                请选择导入方式
              </p>
            </div>
            
            <div className="space-y-6">
              {/* 方式一：扫码授权 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">📱</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">扫码授权</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      使用{getPlatformName(platform)}扫码登录，授权访问您的内容
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleAuth()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    授权登录
                  </button>
                </div>
              </div>
              
              {/* 方式二：链接导入 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">🔗</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">链接导入</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      输入{getPlatformName(platform)}的公开链接，直接导入内容
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <textarea
                    value={platformLinks}
                    onChange={(e) => setPlatformLinks(e.target.value)}
                    placeholder={`请输入${getPlatformName(platform)}的公开链接，每行一个\n例如：\n${platform === 'wechat' ? 'https://mp.weixin.qq.com/s/...' : platform === 'zhihu' ? 'https://www.zhihu.com/question/...' : 'https://blog.csdn.net/...'}`}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (platformLinks.trim()) {
                          setStep('settings');
                        } else {
                          alert('请输入至少一个链接');
                        }
                      }}
                      disabled={!platformLinks.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      开始导入
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">全选</span>
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                已选择 {selectedItems.length} 项
              </span>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-80 overflow-y-auto">
              {mockFavorites.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-4 h-4 text-blue-600 rounded mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleNext}
                disabled={selectedItems.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 'settings' && (
          <div className="space-y-6">
            {platform === 'links' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  导入链接（每行一个）
                </label>
                <textarea
                  value={linksInput}
                  onChange={(e) => setLinksInput(e.target.value)}
                  placeholder="https://example.com/article1&#10;https://example.com/article2&#10;..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                />
              </div>
            )}
            
            {platform === 'pdf-image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  上传PDF或图片文件
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    key={fileInputKey}
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id={`file-upload-${fileInputKey}`}
                  />
                  <label
                    htmlFor={`file-upload-${fileInputKey}`}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-4xl">📁</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        点击或拖拽文件到此处上传
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        支持PDF和图片文件
                      </p>
                    </div>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      已上传文件 ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {file.type.includes('pdf') ? '📄' : '🖼️'}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分类
              </label>
              <div className="space-y-3">
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option>未分类</option>
                  {state.categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="添加新分类"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCategoryInput.trim()) {
                        setDefaultCategory(newCategoryInput.trim());
                        dispatch({ type: 'ADD_CATEGORY', payload: newCategoryInput.trim() });
                        setNewCategoryInput('');
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (newCategoryInput.trim()) {
                        setDefaultCategory(newCategoryInput.trim());
                        dispatch({ type: 'ADD_CATEGORY', payload: newCategoryInput.trim() });
                        setNewCategoryInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {state.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="添加新标签"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTagInput.trim()) {
                      setSelectedTags((prev) => [...prev, newTagInput.trim()]);
                      setNewTagInput('');
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newTagInput.trim()) {
                      setSelectedTags((prev) => [...prev, newTagInput.trim()]);
                      setNewTagInput('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-category"
                  checked={useAiCategory}
                  onChange={(e) => setUseAiCategory(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="ai-category" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  AI分类
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-tags"
                  checked={useAiTags}
                  onChange={(e) => setUseAiTags(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="ai-tags" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  AI标签
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                勾选后，AI将分析导入内容并自动推荐分类和标签
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="deduplicate"
                className="w-4 h-4 text-blue-600 rounded"
                defaultChecked
              />
              <label htmlFor="deduplicate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                自动去重
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleStartImport}
                disabled={(platform === 'links' && !linksInput.trim()) || (platform === 'pdf-image' && uploadedFiles.length === 0)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                开始导入
              </button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              正在导入...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              请稍候，正在导入您的内容
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-200"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{importProgress}%</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 text-green-500">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              导入成功！
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              成功导入 {importedItems.length} 条内容
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;

