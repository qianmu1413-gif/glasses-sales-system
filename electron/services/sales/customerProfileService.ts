// 顾客画像分析服务
import { getLLMService } from '../llm/llmService'
import { buildCustomerProfilePrompt } from '../llm/promptTemplates'

export interface CustomerProfile {
  wxid: string
  name: string
  ageRange: '18-25' | '26-35' | '36-45' | '46-60' | '60+'
  personality: string[]
  purchasePower: 'low' | 'medium' | 'high'
  preferences: {
    style: string[]
    priceRange: [number, number]
    brands: string[]
  }
  faceShape?: 'round' | 'square' | 'oval' | 'heart' | 'long'
  lastAnalyzedAt: Date
  confidence: number
  analysisSource: string
}

class CustomerProfileService {
  async analyzeCustomer(wxid: string, messages: Array<{ sender: string; content: string; time: Date }>): Promise<CustomerProfile> {
    const llmService = getLLMService()
    
    const prompt = buildCustomerProfilePrompt(messages)
    
    const response = await llmService.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.3 })

    // 解析JSON响应
    let analysisResult
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法从响应中提取JSON')
      }
    } catch (error) {
      console.error('解析LLM响应失败:', error)
      throw new Error('分析结果格式错误')
    }

    return {
      wxid,
      name: analysisResult.name || '未知',
      ageRange: analysisResult.ageRange || '26-35',
      personality: analysisResult.personality || [],
      purchasePower: analysisResult.purchasePower || 'medium',
      preferences: analysisResult.preferences || { style: [], priceRange: [0, 5000], brands: [] },
      faceShape: analysisResult.faceShape,
      lastAnalyzedAt: new Date(),
      confidence: analysisResult.confidence || 0.5,
      analysisSource: `基于${messages.length}条对话分析`
    }
  }
}

let customerProfileServiceInstance: CustomerProfileService | null = null

export function getCustomerProfileService(): CustomerProfileService {
  if (!customerProfileServiceInstance) {
    customerProfileServiceInstance = new CustomerProfileService()
  }
  return customerProfileServiceInstance
}
