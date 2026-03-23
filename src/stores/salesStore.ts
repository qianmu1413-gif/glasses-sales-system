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
      // TODO: 调用IPC分析顾客
      // const profile = await window.electronAPI.sales.analyzeCustomer(wxid)
      // set({ currentProfile: profile })
      const mockProfile: CustomerProfile = {
        wxid,
        name: '演示顾客',
        ageRange: '26-35',
        personality: ['理性', '注重品质'],
        purchasePower: 'medium',
        preferences: {
          style: ['商务', '时尚'],
          priceRange: [500, 2000],
          brands: []
        },
        lastAnalyzedAt: new Date(),
        confidence: 0.8
      }
      set({ currentProfile: mockProfile })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isAnalyzing: false })
    }
  },

  generateScript: async (wxid: string, scenario: string, context: ConversationContext | null) => {
    set({ isGeneratingScript: true, error: null })
    try {
      // TODO: 调用IPC生成话术
      // const script = await window.electronAPI.sales.generateScript(wxid, scenario, context)
      // set({ currentScript: script })
      const mockScript: SalesScript = {
        content: '您好！看您的气质，应该是从事商务工作的吧？我们这边有几款非常适合商务人士的镜框，既专业又时尚。',
        scenario: scenario as any,
        confidence: 0.85,
        generatedAt: new Date()
      }
      set({ currentScript: mockScript })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isGeneratingScript: false })
    }
  }
}))
