import React, { useState, useEffect } from 'react'
import { useSalesStore } from '../stores/salesStore'
import { useFrameStore } from '../stores/frameStore'
import { useOrderStore } from '../stores/orderStore'
import { Send, Copy, Sparkles, User, ShoppingBag, Calculator } from 'lucide-react'
import type { CustomerProfile, SalesScript } from '../types/sales'

const SalesWorkbenchPage: React.FC = () => {
  const [selectedWxid, setSelectedWxid] = useState<string>('')
  const [inputMessage, setInputMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    currentProfile,
    currentScript,
    conversationContext,
    analyzeCustomer,
    generateScript,
    setConversationContext
  } = useSalesStore()

  const { recommendations, recommendFrames } = useFrameStore()
  const { calculatePrice } = useOrderStore()

  // 生成AI话术
  const handleGenerateScript = async (scenario: string) => {
    if (!selectedWxid) return

    setIsGenerating(true)
    try {
      await generateScript(selectedWxid, scenario, conversationContext)
    } catch (error) {
      console.error('生成话术失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制话术到剪贴板
  const handleCopyScript = async () => {
    if (!currentScript?.content) return

    try {
      await navigator.clipboard.writeText(currentScript.content)
      // 显示复制成功提示
      alert('话术已复制到剪贴板，可以粘贴到微信发送')
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 分析顾客画像
  const handleAnalyzeCustomer = async () => {
    if (!selectedWxid) return

    try {
      await analyzeCustomer(selectedWxid)
    } catch (error) {
      console.error('分析顾客失败:', error)
    }
  }

  // 推荐镜框
  const handleRecommendFrames = async () => {
    if (!currentProfile) return

    try {
      await recommendFrames({
        faceShape: currentProfile.faceShape,
        styles: currentProfile.preferences.style,
        priceRange: currentProfile.preferences.priceRange
      })
    } catch (error) {
      console.error('推荐镜框失败:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧：会话列表 */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">顾客会话</h2>
        </div>
        <div className="p-2">
          <div
            className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
              selectedWxid === 'demo_customer' ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedWxid('demo_customer')}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-800">演示顾客</div>
                <div className="text-xs text-gray-500">点击开始对话</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 中间：聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天历史 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedWxid ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              请选择一个顾客开始对话
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-500 py-2">
                开始与顾客对话
              </div>

              {/* 演示消息 */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-md shadow-sm">
                  <p className="text-gray-800">你好，我想配一副眼镜</p>
                </div>
              </div>

              {currentScript && (
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md shadow-sm">
                    <p>{currentScript.content}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <Send className="w-4 h-4" />
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：AI助手面板 */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI销售助手
          </h2>
        </div>

        <div className="p-4 space-y-6">
          {/* 顾客画像 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                顾客画像
              </h3>
              <button
                onClick={handleAnalyzeCustomer}
                disabled={!selectedWxid}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                分析
              </button>
            </div>

            {currentProfile ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">年龄段：</span>
                  <span className="text-gray-800">{currentProfile.ageRange}</span>
                </div>
                <div>
                  <span className="text-gray-600">性格：</span>
                  <span className="text-gray-800">{currentProfile.personality.join('、')}</span>
                </div>
                <div>
                  <span className="text-gray-600">消费能力：</span>
                  <span className="text-gray-800">
                    {currentProfile.purchasePower === 'high' ? '高' :
                     currentProfile.purchasePower === 'medium' ? '中' : '低'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">风格偏好：</span>
                  <span className="text-gray-800">{currentProfile.preferences.style.join('、')}</span>
                </div>
                {currentProfile.faceShape && (
                  <div>
                    <span className="text-gray-600">脸型：</span>
                    <span className="text-gray-800">{currentProfile.faceShape}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无画像数据</p>
            )}
          </div>

          {/* 话术生成 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">生成话术</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'greeting', label: '欢迎' },
                { key: 'consultation', label: '咨询' },
                { key: 'recommendation', label: '推荐' },
                { key: 'negotiation', label: '议价' },
                { key: 'closing', label: '成交' },
                { key: 'afterSales', label: '售后' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleGenerateScript(key)}
                  disabled={!selectedWxid || isGenerating}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {label}
                </button>
              ))}
            </div>

            {currentScript && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800 mb-2">{currentScript.content}</p>
                <button
                  onClick={handleCopyScript}
                  className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制到剪贴板
                </button>
              </div>
            )}
          </div>

          {/* 镜框推荐 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                镜框推荐
              </h3>
              <button
                onClick={handleRecommendFrames}
                disabled={!currentProfile}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                推荐
              </button>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.frame.id} className="p-2 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-sm text-gray-800">{rec.frame.name}</div>
                    <div className="text-xs text-gray-600">¥{rec.frame.price}</div>
                    <div className="text-xs text-gray-500 mt-1">{rec.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无推荐</p>
            )}
          </div>

          {/* 快速价格计算 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              价格计算
            </h3>
            <button
              onClick={() => window.location.href = '/orders'}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              打开价格计算器
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesWorkbenchPage
