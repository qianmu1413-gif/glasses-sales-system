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
import { getCustomerDatabaseService } from './database/customerDatabaseService'
import { getOrderService } from './database/orderService'
import { getFrameLibraryService } from './frames/frameLibraryService'
import { getFrameRecommendationService } from './frames/frameRecommendationService'
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
      const recommendationService = getFrameRecommendationService()
      const recommendations = recommendationService.recommendFrames(profile, maxResults || 5)
      return { success: true, recommendations }
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
      const dbService = getCustomerDatabaseService()
      const success = dbService.saveProfile(profile)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取顾客画像
  ipcMain.handle('sales:get-customer-profile', async (_event, wxid: string) => {
    try {
      const dbService = getCustomerDatabaseService()
      const profile = dbService.getProfile(wxid)
      return { success: true, profile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取所有顾客画像
  ipcMain.handle('sales:get-all-customer-profiles', async () => {
    try {
      const dbService = getCustomerDatabaseService()
      const profiles = dbService.getAllProfiles()
      return { success: true, profiles }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 搜索顾客
  ipcMain.handle('sales:search-customers', async (_event, keyword: string) => {
    try {
      const dbService = getCustomerDatabaseService()
      const profiles = dbService.searchProfiles(keyword)
      return { success: true, profiles }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 添加顾客备注
  ipcMain.handle('sales:add-customer-note', async (_event, wxid: string, content: string) => {
    try {
      const dbService = getCustomerDatabaseService()
      const success = dbService.addNote(wxid, content)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取顾客备注
  ipcMain.handle('sales:get-customer-notes', async (_event, wxid: string) => {
    try {
      const dbService = getCustomerDatabaseService()
      const notes = dbService.getNotes(wxid)
      return { success: true, notes }
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

  // ===== 订单管理功能 =====
  ipcMain.handle('sales:create-order', async (_event, orderData: any) => {
    try {
      const orderService = getOrderService()
      const orderId = orderService.createOrder(orderData)
      return { success: true, orderId }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-order', async (_event, orderId: string) => {
    try {
      const orderService = getOrderService()
      const order = orderService.getOrder(orderId)
      return { success: true, order }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-all-orders', async (_event, limit?: number, offset?: number) => {
    try {
      const orderService = getOrderService()
      const orders = orderService.getAllOrders(limit, offset)
      return { success: true, orders }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-orders-by-customer', async (_event, wxid: string) => {
    try {
      const orderService = getOrderService()
      const orders = orderService.getOrdersByCustomer(wxid)
      return { success: true, orders }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:update-order-status', async (_event, orderId: string, status: string) => {
    try {
      const orderService = getOrderService()
      const success = orderService.updateOrderStatus(orderId, status)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:update-order', async (_event, orderId: string, updates: any) => {
    try {
      const orderService = getOrderService()
      const success = orderService.updateOrder(orderId, updates)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:delete-order', async (_event, orderId: string) => {
    try {
      const orderService = getOrderService()
      const success = orderService.deleteOrder(orderId)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('sales:get-order-stats', async () => {
    try {
      const orderService = getOrderService()
      const stats = orderService.getOrderStats()
      return { success: true, stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ===== 镜框库管理功能 =====
  ipcMain.handle('frames:get-all', async () => {
    try {
      const frameLibrary = getFrameLibraryService()
      const frames = frameLibrary.getAllFrames()
      return { success: true, frames }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:get-by-id', async (_event, id: string) => {
    try {
      const frameLibrary = getFrameLibraryService()
      const frame = frameLibrary.getFrameById(id)
      return { success: true, frame }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:search', async (_event, query: string) => {
    try {
      const frameLibrary = getFrameLibraryService()
      const frames = frameLibrary.searchFrames(query)
      return { success: true, frames }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:filter', async (_event, filter: any) => {
    try {
      const frameLibrary = getFrameLibraryService()
      const frames = frameLibrary.filterFrames(filter)
      return { success: true, frames }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:add', async (_event, frame: any) => {
    try {
      const frameLibrary = getFrameLibraryService()
      await frameLibrary.addFrame(frame)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:update', async (_event, id: string, updates: any) => {
    try {
      const frameLibrary = getFrameLibraryService()
      await frameLibrary.updateFrame(id, updates)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:delete', async (_event, id: string) => {
    try {
      const frameLibrary = getFrameLibraryService()
      await frameLibrary.deleteFrame(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:get-brands', async () => {
    try {
      const frameLibrary = getFrameLibraryService()
      const brands = frameLibrary.getAllBrands()
      return { success: true, brands }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:get-styles', async () => {
    try {
      const frameLibrary = getFrameLibraryService()
      const styles = frameLibrary.getAllStyles()
      return { success: true, styles }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:get-price-range', async () => {
    try {
      const frameLibrary = getFrameLibraryService()
      const priceRange = frameLibrary.getPriceRange()
      return { success: true, priceRange }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('frames:get-stock-stats', async () => {
    try {
      const frameLibrary = getFrameLibraryService()
      const stats = frameLibrary.getStockStats()
      return { success: true, stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
