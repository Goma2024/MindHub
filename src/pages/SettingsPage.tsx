
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const SettingsPage = () => {
  const { state, dispatch } = useAppContext()
  const [name, setName] = useState(state.user?.name || '')
  const [email, setEmail] = useState(state.user?.email || '')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const subscriptionPlans = [
    {
      name: '免费版',
      price: '¥0/月',
      features: [
        '基础导入（3个平台）',
        '100次/月AI检索',
        '1GB存储空间',
      ],
      current: state.user?.subscription === 'free',
    },
    {
      name: '标准版',
      price: '¥29/月',
      features: [
        '无限导入平台',
        '1000次/月AI检索',
        '10GB存储空间',
        '高级分类功能',
      ],
      current: state.user?.subscription === 'standard',
    },
    {
      name: '专业版',
      price: '¥99/月',
      features: [
        '无限制AI检索',
        '50GB存储空间',
        '团队协作',
        'API访问',
        '优先技术支持',
      ],
      current: state.user?.subscription === 'pro',
    },
  ]

  const handleSaveUserInfo = async () => {
    setIsSaving(true)
    setMessage(null)

    await new Promise(resolve => setTimeout(resolve, 1000))

    dispatch({ type: 'UPDATE_USER', payload: { name, email } })
    setMessage({ text: '用户信息已保存！', type: 'success' })
    setIsSaving(false)

    setTimeout(() => setMessage(null), 3000)
  }

  const handleClearCache = () => {
    if (window.confirm('确定要清理缓存吗？这将清除所有临时数据。')) {
      setMessage({ text: '缓存已清理！', type: 'success' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleChangeAvatar = () => {
    alert('头像更换功能：在实际应用中，这里会打开文件选择器')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">设置</h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理您的账户和偏好设置。
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              用户信息
            </h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={state.user?.avatar}
                  alt={state.user?.name}
                  className="w-20 h-20 rounded-full"
                />
                <button
                  onClick={handleChangeAvatar}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  更换头像
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSaveUserInfo}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isSaving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              通知设置
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">邮件通知</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">接收重要更新的邮件</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">推送通知</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">接收浏览器推送</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">每周简报</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">每周知识使用报告</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, weekly: !n.weekly }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.weekly ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      notifications.weekly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              存储管理
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300">已使用</span>
                  <span className="text-gray-900 dark:text-white font-medium">0.2 GB / 1 GB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <button
                onClick={handleClearCache}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                清理缓存
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              订阅方案
            </h2>
            <div className="space-y-4">
              {subscriptionPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    plan.current
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {plan.price}
                      </p>
                    </div>
                    {plan.current && (
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                        当前
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!plan.current && (
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      {index === 0 ? '保持免费' : '升级'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              关于我们
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>智汇库 v1.0.0</strong></p>
              <p>
                智汇库是一款AI驱动的个人知识库整理工具，帮助您统一管理分散的知识内容，
                并通过智能检索提升知识利用效率。
              </p>
              <div className="flex flex-wrap gap-2 pt-4">
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  隐私政策
                </a>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  使用条款
                </a>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  帮助中心
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

