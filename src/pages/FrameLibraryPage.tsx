import React, { useEffect, useState } from 'react'
import { useFrameStore } from '../stores/frameStore'
import { Search, Filter, Plus } from 'lucide-react'
import type { Frame, FrameFilter } from '../types/frames'

const FrameLibraryPage: React.FC = () => {
  const { frames, filter, searchFrames, setFilter, loadFrames } = useFrameStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFrames()
  }, [])

  const handleSearch = () => {
    searchFrames(searchQuery)
  }

  const handleFilterChange = (key: keyof FrameFilter, value: any) => {
    setFilter({ ...filter, [key]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索镜框名称、型号..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                搜索
              </button>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          {/* 筛选条件 */}
          <div className="mt-4 flex gap-4">
            <select
              value={filter.style || ''}
              onChange={(e) => handleFilterChange('style', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">全部风格</option>
              <option value="商务">商务</option>
              <option value="时尚">时尚</option>
              <option value="运动">运动</option>
              <option value="复古">复古</option>
            </select>

            <select
              value={filter.material || ''}
              onChange={(e) => handleFilterChange('material', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">全部材质</option>
              <option value="钛合金">钛合金</option>
              <option value="板材">板材</option>
              <option value="金属">金属</option>
              <option value="TR90">TR90</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">价格:</span>
              <input
                type="number"
                placeholder="最低"
                value={filter.priceRange?.[0] || ''}
                onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filter.priceRange?.[1] || 10000])}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="最高"
                value={filter.priceRange?.[1] || ''}
                onChange={(e) => handleFilterChange('priceRange', [filter.priceRange?.[0] || 0, Number(e.target.value)])}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 镜框网格 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 {frames.length} 款镜框
          </div>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加镜框
          </button>
        </div>

        {frames.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无镜框数据，请先导入镜框库
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {frames.map((frame: Frame) => (
              <div key={frame.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* 镜框图片 */}
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  {frame.imageUrl ? (
                    <img
                      src={frame.imageUrl}
                      alt={frame.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      暂无图片
                    </div>
                  )}
                </div>

                {/* 镜框信息 */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{frame.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{frame.model}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {frame.style}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {frame.material}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-red-600">
                      ¥{frame.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      库存: {frame.stock}
                    </div>
                  </div>

                  <button className="w-full mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                    推荐给顾客
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FrameLibraryPage
