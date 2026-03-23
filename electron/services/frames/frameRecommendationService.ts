// 镜框推荐服务
import { getFrameLibraryService } from './frameLibraryService'
import type { Frame, FrameRecommendation } from '../../../src/types/frames'
import type { CustomerProfile } from '../../../src/types/sales'

export class FrameRecommendationService {
  /**
   * 推荐镜框
   */
  recommendFrames(
    customerProfile: CustomerProfile,
    maxResults: number = 5
  ): FrameRecommendation[] {
    const libraryService = getFrameLibraryService()
    const allFrames = libraryService.getAllFrames()

    // 计算每个镜框的推荐分数
    const recommendations = allFrames
      .map(frame => ({
        frame,
        score: this.calculateScore(frame, customerProfile),
        reasons: this.generateReasons(frame, customerProfile)
      }))
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    return recommendations
  }

  /**
   * 计算推荐分数
   */
  private calculateScore(frame: Frame, profile: CustomerProfile): number {
    let score = 50 // 基础分数

    // 脸型匹配 (权重: 30分)
    if (profile.faceShape && frame.suitableFaceShapes.includes(profile.faceShape)) {
      score += 30
    }

    // 风格匹配 (权重: 25分)
    const styleMatch = frame.style.filter(s => profile.preferences.style.includes(s)).length
    if (styleMatch > 0) {
      score += Math.min(25, styleMatch * 10)
    }

    // 价格区间匹配 (权重: 20分)
    const [minPrice, maxPrice] = profile.preferences.priceRange
    if (frame.price >= minPrice && frame.price <= maxPrice) {
      score += 20
    } else if (frame.price < minPrice) {
      // 价格低于预期，轻微加分
      score += 10
    } else {
      // 价格高于预期，根据消费能力决定扣分
      if (profile.purchasePower === 'high') {
        score += 5 // 高消费能力，轻微扣分
      } else {
        score -= 15 // 其他情况，较大扣分
      }
    }

    // 品牌匹配 (权重: 15分)
    if (profile.preferences.brands.includes(frame.brand)) {
      score += 15
    }

    // 库存检查 (权重: 10分)
    if (frame.stock > 0) {
      score += 10
    } else {
      score -= 20 // 无库存大幅扣分
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 生成推荐理由
   */
  private generateReasons(frame: Frame, profile: CustomerProfile): string[] {
    const reasons: string[] = []

    // 脸型匹配
    if (profile.faceShape && frame.suitableFaceShapes.includes(profile.faceShape)) {
      reasons.push(`适合${this.translateFaceShape(profile.faceShape)}`)
    }

    // 风格匹配
    const matchedStyles = frame.style.filter(s => profile.preferences.style.includes(s))
    if (matchedStyles.length > 0) {
      reasons.push(`符合您的${matchedStyles.join('、')}风格偏好`)
    }

    // 价格合适
    const [minPrice, maxPrice] = profile.preferences.priceRange
    if (frame.price >= minPrice && frame.price <= maxPrice) {
      reasons.push('价格在您的预算范围内')
    } else if (frame.price < minPrice) {
      reasons.push('性价比高')
    }

    // 品牌匹配
    if (profile.preferences.brands.includes(frame.brand)) {
      reasons.push(`您偏好的${frame.brand}品牌`)
    }

    // 材质特点
    if (frame.material.includes('钛') || frame.material.includes('纯钛')) {
      reasons.push('轻盈舒适的钛材质')
    }

    // 如果没有其他理由，添加通用理由
    if (reasons.length === 0) {
      reasons.push('经典款式，适合多种场合')
    }

    return reasons
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
let frameRecommendationServiceInstance: FrameRecommendationService | null = null

/**
 * 获取镜框推荐服务实例
 */
export function getFrameRecommendationService(): FrameRecommendationService {
  if (!frameRecommendationServiceInstance) {
    frameRecommendationServiceInstance = new FrameRecommendationService()
  }
  return frameRecommendationServiceInstance
}
