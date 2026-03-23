// 订单状态管理
import { create } from 'zustand'
import type { Order, LensOption, PriceCalculation } from '../types/orders'

interface OrderState {
  // 订单列表
  orders: Order[]
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, order: Order) => void

  // 当前订单
  currentOrder: Partial<Order> | null
  setCurrentOrder: (order: Partial<Order> | null) => void

  // 价格计算
  priceCalculation: PriceCalculation | null
  setPriceCalculation: (calculation: PriceCalculation | null) => void

  // 镜片选项
  selectedLensOption: LensOption | null
  setSelectedLensOption: (option: LensOption | null) => void

  // 加载状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 错误信息
  error: string | null
  setError: (error: string | null) => void

  // 方法
  loadOrders: () => Promise<void>
  calculatePrice: (params: { framePrice: number; lensPrice: number; discountPercent: number }) => Promise<void>
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order]
    })),
  updateOrder: (id, order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? order : o))
    })),

  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),

  priceCalculation: null,
  setPriceCalculation: (calculation) => set({ priceCalculation: calculation }),

  selectedLensOption: null,
  setSelectedLensOption: (option) => set({ selectedLensOption: option }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error: error }),

  loadOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: 调用IPC获取订单列表
      // const orders = await window.electronAPI.orders.getAll()
      // set({ orders })
      set({ orders: [] })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  calculatePrice: async (params: { framePrice: number; lensPrice: number; discountPercent: number }) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.sales.calculatePrice(
        params.framePrice,
        params.lensPrice,
        params.discountPercent
      )

      if (result.success && result.calculation) {
        set({ priceCalculation: result.calculation })
      } else {
        throw new Error(result.error || '计算失败')
      }
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  }
}))
