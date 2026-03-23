// 销售状态管理
import { create } from 'zustand'
import type { CustomerProfile, SalesScript, ConversationContext } from '../types/sales'

interface SalesState {
  // 当前选中的顾客
  selectedCustomer: CustomerProfile | null
  setSelectedCustomer: (customer: CustomerProfile | null) => void

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
}

export const useSalesStore = create<SalesState>((set) => ({
  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

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
  setError: (error) => set({ error: error })
}))
