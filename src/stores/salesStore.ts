// 销售状态管理
import { create } from 'zustand'
import type { CustomerProfile, SalesScript, ConversationContext } from '../types/sales'

interface SalesState {
  // 当前选中的顾客
  selectedCustomer: CustomerProfile | null
  setSelectedCustomer: (customer: CustomerProfile | null) => void

  // 当前画像（用于页面显示）
  currentProfile: CustomerProfile | null
  setCurrentProfile: (profile: CustomerProfile | null) => void

  // 顾客画像列表
  customerProfiles: CustomerProfile[]
  setCustomerProfiles: (profiles: CustomerProfile[]) => void
  addCustomerProfile: (profile: CustomerProfile) => void
  updateCustomerProfile: (wxid: string, profile: CustomerProfile) => void

  // 生成的话术
  currentScript: SalesScript | null
  setCurrentScript: (script: SalesScript | null) => void

  // 对话上下文
  conversationContext: ConversationContext | null
  setConversationContext: (context: ConversationContext | null) => void

  // 加载状态
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  isGeneratingScript: boolean
  setIsGeneratingScript: (generating: boolean) => void

  // 错误信息
  error: string | null
  setError: (error: string | null) => void

  // 方法
  analyzeCustomer: (wxid: string) => Promise<void>
  generateScript: (wxid: string, scenario: string, context: ConversationContext | null) => Promise<void>
}

export const useSalesStore = create<SalesState>((set) => ({
  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  currentProfile: null,
  setCurrentProfile: (profile) => set({ currentProfile: profile }),

  customerProfiles: [],
  setCustomerProfiles: (profiles) => set({ customerProfiles: profiles }),
  addCustomerProfile: (profile) =>
    set((state) => ({
      customerProfiles: [...state.customerProfiles, profile]
    })),
  updateCustomerProfile: (wxid, profile) =>
    set((state) => ({
      customerProfiles: state.customerProfiles.map((p) =>
        p.wxid === wxid ? profile : p
      )
    })),

  currentScript: null,
  setCurrentScript: (script) => set({ currentScript: script }),

  conversationContext: null,
  setConversationContext: (context) => set({ conversationContext: context }),

  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  isGeneratingScript: false,
  setIsGeneratingScript: (generating) => set({ isGeneratingScript: generating }),

  error: null,
  setError: (error) => set({ error: error }),

  analyzeCustomer: async (wxid: string) => {
    set({ isAnalyzing: true, error: null })
    try {
      // 获取聊天记录（这里使用mock数据，实际应该从微信数据库读取）
      const mockMessages = [
        { sender: '顾客', content: '你好，我想配一副眼镜', time: new Date() },
        { sender: '销售', content: '您好！请问您平时主要用于什么场合呢？', time: new Date() },
        { sender: '顾客', content: '主要是上班用，我在公司做管理工作', time: new Date() },
        { sender: '顾客', content: '预算在1000-2000左右吧', time: new Date() }
      ]

      const result = await window.electronAPI.sales.analyzeCustomer(wxid, mockMessages)
      if (result.success && result.profile) {
        set({ currentProfile: result.profile })
      } else {
        throw new Error(result.error || '分析失败')
      }
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isAnalyzing: false })
    }
  },

  generateScript: async (wxid: string, scenario: string, context: ConversationContext | null) => {
    set({ isGeneratingScript: true, error: null })
    try {
      const profile = useSalesStore.getState().currentProfile
      if (!profile) {
        throw new Error('请先分析顾客画像')
      }

      const result = await window.electronAPI.sales.generateScript(profile, scenario, context || {})
      if (result.success && result.script) {
        set({ currentScript: result.script })
      } else {
        throw new Error(result.error || '生成话术失败')
      }
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isGeneratingScript: false })
    }
  }
}))
