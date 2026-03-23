// 镜框库管理服务
import * as fs from 'fs'
import * as path from 'path'
import type { Frame, FrameFilter } from '../../../src/types/frames'

export class FrameLibraryService {
  private frames: Frame[] = []
  private libraryPath: string = ''

  /**
   * 初始化镜框库
   */
  async initialize(libraryPath: string): Promise<void> {
    this.libraryPath = libraryPath
    await this.loadFrames()
  }

  /**
   * 加载镜框数据
   */
  private async loadFrames(): Promise<void> {
    try {
      const dataPath = path.join(this.libraryPath, 'frames.json')
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf-8')
        this.frames = JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to load frames:', error)
      this.frames = []
    }
  }

  /**
   * 保存镜框数据
   */
  private async saveFrames(): Promise<void> {
    try {
      const dataPath = path.join(this.libraryPath, 'frames.json')
      fs.writeFileSync(dataPath, JSON.stringify(this.frames, null, 2), 'utf-8')
    } catch (error) {
      throw new Error(`Failed to save frames: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取所有镜框
   */
  getAllFrames(): Frame[] {
    return [...this.frames]
  }

  /**
   * 根据ID获取镜框
   */
  getFrameById(id: string): Frame | undefined {
    return this.frames.find(f => f.id === id)
  }

  /**
   * 搜索镜框
   */
  searchFrames(query: string): Frame[] {
    const lowerQuery = query.toLowerCase()
    return this.frames.filter(frame =>
      frame.name.toLowerCase().includes(lowerQuery) ||
      frame.model.toLowerCase().includes(lowerQuery) ||
      frame.brand.toLowerCase().includes(lowerQuery) ||
      frame.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * 筛选镜框
   */
  filterFrames(filter: FrameFilter): Frame[] {
    return this.frames.filter(frame => {
      // 价格区间
      if (filter.priceRange) {
        const [min, max] = filter.priceRange
        if (frame.price < min || frame.price > max) return false
      }

      // 品牌
      if (filter.brands && filter.brands.length > 0) {
        if (!filter.brands.includes(frame.brand)) return false
      }

      // 风格
      if (filter.styles && filter.styles.length > 0) {
        if (!frame.style.some(s => filter.styles!.includes(s))) return false
      }

      // 脸型
      if (filter.faceShapes && filter.faceShapes.length > 0) {
        if (!frame.suitableFaceShapes.some(s => filter.faceShapes!.includes(s))) return false
      }

      // 类别
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(frame.category)) return false
      }

      // 颜色
      if (filter.colors && filter.colors.length > 0) {
        if (!frame.color.some(c => filter.colors!.includes(c))) return false
      }

      return true
    })
  }

  /**
   * 添加镜框
   */
  async addFrame(frame: Frame): Promise<void> {
    this.frames.push(frame)
    await this.saveFrames()
  }

  /**
   * 更新镜框
   */
  async updateFrame(id: string, updates: Partial<Frame>): Promise<void> {
    const index = this.frames.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error(`Frame not found: ${id}`)
    }

    this.frames[index] = { ...this.frames[index], ...updates }
    await this.saveFrames()
  }

  /**
   * 删除镜框
   */
  async deleteFrame(id: string): Promise<void> {
    this.frames = this.frames.filter(f => f.id !== id)
    await this.saveFrames()
  }

  /**
   * 批量导入镜框
   */
  async importFrames(frames: Frame[]): Promise<void> {
    this.frames.push(...frames)
    await this.saveFrames()
  }

  /**
   * 获取所有品牌
   */
  getAllBrands(): string[] {
    const brands = new Set(this.frames.map(f => f.brand))
    return Array.from(brands).sort()
  }

  /**
   * 获取所有风格
   */
  getAllStyles(): string[] {
    const styles = new Set(this.frames.flatMap(f => f.style))
    return Array.from(styles).sort()
  }

  /**
   * 获取价格范围
   */
  getPriceRange(): [number, number] {
    if (this.frames.length === 0) return [0, 0]
    const prices = this.frames.map(f => f.price)
    return [Math.min(...prices), Math.max(...prices)]
  }

  /**
   * 获取库存统计
   */
  getStockStats(): { total: number; inStock: number; lowStock: number; outOfStock: number } {
    return {
      total: this.frames.length,
      inStock: this.frames.filter(f => f.stock > 10).length,
      lowStock: this.frames.filter(f => f.stock > 0 && f.stock <= 10).length,
      outOfStock: this.frames.filter(f => f.stock === 0).length
    }
  }
}

// 单例实例
let frameLibraryServiceInstance: FrameLibraryService | null = null

/**
 * 获取镜框库服务实例
 */
export function getFrameLibraryService(): FrameLibraryService {
  if (!frameLibraryServiceInstance) {
    frameLibraryServiceInstance = new FrameLibraryService()
  }
  return frameLibraryServiceInstance
}
