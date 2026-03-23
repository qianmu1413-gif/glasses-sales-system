// 眼镜销售系统配置页面
import React, { useState, useEffect } from 'react'
import { config } from '../services/ipc'
import './SalesConfigPage.scss'

export default function SalesConfigPage() {
  const [configState, setConfigState] = useState({
    llmProvider: 'openai' as 'openai' | 'claude',
    openaiApiKey: '',
    openaiModel: 'gpt-4-turbo-preview',
    claudeApiKey: '',
    claudeModel: 'claude-3-5-sonnet-20241022',
    frameLibraryPath: '',
    autoClipboard: true
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const llmProvider = (await config.get('llmProvider')) as 'openai' | 'claude'
    const openaiApiKey = (await config.get('openaiApiKey')) as string
    const openaiModel = (await config.get('openaiModel')) as string
    const claudeApiKey = (await config.get('claudeApiKey')) as string
    const claudeModel = (await config.get('claudeModel')) as string
    const frameLibraryPath = (await config.get('frameLibraryPath')) as string
    const autoClipboard = (await config.get('autoClipboard')) as boolean

    setConfigState({
      llmProvider: llmProvider || 'openai',
      openaiApiKey: openaiApiKey || '',
      openaiModel: openaiModel || 'gpt-4-turbo-preview',
      claudeApiKey: claudeApiKey || '',
      claudeModel: claudeModel || 'claude-3-5-sonnet-20241022',
      frameLibraryPath: frameLibraryPath || '',
      autoClipboard: autoClipboard !== false
    })
  }

  const handleSave = async () => {
    await config.set('llmProvider', configState.llmProvider)
    await config.set('openaiApiKey', configState.openaiApiKey)
    await config.set('openaiModel', configState.openaiModel)
    await config.set('claudeApiKey', configState.claudeApiKey)
    await config.set('claudeModel', configState.claudeModel)
    await config.set('frameLibraryPath', configState.frameLibraryPath)
    await config.set('autoClipboard', configState.autoClipboard)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="sales-config-page">
      <h1>眼镜销售系统配置</h1>

      <div className="config-section">
        <h2>AI模型配置</h2>

        <div className="form-group">
          <label>AI提供商</label>
          <select value={configState.llmProvider} onChange={e => setConfigState({...configState, llmProvider: e.target.value as any})}>
            <option value="openai">OpenAI</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        {configState.llmProvider === 'openai' && (
          <>
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input type="password" value={configState.openaiApiKey} onChange={e => setConfigState({...configState, openaiApiKey: e.target.value})} />
            </div>
            <div className="form-group">
              <label>模型</label>
              <input type="text" value={configState.openaiModel} onChange={e => setConfigState({...configState, openaiModel: e.target.value})} />
            </div>
          </>
        )}

        {configState.llmProvider === 'claude' && (
          <>
            <div className="form-group">
              <label>Claude API Key</label>
              <input type="password" value={configState.claudeApiKey} onChange={e => setConfigState({...configState, claudeApiKey: e.target.value})} />
            </div>
            <div className="form-group">
              <label>模型</label>
              <input type="text" value={configState.claudeModel} onChange={e => setConfigState({...configState, claudeModel: e.target.value})} />
            </div>
          </>
        )}
      </div>

      <div className="config-section">
        <h2>镜框库配置</h2>
        <div className="form-group">
          <label>镜框库路径</label>
          <input type="text" value={configState.frameLibraryPath} onChange={e => setConfigState({...configState, frameLibraryPath: e.target.value})} />
        </div>
      </div>

      <div className="config-section">
        <h2>其他设置</h2>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={configState.autoClipboard} onChange={e => setConfigState({...configState, autoClipboard: e.target.checked})} />
            自动复制话术到剪贴板
          </label>
        </div>
      </div>

      <button className="save-button" onClick={handleSave}>
        {saved ? '✓ 已保存' : '保存配置'}
      </button>
    </div>
  )
}
