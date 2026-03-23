// 眼镜销售系统 IPC 通道注册
import { ipcMain } from 'electron'
import { ConfigService } from './services/config'
import { initLLMService, getLLMService } from './services/llm/llmService'
import { getCustomerProfileService } from './services/sales/customerProfileService'
import { getSalesScriptService } from './services/sales/salesScriptService'
import { getClipboardService } from './services/sales/clipboardService'
import { getFrameLibraryService } from './services/frames/frameLibraryService'
import { getFrameRecommendationService } from './services/frames/frameRecommendationService'
import { getPricingService } from './services/pricing/pricingService'
import { getCustomerDatabaseService } from './services/database/customerDatabaseService'

export function registerSalesIPC() {
  const config = ConfigService.getInstance()

  // 初始化LLM服务
  ipcMain.handle('sales:init-llm', async () => {
    try {
      const provider = config.get('llmProvider')
      const apiKey = provider === 'openai' ? config.get('openaiApiKey') : config.get('claudeApiKey')
      const model = provider === 'openai' ? config.get('openaiModel') : config.get('claudeModel')

      initLLMService({ provider, apiKey, model })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 分析顾客画像
  ipcMain.handle('sales:analyze-customer', async (_event, wxid: string, messages: any[]) => {
    try {
      const service = getCustomerProfileService()
      const profile = await service.analyzeCustomer(wxid, messages)
      return { success: true, profile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 生成销售话术
  ipcMain.handle('sales:generate-script', async (_event, context: any, scenario: string) => {
    try {
      const service = getSalesScriptService()
      const script = await service.generateScript(context, scenario as any)
      return { success: true, script }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 复制到剪贴板
  ipcMain.handle('sales:copy-to-clipboard', async (_event, text: string) => {
    try {
      const service = getClipboardService()
      service.copyText(text)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 镜框推荐
  ipcMain.handle('sales:recommend-frames', async (_event, profile: any, maxResults: number) => {
    try {
      const service = getFrameRecommendationService()
      const recommendations = service.recommendFrames(profile, maxResults)
      return { success: true, recommendations }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 价格计算
  ipcMain.handle('sales:calculate-price', async (_event, frame: any, lensOption: any, discountCode?: string) => {
    try {
      const service = getPricingService()
      const calculation = service.calculatePrice(frame, lensOption, discountCode)
      return { success: true, calculation }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 保存顾客画像
  ipcMain.handle('sales:save-customer-profile', async (_event, profile: any) => {
    try {
      const service = getCustomerDatabaseService()
      service.saveCustomerProfile(profile)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取顾客画像
  ipcMain.handle('sales:get-customer-profile', async (_event, wxid: string) => {
    try {
      const service = getCustomerDatabaseService()
      const profile = service.getCustomerProfile(wxid)
      return { success: true, profile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 初始化数据库
  getCustomerDatabaseService().initialize()
}
