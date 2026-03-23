// 智能跟进提醒服务
import { getLLMService } from '../llm/llmService'

export interface FollowUpReminder {
  id: string
  wxid: string
  customerName: string
  reason: string  // 跟进原因：犹豫、考虑中、价格异议等
  suggestedTime: Date  // 建议跟进时间
  suggestedScript: string  // 建议话术
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
}

// 犹豫信号关键词
const HESITATION_KEYWORDS = [
  '考虑一下', '再看看', '回去商量', '想想', '犹豫',
  '不确定', '再说吧', '过两天', '等等', '再比较',
  '太贵', '预算', '便宜点', '打折', '优惠'
]

class FollowUpService {
  private reminders: Map<string, FollowUpReminder> = new Map()

  // 分析对话，检测是否需要跟进
  async analyzeForFollowUp(wxid: string, customerName: string, recentMessages: Array<{ sender: string; content: string; time: Date }>): Promise<FollowUpReminder | null> {
    // 检查最近消息是否包含犹豫信号
    const lastCustomerMessage = recentMessages.filter(m => m.sender === '顾客').slice(-1)[0]
    if (!lastCustomerMessage) return null

    const hasHesitation = HESITATION_KEYWORDS.some(keyword => 
      lastCustomerMessage.content.includes(keyword)
    )

    if (!hasHesitation) return null

    // 使用LLM分析具体原因和建议
    const llmService = getLLMService()
    const prompt = `分析以下对话，顾客表现出犹豫。请判断：
1. 犹豫的主要原因（价格、款式、质量、其他）
2. 建议的跟进时间（几小时后或几天后）
3. 建议的跟进话术

最近对话：
${recentMessages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n')}

请以JSON格式返回：
{
  "reason": "犹豫原因",
  "hoursLater": 24,
  "script": "建议话术",
  "priority": "high/medium/low"
}`

    try {
      const response = await llmService.chat([
        { role: 'user', content: prompt }
      ], { temperature: 0.3 })

      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      const analysis = JSON.parse(jsonMatch[0])

      const reminder: FollowUpReminder = {
        id: `${wxid}_${Date.now()}`,
        wxid,
        customerName,
        reason: analysis.reason,
        suggestedTime: new Date(Date.now() + analysis.hoursLater * 3600000),
        suggestedScript: analysis.script,
        priority: analysis.priority,
        status: 'pending',
        createdAt: new Date()
      }

      this.reminders.set(reminder.id, reminder)
      return reminder
    } catch (error) {
      console.error('分析跟进失败:', error)
      return null
    }
  }

  // 获取所有待跟进提醒
  getPendingReminders(): FollowUpReminder[] {
    return Array.from(this.reminders.values())
      .filter(r => r.status === 'pending')
      .sort((a, b) => a.suggestedTime.getTime() - b.suggestedTime.getTime())
  }

  // 获取需要立即跟进的提醒（时间已到）
  getDueReminders(): FollowUpReminder[] {
    const now = Date.now()
    return this.getPendingReminders()
      .filter(r => r.suggestedTime.getTime() <= now)
  }

  // 完成跟进
  completeReminder(id: string): void {
    const reminder = this.reminders.get(id)
    if (reminder) {
      reminder.status = 'completed'
    }
  }

  // 取消跟进
  cancelReminder(id: string): void {
    const reminder = this.reminders.get(id)
    if (reminder) {
      reminder.status = 'cancelled'
    }
  }

  // 延后跟进
  snoozeReminder(id: string, hours: number): void {
    const reminder = this.reminders.get(id)
    if (reminder) {
      reminder.suggestedTime = new Date(Date.now() + hours * 3600000)
    }
  }
}

let followUpServiceInstance: FollowUpService | null = null

export function getFollowUpService(): FollowUpService {
  if (!followUpServiceInstance) {
    followUpServiceInstance = new FollowUpService()
  }
  return followUpServiceInstance
}
