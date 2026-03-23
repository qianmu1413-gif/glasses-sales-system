// 镜框相关类型定义

export interface Frame {
  id: string
  model: string           // 型号
  brand: string           // 品牌
  name: string            // 名称
  price: number           // 价格
  category: 'full-rim' | 'half-rim' | 'rimless' | 'sunglasses'  // 类别
  material: string        // 材质
  style: string[]         // 风格标签 ['商务', '时尚', '运动', '复古']
  color: string[]         // 颜色
  size: {
    width: number         // 镜框宽度
    bridge: number        // 鼻梁宽度
    temple: number        // 镜腿长度
  }
  suitableFaceShapes: ('round' | 'square' | 'oval' | 'heart' | 'long')[]
  imagePath: string       // 图片路径
  stock: number           // 库存
  description?: string    // 描述
  tags?: string[]         // 其他标签
}

export interface FrameRecommendation {
  frame: Frame
  score: number           // 推荐分数 0-100
  reasons: string[]       // 推荐理由
}

export interface FrameFilter {
  priceRange?: [number, number]
  brands?: string[]
  styles?: string[]
  faceShapes?: string[]
  categories?: string[]
  colors?: string[]
}
