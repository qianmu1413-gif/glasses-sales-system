// 销售相关类型定义

export interface CustomerProfile {
  wxid: string
  name: string
  ageRange: '18-25' | '26-35' | '36-45' | '46-60' | '60+'
  personality: string[]  // ['理性', '注重品质', '价格敏感']
  purchasePower: 'low' | 'medium' | 'high'
  preferences: {
    style: string[]      // ['商务', '时尚', '运动']
    priceRange: [number, number]
    brands: string[]
  }
  faceShape?: 'round' | 'square' | 'oval' | 'heart' | 'long'
  lastAnalyzedAt: Date
  confidence: number
  analysisSource: string  // 分析依据的消息摘要
}

export interface SalesScript {
  content: string
  scenario: 'greeting' | 'consultation' | 'recommendation' | 'negotiation' | 'closing' | 'afterSales'
  confidence: number
  generatedAt: Date
}

export interface ConversationContext {
  wxid: string
  recentMessages: Array<{
    content: string
    isSelf: boolean
    timestamp: Date
  }>
  customerProfile?: CustomerProfile
}

export interface LLMConfig {
  provider: 'openai' | 'claude'
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}
