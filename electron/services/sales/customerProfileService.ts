// 顾客画像分析服务
import { getLLMService } from '../llm/llmService'
import { buildCustomerProfilePrompt } from '../llm/promptTemplates'
import type { CustomerProfile } from '../../../src/types/sales'

interface Message {
  content: string
  isSelf: boolean
  timestamp: Date
}

export class CustomerProfileService {
  /**
   * 分析顾客画像
   */
  async analyzeCustomer(wxid: string, messages: Message[]): Promise<CustomerProfile> {
    try {
      // 构建聊天历史文本
      const chatHistory = this.formatChatHistory(messages)

      // 构建Prompt
      const prompt = buildCustomerProfilePrompt(chatHistory)

      // 调用LLM
      const llmService = getLLMService()
      const response = await llmService.chat(prompt)

      // 解析JSON响应
      const profileData = this.parseProfileResponse(response.content)

      // 构建完整的CustomerProfile对象
      const profile: CustomerProfile = {
        wxid,
        name: '', // 需要从联系人信息获取
        ageRange: profileData.ageRange || '26-35',
        personality: profileData.personality || [],
        purchasePower: profileData.purchasePower || 'medium',
        preferences: {
          style: profileData.preferences?.style || [],
          priceRange: profileData.preferences?.priceRange || [0, 5000],
          brands: profileData.preferences?.brands || []
        },
        faceShape: profileData.faceShape || undefined,
        lastAnalyzedAt: new Date(),
        confidence: profileData.confidence || 0.5,
        analysisSource: profileData.analysisSource || ''
      }

      return profile
    } catch (error) {
      throw new Error(`Failed to analyze customer profile: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 增量更新顾客画像
   */
  async updateProfile(
    existingProfile: CustomerProfile,
    newMessages: Message[]
  ): Promise<CustomerProfile> {
    // 如果新消息太少，不值得重新分析
    if (newMessages.length < 5) {
      return existingProfile
    }

    // 重新分析
    const newProfile = await this.analyzeCustomer(existingProfile.wxid, newMessages)

    // 合并旧画像和新画像
    return this.mergeProfiles(existingProfile, newProfile)
  }

  /**
   * 格式化聊天历史
   */
  private formatChatHistory(messages: Message[]): string {
    return messages
      .map(msg => {
        const sender = msg.isSelf ? '销售人员' : '顾客'
        const time = msg.timestamp.toLocaleString('zh-CN')
        return `[${time}] ${sender}: ${msg.content}`
      })
      .join('\n')
  }

  /**
   * 解析LLM响应
   */
  private parseProfileResponse(content: string): any {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // 如果没有找到JSON，尝试直接解析
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse profile response:', content)
      throw new Error('Invalid JSON response from LLM')
    }
  }

  /**
   * 合并两个画像
   */
  private mergeProfiles(
    oldProfile: CustomerProfile,
    newProfile: CustomerProfile
  ): CustomerProfile {
    return {
      ...newProfile,
      name: oldProfile.name, // 保留原有名称
      personality: this.mergeArrays(oldProfile.personality, newProfile.personality),
      preferences: {
        style: this.mergeArrays(oldProfile.preferences.style, newProfile.preferences.style),
        priceRange: newProfile.preferences.priceRange, // 使用新的价格区间
        brands: this.mergeArrays(oldProfile.preferences.brands, newProfile.preferences.brands)
      },
      confidence: (oldProfile.confidence + newProfile.confidence) / 2 // 平均置信度
    }
  }

  /**
   * 合并数组，去重
   */
  private mergeArrays(arr1: string[], arr2: string[]): string[] {
    return Array.from(new Set([...arr1, ...arr2]))
  }
}

// 单例实例
let customerProfileServiceInstance: CustomerProfileService | null = null

/**
 * 获取顾客画像服务实例
 */
export function getCustomerProfileService(): CustomerProfileService {
  if (!customerProfileServiceInstance) {
    customerProfileServiceInstance = new CustomerProfileService()
  }
  return customerProfileServiceInstance
}
