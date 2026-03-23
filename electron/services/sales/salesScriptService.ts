// 销售话术生成服务
import { getLLMService } from '../llm/llmService'
import { buildSalesScriptPrompt } from '../llm/promptTemplates'
import type { CustomerProfile, SalesScript, ConversationContext } from '../../../src/types/sales'

export class SalesScriptService {
  /**
   * 生成销售话术
   */
  async generateScript(
    context: ConversationContext,
    scenario: 'greeting' | 'consultation' | 'recommendation' | 'negotiation' | 'closing' | 'afterSales'
  ): Promise<SalesScript> {
    try {
      // 构建顾客画像文本
      const profileText = context.customerProfile
        ? this.formatCustomerProfile(context.customerProfile)
        : '暂无顾客画像信息'

      // 构建最近对话文本
      const messagesText = this.formatRecentMessages(context.recentMessages)

      // 构建Prompt
      const prompt = buildSalesScriptPrompt(profileText, messagesText, scenario)

      // 调用LLM
      const llmService = getLLMService()
      const response = await llmService.chat(prompt)

      // 构建SalesScript对象
      const script: SalesScript = {
        content: response.content.trim(),
        scenario,
        confidence: 0.8, // 默认置信度
        generatedAt: new Date()
      }

      return script
    } catch (error) {
      throw new Error(`Failed to generate sales script: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 流式生成销售话术
   */
  async generateScriptStream(
    context: ConversationContext,
    scenario: 'greeting' | 'consultation' | 'recommendation' | 'negotiation' | 'closing' | 'afterSales',
    onChunk: (chunk: string) => void
  ): Promise<SalesScript> {
    try {
      const profileText = context.customerProfile
        ? this.formatCustomerProfile(context.customerProfile)
        : '暂无顾客画像信息'

      const messagesText = this.formatRecentMessages(context.recentMessages)
      const prompt = buildSalesScriptPrompt(profileText, messagesText, scenario)

      const llmService = getLLMService()
      const response = await llmService.chatStream(prompt, onChunk)

      const script: SalesScript = {
        content: response.content.trim(),
        scenario,
        confidence: 0.8,
        generatedAt: new Date()
      }

      return script
    } catch (error) {
      throw new Error(`Failed to generate sales script: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 根据产品推荐生成话术
   */
  async generateRecommendationScript(
    context: ConversationContext,
    frameNames: string[],
    reasons: string[]
  ): Promise<SalesScript> {
    // 扩展上下文，添加推荐信息
    const extendedContext: ConversationContext = {
      ...context,
      recentMessages: [
        ...context.recentMessages,
        {
          content: `系统推荐了以下镜框：${frameNames.join('、')}。推荐理由：${reasons.join('；')}`,
          isSelf: true,
          timestamp: new Date()
        }
      ]
    }

    return this.generateScript(extendedContext, 'recommendation')
  }

  /**
   * 格式化顾客画像
   */
  private formatCustomerProfile(profile: CustomerProfile): string {
    const parts = [
      `年龄段：${this.translateAgeRange(profile.ageRange)}`,
      `性格特征：${profile.personality.join('、') || '未知'}`,
      `消费能力：${this.translatePurchasePower(profile.purchasePower)}`,
      `风格偏好：${profile.preferences.style.join('、') || '未知'}`,
      `价格区间：${profile.preferences.priceRange[0]}-${profile.preferences.priceRange[1]}元`
    ]

    if (profile.faceShape) {
      parts.push(`脸型：${this.translateFaceShape(profile.faceShape)}`)
    }

    if (profile.preferences.brands.length > 0) {
      parts.push(`偏好品牌：${profile.preferences.brands.join('、')}`)
    }

    return parts.join('\n')
  }

  /**
   * 格式化最近对话
   */
  private formatRecentMessages(messages: Array<{ content: string; isSelf: boolean; timestamp: Date }>): string {
    return messages
      .slice(-10) // 只取最近10条
      .map(msg => {
        const sender = msg.isSelf ? '销售人员' : '顾客'
        return `${sender}: ${msg.content}`
      })
      .join('\n')
  }

  /**
   * 翻译年龄段
   */
  private translateAgeRange(range: string): string {
    const map: Record<string, string> = {
      '18-25': '18-25岁（年轻群体）',
      '26-35': '26-35岁（青年）',
      '36-45': '36-45岁（中年）',
      '46-60': '46-60岁（中老年）',
      '60+': '60岁以上（老年）'
    }
    return map[range] || range
  }

  /**
   * 翻译消费能力
   */
  private translatePurchasePower(power: string): string {
    const map: Record<string, string> = {
      'low': '较低（注重性价比）',
      'medium': '中等（品质与价格平衡）',
      'high': '较高（注重品质）'
    }
    return map[power] || power
  }

  /**
   * 翻译脸型
   */
  private translateFaceShape(shape: string): string {
    const map: Record<string, string> = {
      'round': '圆脸',
      'square': '方脸',
      'oval': '椭圆脸',
      'heart': '心形脸',
      'long': '长脸'
    }
    return map[shape] || shape
  }
}

// 单例实例
let salesScriptServiceInstance: SalesScriptService | null = null

/**
 * 获取销售话术服务实例
 */
export function getSalesScriptService(): SalesScriptService {
  if (!salesScriptServiceInstance) {
    salesScriptServiceInstance = new SalesScriptService()
  }
  return salesScriptServiceInstance
}
