// 订单相关类型定义

export interface LensOption {
  type: 'single' | 'progressive' | 'blue-light' | 'photochromic'
  brand: string
  basePrice: number
  addons: {
    antiReflective?: number      // 防反光
    scratchResistant?: number    // 防刮
    uvProtection?: number         // 防紫外线
    thinning?: number             // 超薄
  }
}

export interface PriceCalculation {
  framePrice: number
  lensPrice: number
  addonsPrice: number
  subtotal: number
  discount: number
  discountReason?: string
  total: number
  breakdown: Array<{
    item: string
    price: number
  }>
}

export interface Order {
  id: string
  wxid: string
  customerName: string
  frameId: string
  frameName: string
  lensOption: LensOption
  pricing: PriceCalculation
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
  prescription?: {
    rightEye: {
      sphere: number      // 球镜度数
      cylinder?: number   // 柱镜度数
      axis?: number       // 轴位
      add?: number        // 下加光
    }
    leftEye: {
      sphere: number
      cylinder?: number
      axis?: number
      add?: number
    }
    pd: number            // 瞳距
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface DiscountRule {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'bundle'
  value: number
  conditions?: {
    minAmount?: number
    brands?: string[]
    categories?: string[]
    validFrom?: Date
    validTo?: Date
  }
  priority: number
}
