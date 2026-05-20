
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import KnowledgeDetailModal from '../components/KnowledgeDetailModal'
import { KnowledgeItem } from '../types'

const KnowledgePage = () => {
  const { state, dispatch } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [newTag, setNewTag] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  const categories = ['全部', ...state.categories]

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !state.categories.includes(newCategory.trim())) {
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory.trim() })
      setNewCategory('')
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`确定要删除分类"${category}"吗？`)) {
      dispatch({ type: 'DELETE_CATEGORY', payload: category })
      if (selectedCategory === category) {
        setSelectedCategory(null)
      }
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !state.tags.includes(newTag.trim())) {
      dispatch({ type: 'ADD_TAG', payload: newTag.trim() })
      setNewTag('')
    }
  }

  const handleDeleteTag = (tag: string) => {
    if (window.confirm(`确定要删除标签"${tag}"吗？`)) {
      dispatch({ type: 'DELETE_TAG', payload: tag })
      setSelectedTags(prev => prev.filter(t => t !== tag))
    }
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSearch = () => {
    // 搜索逻辑已经在filteredItems中实现，这里可以添加搜索记录
    if (searchQuery.trim()) {
      dispatch({
        type: 'ADD_SEARCH_RECORD',
        payload: {
          id: Date.now().toString(),
          query: searchQuery,
          results: filteredItems,
          timestamp: new Date(),
          resultCount: filteredItems.length,
          userId: state.user?.id || ''
        }
      })
    }
  }

  const getSourceName = (source: string) => {
    switch (source) {
      case 'wechat': return '微信'
      case 'links': return '链接导入'
      case 'zhihu': return '知乎'
      case 'csdn': return 'CSDN'
      case 'local': return '本地'
      default: return source
    }
  }

  const filteredItems = state.knowledgeItems.filter(item => {
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === '全部' || 
      item.categories.includes(selectedCategory)
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => item.tags.includes(tag))
    return matchesSearch && matchesCategory && matchesTags
  }).sort((a, b) => {
    const dateA = new Date(a.importedAt || a.createdAt).getTime()
    const dateB = new Date(b.importedAt || b.createdAt).getTime()
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">知识库</h1>
        <p className="text-gray-600 dark:text-gray-400">
          浏览和管理您的所有知识内容。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="搜索知识内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            搜索
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
          </select>
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-2 rounded-lg border ${
              viewMode === 'card'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            📱 卡片视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg border ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            📋 列表视图
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">分类</h3>
            </div>
            <div className="space-y-2 mb-4">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between group">
                  <button
                    onClick={() => setSelectedCategory(category === '全部' ? null : category)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category || (category === '全部' && !selectedCategory)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                  {category !== '全部' && (
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加分类"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleAddCategory}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                +
              </button>
            </div>
          </div>

          {state.tags.length > 0 && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">标签</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {state.tags.map((tag) => (
                  <div key={tag} className="group relative">
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  清除标签筛选
                </button>
              )}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="添加标签"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-xl ml-2">
                        {item.source === 'wechat' && '💬'}
                        {item.source === 'browser' && '🌐'}
                        {item.source === 'local' && '📝'}
                        {item.source === 'zhihu' && '🔍'}
                        {item.source === 'csdn' && '💻'}
                        {item.source === 'links' && '🔗'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {getSourceName(item.source)}
                      </span>
                      <span>{new Date(item.importedAt || item.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
                      {item.source === 'wechat' && '💬'}
                      {item.source === 'browser' && '🌐'}
                      {item.source === 'local' && '📝'}
                      {item.source === 'zhihu' && '🔍'}
                      {item.source === 'csdn' && '💻'}
                      {item.source === 'links' && '🔗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getSourceName(item.source)}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {new Date(item.importedAt || item.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400">
                没有找到相关的知识内容
              </p>
            </div>
          )}
        </div>
      </div>

      <KnowledgeDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
      />
    </div>
  )
}

export default KnowledgePage

