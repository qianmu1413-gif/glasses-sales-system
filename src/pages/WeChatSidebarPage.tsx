// 微信吸附侧边栏页面
import React, { useState, useEffect } from 'react'
import { useSalesStore } from '../stores/salesStore'
import { Copy, Sparkles, User, Clock, FileText, X, MessageSquare } from 'lucide-react'
import './WeChatSidebarPage.scss'

const WeChatSidebarPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [quickTemplates, setQuickTemplates] = useState<any[]>([])
  
  const {
    currentProfile,
    currentScript,
    generateScript,
    isGeneratingScript
  } = useSalesStore()

  useEffect(() => {
    loadQuickTemplates()
  }, [])

  const loadQuickTemplates = async () => {
    try {
      const result = await window.electronAPI.sales.getAllTemplates()
      if (result.success && result.templates) {
        // 只显示收藏的或使用次数最多的前5个
        const top = result.templates
          .filter((t: any) => t.isFavorite)
          .slice(0, 5)
        setQuickTemplates(top)
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  const handleGenerateScript = async (scenario: string) => {
    setSelectedScenario(scenario)
    if (!currentProfile) {
      alert('请先在主窗口分析顾客画像')
      return
    }
    await generateScript('demo_customer', scenario, null)
  }

  const handleCopyScript = async () => {
    if (!currentScript?.content) return
    try {
      await window.electronAPI.sales.copyToClipboard(currentScript.content)
      // 简单的视觉反馈
      const btn = document.querySelector('.copy-btn')
      btn?.classList.add('copied')
      setTimeout(() => btn?.classList.remove('copied'), 1000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleUseTemplate = async (template: any) => {
    try {
      await window.electronAPI.sales.useTemplate(template.id)
      await window.electronAPI.sales.copyToClipboard(template.content)
      alert('话术已复制到剪贴板')
    } catch (error) {
      console.error('使用模板失败:', error)
    }
  }

  return (
    <div className="wechat-sidebar-page">
      {/* 顶部：顾客信息卡片 */}
      <div className="customer-card">
        <div className="card-header">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">当前顾客</span>
        </div>
        {currentProfile ? (
          <div className="customer-info">
            <div className="customer-name">{currentProfile.name}</div>
            <div className="customer-tags">
              <span className="tag">{currentProfile.ageRange}</span>
              <span className="tag">
                {currentProfile.purchasePower === 'high' ? '高消费' : 
                 currentProfile.purchasePower === 'medium' ? '中消费' : '低消费'}
              </span>
            </div>
            <div className="customer-style">
              {currentProfile.preferences.style.join('、')}
            </div>
          </div>
        ) : (
          <div className="no-customer">
            <p className="text-xs text-gray-500">未选择顾客</p>
            <p className="text-xs text-gray-400">请在主窗口选择顾客</p>
          </div>
        )}
      </div>

      {/* 中部：快速话术生成 */}
      <div className="quick-scripts">
        <div className="section-title">
          <Sparkles className="w-4 h-4" />
          <span>快速话术</span>
        </div>
        <div className="script-buttons">
          {[
            { key: 'greeting', label: '欢迎', icon: '👋' },
            { key: 'consultation', label: '咨询', icon: '💬' },
            { key: 'recommendation', label: '推荐', icon: '⭐' },
            { key: 'negotiation', label: '议价', icon: '💰' },
            { key: 'closing', label: '成交', icon: '✅' },
            { key: 'afterSales', label: '售后', icon: '🔧' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleGenerateScript(key)}
              disabled={isGeneratingScript || !currentProfile}
              className={`script-btn ${selectedScenario === key ? 'active' : ''}`}
            >
              <span className="icon">{icon}</span>
              <span className="label">{label}</span>
            </button>
          ))}
        </div>

        {/* 生成的话术显示 */}
        {currentScript && (
          <div className="generated-script">
            <div className="script-content">
              {currentScript.content}
            </div>
            <button
              onClick={handleCopyScript}
              className="copy-btn"
            >
              <Copy className="w-4 h-4" />
              <span>复制到剪贴板</span>
            </button>
          </div>
        )}

        {isGeneratingScript && (
          <div className="generating">
            <div className="spinner"></div>
            <span>AI生成中...</span>
          </div>
        )}
      </div>

      {/* 快捷模板 */}
      {quickTemplates.length > 0 && (
        <div className="quick-templates">
          <div className="section-title">
            <MessageSquare className="w-4 h-4" />
            <span>常用模板</span>
          </div>
          <div className="template-list">
            {quickTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="template-item"
              >
                <div className="template-name">{template.name}</div>
                <div className="template-preview">{template.content.slice(0, 30)}...</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 底部：快捷操作 */}
      <div className="quick-actions">
        <button
          onClick={() => window.electronAPI.sales.getPendingReminders()}
          className="action-btn"
        >
          <Clock className="w-4 h-4" />
          <span>跟进提醒</span>
        </button>
        <button
          onClick={() => {/* 打开报价单 */}}
          className="action-btn"
        >
          <FileText className="w-4 h-4" />
          <span>生成报价</span>
        </button>
      </div>
    </div>
  )
}

export default WeChatSidebarPage
