
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { ImportPlatform, ImportRecord } from '../types'
import ImportModal from '../components/ImportModal'
import ImportRecordDetailModal from '../components/ImportRecordDetailModal'

const ImportPage = () => {
  const { state, dispatch } = useAppContext()
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform | null>(null)
  const [showRecordDetail, setShowRecordDetail] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ImportRecord | null>(null)

  const handleDeleteRecord = (recordId: string, e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发记录详情打开
    e.stopPropagation()
    
    if (window.confirm('确定要删除这条导入历史吗？')) {
      dispatch({ type: 'DELETE_IMPORT_RECORD', payload: recordId })
    }
  }

  const platforms = [
    { id: 'wechat' as const, name: '微信', icon: '💬', description: '导入您的微信收藏内容' },
    { id: 'links' as const, name: '链接导入', icon: '🔗', description: '批量导入网址链接' },
    { id: 'zhihu' as const, name: '知乎', icon: '🔍', description: '导入知乎收藏内容' },
    { id: 'csdn' as const, name: 'CSDN', icon: '💻', description: '导入CSDN收藏内容' },
    { id: 'pdf-image' as const, name: 'PDF/图片', icon: '📄', description: '上传PDF或图片文件并转换为文字' },
  ] as const

  const handlePlatformSelect = (platform: ImportPlatform) => {
    setSelectedPlatform(platform)
    setShowImportModal(true)
  }

  const handleRecordClick = (record: ImportRecord) => {
    setSelectedRecord(record)
    setShowRecordDetail(true)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'wechat': return '💬'
      case 'links': return '🔗'
      case 'zhihu': return '🔍'
      case 'csdn': return '💻'
      case 'pdf-image': return '📄'
      default: return '📥'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'wechat': return '微信'
      case 'links': return '链接导入'
      case 'zhihu': return '知乎'
      case 'csdn': return 'CSDN'
      case 'pdf-image': return 'PDF/图片'
      default: return platform
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">导入内容</h1>
        <p className="text-gray-600 dark:text-gray-400">
          从多个平台一键导入您的知识内容，AI自动分类整理。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformSelect(platform.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedPlatform === platform.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{platform.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {platform.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">导入历史</h2>
        {state.importRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 dark:text-gray-400">
              还没有导入记录，选择上方的平台开始导入吧！
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {state.importRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleRecordClick(record)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getPlatformIcon(record.platform)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {getPlatformName(record.platform)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.importedAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          成功: {record.successCount}
                        </p>
                        {record.failedCount > 0 && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            失败: {record.failedCount}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'success'
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : record.status === 'failed'
                          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300'
                      }`}>
                        {record.status === 'success' ? '成功' : record.status === 'failed' ? '失败' : '部分成功'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteRecord(record.id, e)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="删除记录"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPlatform && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false)
            setSelectedPlatform(null)
          }}
          platform={selectedPlatform}
        />
      )}

      <ImportRecordDetailModal
        isOpen={showRecordDetail}
        onClose={() => {
          setShowRecordDetail(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
      />
    </div>
  )
}

export default ImportPage

