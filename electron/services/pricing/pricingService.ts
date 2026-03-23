// 价格计算服务
import type { Frame } from '../../../src/types/frames'
import type { LensOption, PriceCalculation, DiscountRule } from '../../../src/types/orders'

export class PricingService {
  private discountRules: DiscountRule[] = []

  /**
   * 计算总价
   */
  calculatePrice(
    frame: Frame,
    lensOption: LensOption,
    discountCode?: string
  ): PriceCalculation {
    // 镜框价格
    const framePrice = frame.price

    // 镜片基础价格
    const lensPrice = lensOption.basePrice

    // 附加项价格
    const addonsPrice = this.calculateAddonsPrice(lensOption.addons)

    // 小计
    const subtotal = framePrice + lensPrice + addonsPrice

    // 折扣
    const { discount, discountReason } = this.calculateDiscount(
      subtotal,
      frame,
      lensOption,
      discountCode
    )

    // 总价
    const total = Math.max(0, subtotal - discount)

    // 明细
    const breakdown = [
      { item: `镜框 - ${frame.name}`, price: framePrice },
      { item: `镜片 - ${this.getLensTypeName(lensOption.type)} (${lensOption.brand})`, price: lensPrice }
    ]

    // 添加附加项
    if (lensOption.addons.antiReflective) {
      breakdown.push({ item: '防反光镀膜', price: lensOption.addons.antiReflective })
    }
    if (lensOption.addons.scratchResistant) {
      breakdown.push({ item: '防刮涂层', price: lensOption.addons.scratchResistant })
    }
    if (lensOption.addons.uvProtection) {
      breakdown.push({ item: '防紫外线', price: lensOption.addons.uvProtection })
    }
    if (lensOption.addons.thinning) {
      breakdown.push({ item: '超薄处理', price: lensOption.addons.thinning })
    }

    if (discount > 0) {
      breakdown.push({ item: `折扣 - ${discountReason}`, price: -discount })
    }

    return {
      framePrice,
      lensPrice,
      addonsPrice,
      subtotal,
      discount,
      discountReason,
      total,
      breakdown
    }
  }

  /**
   * 计算附加项价格
   */
  private calculateAddonsPrice(addons: LensOption['addons']): number {
    let total = 0
    if (addons.antiReflective) total += addons.antiReflective
    if (addons.scratchResistant) total += addons.scratchResistant
    if (addons.uvProtection) total += addons.uvProtection
    if (addons.thinning) total += addons.thinning
    return total
  }

  /**
   * 计算折扣
   */
  private calculateDiscount(
    subtotal: number,
    frame: Frame,
    lensOption: LensOption,
    discountCode?: string
  ): { discount: number; discountReason?: string } {
    let maxDiscount = 0
    let discountReason = ''

    // 应用折扣规则
    for (const rule of this.discountRules) {
      if (!this.isRuleApplicable(rule, subtotal, frame, lensOption)) {
        continue
      }

      let discount = 0
      if (rule.type === 'percentage') {
        discount = subtotal * (rule.value / 100)
      } else if (rule.type === 'fixed') {
        discount = rule.value
      }

      if (discount > maxDiscount) {
        maxDiscount = discount
        discountReason = rule.name
      }
    }

    // 应用折扣码
    if (discountCode) {
      const codeDiscount = this.applyDiscountCode(discountCode, subtotal)
      if (codeDiscount.discount > maxDiscount) {
        maxDiscount = codeDiscount.discount
        discountReason = codeDiscount.reason
      }
    }

    return { discount: maxDiscount, discountReason }
  }

  /**
   * 检查折扣规则是否适用
   */
  private isRuleApplicable(
    rule: DiscountRule,
    subtotal: number,
    frame: Frame,
    lensOption: LensOption
  ): boolean {
    if (!rule.conditions) return true

    // 检查最低金额
    if (rule.conditions.minAmount && subtotal < rule.conditions.minAmount) {
      return false
    }

    // 检查品牌
    if (rule.conditions.brands && rule.conditions.brands.length > 0) {
      if (!rule.conditions.brands.includes(frame.brand)) {
        return false
      }
    }

    // 检查有效期
    const now = new Date()
    if (rule.conditions.validFrom && now < rule.conditions.validFrom) {
      return false
    }
    if (rule.conditions.validTo && now > rule.conditions.validTo) {
      return false
    }

    return true
  }

  /**
   * 应用折扣码
   */
  private applyDiscountCode(
    code: string,
    subtotal: number
  ): { discount: number; reason: string } {
    // 这里可以从数据库或配置中查询折扣码
    // 示例实现
    const discountCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
      'WELCOME10': { type: 'percentage', value: 10 },
      'SAVE50': { type: 'fixed', value: 50 },
      'VIP20': { type: 'percentage', value: 20 }
    }

    const codeInfo = discountCodes[code.toUpperCase()]
    if (!codeInfo) {
      return { discount: 0, reason: '' }
    }

    let discount = 0
    if (codeInfo.type === 'percentage') {
      discount = subtotal * (codeInfo.value / 100)
    } else {
      discount = codeInfo.value
    }

    return { discount, reason: `优惠码 ${code}` }
  }

  /**
   * 添加折扣规则
   */
  addDiscountRule(rule: DiscountRule): void {
    this.discountRules.push(rule)
    this.discountRules.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 移除折扣规则
   */
  removeDiscountRule(ruleId: string): void {
    this.discountRules = this.discountRules.filter(r => r.id !== ruleId)
  }

  /**
   * 获取所有折扣规则
   */
  getDiscountRules(): DiscountRule[] {
    return [...this.discountRules]
  }

  /**
   * 获取镜片类型名称
   */
  private getLensTypeName(type: LensOption['type']): string {
    const names: Record<LensOption['type'], string> = {
      'single': '单光镜片',
      'progressive': '渐进多焦点镜片',
      'blue-light': '防蓝光镜片',
      'photochromic': '变色镜片'
    }
    return names[type]
  }

  /**
   * 获取预设镜片选项
   */
  getPresetLensOptions(): LensOption[] {
    return [
      {
        type: 'single',
        brand: '依视路',
        basePrice: 300,
        addons: {}
      },
      {
        type: 'single',
        brand: '蔡司',
        basePrice: 500,
        addons: {}
      },
      {
        type: 'progressive',
        brand: '依视路',
        basePrice: 800,
        addons: {}
      },
      {
        type: 'progressive',
        brand: '蔡司',
        basePrice: 1200,
        addons: {}
      },
      {
        type: 'blue-light',
        brand: '依视路',
        basePrice: 400,
        addons: {}
      },
      {
        type: 'photochromic',
        brand: '全视线',
        basePrice: 600,
        addons: {}
      }
    ]
  }
}

// 单例实例
let pricingServiceInstance: PricingService | null = null

/**
 * 获取价格计算服务实例
 */
export function getPricingService(): PricingService {
  if (!pricingServiceInstance) {
    pricingServiceInstance = new PricingService()

    // 添加默认折扣规则
    pricingServiceInstance.addDiscountRule({
      id: 'vip-discount',
      name: 'VIP会员9折',
      type: 'percentage',
      value: 10,
      conditions: {
        minAmount: 500
      },
      priority: 1
    })
  }
  return pricingServiceInstance
}
