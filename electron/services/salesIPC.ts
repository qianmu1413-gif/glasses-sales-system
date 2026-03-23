// 眼镜销售系统 IPC 通道注册
import { ipcMain } from 'electron'
import { ConfigService } from './config'
import { initLLMService, getLLMService } from './llm/llmService'
import { getCustomerProfileService } from './sales/customerProfileService'
import { getSalesScriptService } from './sales/salesScriptService'
import { getClipboardService } from './sales/clipboardService'
import { getFollowUpService } from './sales/followUpService'
import { getScriptTemplateService } from './sales/scriptTemplateService'
import { getQuotationService } from './sales/quotationService'
import { shell } from 'electron'

export function registerSalesIPC() {
  const config = ConfigService.getInstance()

  // 初始化LLM服务
  ipcMain.handle('sales:init-llm', async () => {
    try {
      await initLLMService()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 分析顾客画像
  ipcMain.handle('sales:analyze-customer', async (_event, wxid: string, messages: any[]) => {
    try {
      const profileService = getCustomerProfileService()
      const profile = await profileService.analyzeCustomer(wxid, messages)
      return { success: true, profile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 生成销售话术
  ipcMain.handle('sales:generate-script', async (_event, profile: any, scenario: string, context: any) => {
    try {
      const scriptService = getSalesScriptService()
      const script = await scriptService.generateScript(profile, scenario, context)
      return { success: true, script }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 复制到剪贴板
  ipcMain.handle('sales:copy-to-clipboard', async (_event, text: string) => {
    try {
      const clipboardService = getClipboardService()
      clipboardService.copyToClipboard(text)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 镜框推荐
  ipcMain.handle('sales:recommend-frames', async (_event, profile: any, maxResults: number) => {
    try {
      const mockFrames = [
        { id: '1', name: '商务经典款', price: 1200, style: ['商务'], score: 0.9, reasons: ['适合商务场合', '经典设计'] },
        { id: '2', name: '时尚潮流款', price: 800, style: ['时尚'], score: 0.85, reasons: ['时尚设计', '价格适中'] },
        { id: '3', name: '运动休闲款', price: 600, style: ['运动'], score: 0.8, reasons: ['轻便舒适', '运动风格'] }
      ]
      return { success: true, recommendations: mockFrames.slice(0, maxResults) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 价格计算
  ipcMain.handle('sales:calculate-price', async (_event, framePrice: number, lensPrice: number, discountPercent: number) => {
    try {
      const subtotal = framePrice + lensPrice
      const discount = subtotal * (discountPercent / 100)
      const total = subtotal - discount

      const calculation = {
        framePrice,
        lensPrice,
        addonsPrice: 0,
        subtotal,
        discount,
        total,
        breakdown: [
          { item: '镜框', price: framePrice },
          { item: '镜片', price: lensPrice }
        ]
      }
      return { success: true, calculation }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 保存顾客画像
  ipcMain.handle('sales:save-customer-profile', async (_event, profile: any) => {
    try {
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取顾客画像
  ipcMain.handle('sales:get-customer-profile', async (_event, wxid: string) => {
    try {
      return { success: true, profile: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ===== 跟进提醒功能 =====
  ipcMain.handle('sales:analyze-follow-up', async (_event, wxid: string, customerName: string, messages: any[]) => {
    try {
      const followUpService = getFollowUpService()
      const reminder = await followUpService.analyzeForFollowUp(wxid, customerName, messages)
      return { success: true, reminder }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-pending-reminders', async () => {
    try {
      const followUpService = getFollowUpService()
      const reminders = followUpService.getPendingReminders()
      return { success: true, reminders }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-due-reminders', async () => {
    try {
      const followUpService = getFollowUpService()
      const reminders = followUpService.getDueReminders()
      return { success: true, reminders }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:complete-reminder', async (_event, id: string) => {
    try {
      const followUpService = getFollowUpService()
      followUpService.completeReminder(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:snooze-reminder', async (_event, id: string, hours: number) => {
    try {
      const followUpService = getFollowUpService()
      followUpService.snoozeReminder(id, hours)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ===== 话术模板功能 =====
  ipcMain.handle('sales:get-all-templates', async () => {
    try {
      const templateService = getScriptTemplateService()
      const templates = templateService.getAllTemplates()
      return { success: true, templates }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-templates-by-category', async (_event, category: string) => {
    try {
      const templateService = getScriptTemplateService()
      const templates = templateService.getTemplatesByCategory(category as any)
      return { success: true, templates }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:search-templates', async (_event, keyword: string) => {
    try {
      const templateService = getScriptTemplateService()
      const templates = templateService.searchTemplates(keyword)
      return { success: true, templates }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:use-template', async (_event, id: string) => {
    try {
      const templateService = getScriptTemplateService()
      const template = templateService.useTemplate(id)
      return { success: true, template }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:add-template', async (_event, template: any) => {
    try {
      const templateService = getScriptTemplateService()
      const newTemplate = templateService.addTemplate(template)
      return { success: true, template: newTemplate }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:toggle-favorite-template', async (_event, id: string) => {
    try {
      const templateService = getScriptTemplateService()
      const isFavorite = templateService.toggleFavorite(id)
      return { success: true, isFavorite }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ===== 报价单功能 =====
  ipcMain.handle('sales:generate-quotation', async (_event, quotationData: any) => {
    try {
      const quotationService = getQuotationService()
      const quotation = quotationService.createQuotation(
        quotationData.customerName,
        quotationData.items,
        quotationData.options
      )
      const filePath = await quotationService.generateQuotation(quotation)

      // 自动打开生成的报价单
      await shell.openPath(filePath)

      return { success: true, filePath, quotation }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
