// 话术模板库服务
export interface ScriptTemplate {
  id: string
  name: string
  category: 'greeting' | 'consultation' | 'recommendation' | 'negotiation' | 'closing' | 'afterSales' | 'custom'
  content: string
  tags: string[]  // 标签：高转化、价格敏感、VIP等
  useCount: number  // 使用次数
  successRate?: number  // 成功率（可选）
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

class ScriptTemplateService {
  private templates: Map<string, ScriptTemplate> = new Map()

  constructor() {
    this.initDefaultTemplates()
  }

  // 初始化默认模板
  private initDefaultTemplates(): void {
    const defaultTemplates: Omit<ScriptTemplate, 'id' | 'useCount' | 'isFavorite' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '专业欢迎话术',
        category: 'greeting',
        content: '您好！欢迎咨询我们的眼镜产品。我是您的专属顾问，很高兴为您服务。请问您是想配近视镜、太阳镜还是其他类型的眼镜呢？',
        tags: ['专业', '热情'],
      },
      {
        name: '需求挖掘话术',
        category: 'consultation',
        content: '了解您的需求对我们推荐合适的产品很重要。请问您平时主要在什么场合佩戴眼镜？比如办公、开车、运动还是日常生活？另外，您对镜框的风格有什么偏好吗？',
        tags: ['需求挖掘', '专业'],
      },
      {
        name: '高端产品推荐',
        category: 'recommendation',
        content: '根据您的需求，我为您推荐这款{产品名}。它采用{材质}镜框，{特点1}，{特点2}。这个价位的产品在品质和设计上都有很好的保证，非常适合您这样注重品质的顾客。',
        tags: ['高端', '品质'],
      },
      {
        name: '性价比推荐',
        category: 'recommendation',
        content: '这款{产品名}性价比非常高，价格在{价格}左右，但品质完全不输更贵的产品。{特点}，很多顾客反馈都很好。您可以先看看，如果喜欢我们还有优惠活动。',
        tags: ['性价比', '价格敏感'],
      },
      {
        name: '价格异议处理',
        category: 'negotiation',
        content: '我理解您对价格的考虑。这个价格确实包含了{价值点1}、{价值点2}。而且我们现在有活动，{优惠内容}。算下来性价比是很高的。您觉得怎么样？',
        tags: ['价格异议', '价值强调'],
      },
      {
        name: '限时促销成交',
        category: 'closing',
        content: '您看中的这款确实很不错！现在下单的话，我们有{优惠活动}，这个活动{截止时间}就结束了。而且现在库存也不多了，建议您尽快下单，以免错过。',
        tags: ['促销', '紧迫感'],
      },
      {
        name: '配镜进度通知',
        category: 'afterSales',
        content: '您好！您定制的眼镜已经完成了，可以随时过来取镜。取镜时我们会为您做专业的调试和佩戴指导。请问您什么时候方便过来呢？',
        tags: ['售后', '取镜'],
      },
      {
        name: '满意度回访',
        category: 'afterSales',
        content: '您好！您的眼镜佩戴已经有一周了，想了解一下使用感受如何？如果有任何不适或需要调整的地方，随时联系我，我们提供免费调整服务。',
        tags: ['售后', '回访'],
      }
    ]

    defaultTemplates.forEach((template, index) => {
      const fullTemplate: ScriptTemplate = {
        ...template,
        id: `default_${index}`,
        useCount: 0,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.templates.set(fullTemplate.id, fullTemplate)
    })
  }

  // 获取所有模板
  getAllTemplates(): ScriptTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => {
        // 收藏的排前面
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        // 然后按使用次数排序
        return b.useCount - a.useCount
      })
  }

  // 按分类获取模板
  getTemplatesByCategory(category: ScriptTemplate['category']): ScriptTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  // 搜索模板
  searchTemplates(keyword: string): ScriptTemplate[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.getAllTemplates().filter(t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      t.content.toLowerCase().includes(lowerKeyword) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    )
  }

  // 获取收藏的模板
  getFavoriteTemplates(): ScriptTemplate[] {
    return this.getAllTemplates().filter(t => t.isFavorite)
  }

  // 使用模板（增加使用次数）
  useTemplate(id: string): ScriptTemplate | null {
    const template = this.templates.get(id)
    if (template) {
      template.useCount++
      template.updatedAt = new Date()
      return template
    }
    return null
  }

  // 添加自定义模板
  addTemplate(template: Omit<ScriptTemplate, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>): ScriptTemplate {
    const newTemplate: ScriptTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      useCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.templates.set(newTemplate.id, newTemplate)
    return newTemplate
  }

  // 更新模板
  updateTemplate(id: string, updates: Partial<Omit<ScriptTemplate, 'id' | 'createdAt'>>): ScriptTemplate | null {
    const template = this.templates.get(id)
    if (template) {
      Object.assign(template, updates, { updatedAt: new Date() })
      return template
    }
    return null
  }

  // 删除模板
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id)
  }

  // 切换收藏状态
  toggleFavorite(id: string): boolean {
    const template = this.templates.get(id)
    if (template) {
      template.isFavorite = !template.isFavorite
      template.updatedAt = new Date()
      return template.isFavorite
    }
    return false
  }

  // 记录成功率
  recordSuccess(id: string, success: boolean): void {
    const template = this.templates.get(id)
    if (template) {
      const currentRate = template.successRate || 0.5
      const currentCount = template.useCount
      // 简单的移动平均
      template.successRate = (currentRate * currentCount + (success ? 1 : 0)) / (currentCount + 1)
    }
  }
}

let scriptTemplateServiceInstance: ScriptTemplateService | null = null

export function getScriptTemplateService(): ScriptTemplateService {
  if (!scriptTemplateServiceInstance) {
    scriptTemplateServiceInstance = new ScriptTemplateService()
  }
  return scriptTemplateServiceInstance
}
