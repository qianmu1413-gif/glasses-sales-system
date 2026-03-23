import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSalesStore } from '../stores/salesStore'
import { User, Calendar, Tag, ShoppingBag, FileText } from 'lucide-react'
import type { CustomerProfile } from '../types/sales'

const CustomerProfilePage: React.FC = () => {
  const { wxid } = useParams<{ wxid: string }>()
  const { currentProfile, analyzeCustomer } = useSalesStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (wxid) {
      loadProfile()
    }
  }, [wxid])

  const loadProfile = async () => {
    if (!wxid) return
    setLoading(true)
    try {
      await analyzeCustomer(wxid)
    } catch (error) {
      console.error('加载顾客档案失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">未找到顾客信息</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentProfile.name || '顾客'}</h1>
              <p className="text-gray-500">微信ID: {currentProfile.wxid}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">年龄段</div>
              <div className="text-lg font-semibold text-gray-800">{currentProfile.ageRange}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">消费能力</div>
              <div className="text-lg font-semibold text-gray-800">
                {currentProfile.purchasePower === 'high' ? '高' :
                 currentProfile.purchasePower === 'medium' ? '中' : '低'}
              </div>
            </div>
            {currentProfile.faceShape && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">脸型</div>
                <div className="text-lg font-semibold text-gray-800">{currentProfile.faceShape}</div>
              </div>
            )}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">分析置信度</div>
              <div className="text-lg font-semibold text-gray-800">{Math.round(currentProfile.confidence * 100)}%</div>
            </div>
          </div>
        </div>

        {/* 性格特征 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            性格特征
          </h2>
          <div className="flex flex-wrap gap-2">
            {currentProfile.personality.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* 偏好信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            偏好信息
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">风格偏好</div>
              <div className="flex flex-wrap gap-2">
                {currentProfile.preferences.style.map((style, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">价格区间</div>
              <div className="text-gray-800">
                ¥{currentProfile.preferences.priceRange[0]} - ¥{currentProfile.preferences.priceRange[1]}
              </div>
            </div>
            {currentProfile.preferences.brands.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">品牌偏好</div>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.preferences.brands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 分析时间 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            分析信息
          </h2>
          <div className="text-sm text-gray-600">
            最后分析时间: {new Date(currentProfile.lastAnalyzedAt).toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={loadProfile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重新分析
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerProfilePage
