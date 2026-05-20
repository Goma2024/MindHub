
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import KnowledgeDetailModal from '../components/KnowledgeDetailModal'
import LoginModal from '../components/LoginModal'
import { KnowledgeItem } from '../types'

const Dashboard = () => {
  const { state } = useAppContext()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)

  const stats = [
    { label: '知识内容', value: state.knowledgeItems.length, icon: '📚', color: 'blue' },
    { label: '导入次数', value: state.importRecords.length, icon: '📥', color: 'green' },
    { label: '检索次数', value: state.searchRecords.length, icon: '🔍', color: 'purple' },
  ]

  const quickActions = [
    { path: '/import', label: '导入内容', icon: '➕', description: '从微信、浏览器等平台导入' },
    { path: '/knowledge', label: '浏览知识库', icon: '📖', description: '查看和管理所有知识内容' },
    { path: '/search', label: 'AI检索', icon: '🤖', description: '用自然语言提问查找知识' },
  ]

  const sortedKnowledgeItems = [...state.knowledgeItems].sort(
    (a, b) => {
      const dateA = a.importedAt || a.createdAt;
      const dateB = b.importedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
  )

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  return (
    <div className="space-y-8">
      {state.user ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              欢迎回来，{state.user.name}！
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              管理你的知识宝库，让智慧流动起来。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">快速操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">最近添加</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedKnowledgeItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.content}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                            {item.source === 'wechat' ? '微信' :
                             item.source === 'links' ? '链接导入' :
                             item.source === 'zhihu' ? '知乎' :
                             item.source === 'csdn' ? 'CSDN' : '本地'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.importedAt || item.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-2xl">
                        {item.source === 'wechat' && '💬'}
                        {item.source === 'browser' && '🌐'}
                        {item.source === 'local' && '📝'}
                        {item.source === 'zhihu' && '🔍'}
                        {item.source === 'csdn' && '💻'}
                        {item.source === 'links' && '🔗'}
                      </div>
                    </div>
                  </div>
                ))}
                {sortedKnowledgeItems.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500 dark:text-gray-400">还没有添加任何内容</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="text-8xl">🧠</div>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              欢迎来到智汇库
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              一个智能的知识库管理系统，帮助你收集、整理和检索知识，让你的智慧有序存储，随用随取。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                登录
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                注册
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                知识管理
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                收集、整理和分类你的知识，构建个人知识体系
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI 检索
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用自然语言提问，AI 帮你快速找到相关知识
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📥</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                多平台导入
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                从微信、知乎、CSDN 等平台一键导入内容
              </p>
            </div>
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

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default Dashboard

