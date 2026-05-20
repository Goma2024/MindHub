import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import KnowledgeDetailModal from '../components/KnowledgeDetailModal'
import { KnowledgeItem } from '../types'
import { callDeepSeekAPI } from '../utils/api'

const SearchPage = () => {
  const { state, dispatch } = useAppContext()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([])
  const [aiSummary, setAiSummary] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const getSourceName = (source: string) => {
    switch (source) {
      case 'wechat': return '微信'
      case 'links': return '链接导入'
      case 'zhihu': return '知乎'
      case 'csdn': return 'CSDN'
      case 'local': return '本地'
      case 'browser': return '浏览器'
      default: return source
    }
  }

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)

    // 简单的搜索逻辑：匹配标题或内容
    const results = state.knowledgeItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
    )

    // 按排序方式排序
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

    // 生成AI总结
    const summary = await generateAiSummary(query, sortedResults)

    setSearchResults(sortedResults)
    setAiSummary(summary)
    setIsSearching(false)

    // 记录搜索历史
    if (results.length > 0) {
      dispatch({
        type: 'ADD_SEARCH_RECORD',
        payload: {
          id: Date.now().toString(),
          query,
          timestamp: new Date().toISOString(),
          resultCount: results.length,
          userId: state.user?.id || ''
        }
      })
    }
  }

  const generateAiSummary = async (query: string, results: KnowledgeItem[]) => {
    if (results.length === 0) {
      // 没有搜索结果时，只提供额外的API大语言模型输出
      const apiOutput = await generateApiOutput(query);
      return `没有找到相关的知识内容。\n\n${apiOutput}`;
    }

    // 有搜索结果时，先总结搜索结果，再提供额外的API输出
    const resultSummary = summarizeSearchResults(query, results);
    const apiOutput = await generateApiOutput(query);
    
    return `${resultSummary}\n\n${apiOutput}`;
  };

  // 总结搜索结果中与查询相关的内容
  const summarizeSearchResults = (query: string, results: KnowledgeItem[]) => {
    // 提取相关内容的关键词和要点
    const keyPoints = results.slice(0, 3).map((item, index) => {
      // 从内容中提取与查询相关的部分
      const relevantContent = extractRelevantContent(item.content, query);
      return `${index + 1}. ${item.title}\n   ${relevantContent}`;
    }).join('\n\n');

    return `根据您的搜索"${query}"，我找到了${results.length}条相关内容：\n\n${keyPoints}\n\n这些内容涵盖了您查询的主要方面，您可以查看下方的详细结果获取更多信息。`;
  };

  // 提取与查询相关的内容
  const extractRelevantContent = (content: string, query: string) => {
    // 简单的相关内容提取逻辑
    const words = query.split(/\s+/);
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim());
    
    // 找到包含查询关键词的句子
    const relevantSentences = sentences.filter(sentence => 
      words.some(word => sentence.includes(word))
    );

    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 2).join('。') + '。';
    }

    // 如果没有找到相关句子，返回前50个字符
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  };

  // 使用DeepSeek API生成AI建议
  const generateApiOutput = async (query: string) => {
    try {
      const response = await callDeepSeekAPI(query);
      return `【AI建议】\n${response}`;
    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      // 失败时返回默认响应
      return `【AI建议】\n关于"${query}"，我建议您从多个角度思考这个问题，结合实际情况进行分析。`;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI检索</h1>
        <p className="text-gray-600 dark:text-gray-400">
          用自然语言提问，AI帮您快速找到相关知识。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入搜索关键词..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>

          {aiSummary && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI建议</h3>
              <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{aiSummary}</pre>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  搜索结果 ({searchResults.length})
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="date">按时间排序</option>
                </select>
              </div>
              <div className="space-y-4">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-xs text-blue-700 dark:text-blue-300 rounded">
                        {getSourceName(item.source)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && query && !isSearching && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">没有找到相关的知识内容。</p>
            </div>
          )}
        </div>
      </div>

      {state.searchRecords.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">搜索历史</h3>
          <div className="space-y-2">
            {state.searchRecords.slice(-5).map((record) => (
              <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 dark:text-gray-300">{record.query}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  找到 {record.resultCount} 条结果
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default SearchPage
