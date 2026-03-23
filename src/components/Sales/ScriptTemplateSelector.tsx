// 话术模板选择器组件
import React, { useState, useEffect } from 'react'
import { MessageSquare, Star, Search, Plus } from 'lucide-react'

interface ScriptTemplate {
  id: string
  name: string
  category: string
  content: string
  tags: string[]
  useCount: number
  isFavorite: boolean
}

interface Props {
  onSelectTemplate: (content: string) => void
}

export const ScriptTemplateSelector: React.FC<Props> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<ScriptTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFavorites, setShowFavorites] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.sales.getAllTemplates()
      if (result.success && result.templates) {
        setTemplates(result.templates)
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  const handleUseTemplate = async (template: ScriptTemplate) => {
    try {
      await window.electronAPI.sales.useTemplate(template.id)
      onSelectTemplate(template.content)
      await loadTemplates() // 刷新使用次数
    } catch (error) {
      console.error('使用模板失败:', error)
    }
  }

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await window.electronAPI.sales.toggleFavoriteTemplate(id)
      await loadTemplates()
    } catch (error) {
      console.error('收藏失败:', error)
    }
  }

  const filteredTemplates = templates.filter(t => {
    if (showFavorites && !t.isFavorite) return false
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'greeting', label: '欢迎' },
    { id: 'consultation', label: '咨询' },
    { id: 'recommendation', label: '推荐' },
    { id: 'negotiation', label: '议价' },
    { id: 'closing', label: '成交' },
    { id: 'afterSales', label: '售后' }
  ]

  return (
    <div className="script-template-selector bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          话术模板库
        </h3>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`p-2 rounded ${showFavorites ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
        >
          <Star className="w-5 h-5" fill={showFavorites ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无匹配的模板</p>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              onClick={() => handleUseTemplate(template)}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{template.name}</span>
                    <span className="text-xs text-gray-500">使用 {template.useCount} 次</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(template.id, e)}
                  className="p-1"
                >
                  <Star
                    className="w-4 h-4"
                    fill={template.isFavorite ? '#fbbf24' : 'none'}
                    stroke={template.isFavorite ? '#fbbf24' : 'currentColor'}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
