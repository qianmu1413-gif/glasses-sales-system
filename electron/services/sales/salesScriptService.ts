// 销售话术生成服务
import { getLLMService } from '../llm/llmService'
import { buildSalesScriptPrompt } from '../llm/promptTemplates'

export interface SalesScript {
  content: string
  scenario: 'greeting' | 'consultation' | 'recommendation' | 'negotiation' | 'closing' | 'afterSales'
  confidence: number
  generatedAt: Date
}

class SalesScriptService {
  async generateScript(
    profile: any,
    scenario: string,
    context: { recentMessages?: any[]; customerQuestion?: string } = {}
  ): Promise<SalesScript> {
    const llmService = getLLMService()
    
    const prompt = buildSalesScriptPrompt(profile, scenario, context)
    
    const response = await llmService.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.7 })

    return {
      content: response.content.trim(),
      scenario: scenario as any,
      confidence: 0.85,
      generatedAt: new Date()
    }
  }
}

let salesScriptServiceInstance: SalesScriptService | null = null

export function getSalesScriptService(): SalesScriptService {
  if (!salesScriptServiceInstance) {
    salesScriptServiceInstance = new SalesScriptService()
  }
  return salesScriptServiceInstance
}
