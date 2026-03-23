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
      // TODO: 调用IPC计算价格
      // const calculation = await window.electronAPI.pricing.calculate(params)
      // set({ priceCalculation: calculation })
      const subtotal = params.framePrice + params.lensPrice
      const discount = subtotal * (params.discountPercent / 100)
      const total = subtotal - discount

      set({
        priceCalculation: {
          framePrice: params.framePrice,
          lensPrice: params.lensPrice,
          addonsPrice: 0,
          subtotal,
          discount,
          total,
          breakdown: [
            { item: '镜框', price: params.framePrice },
            { item: '镜片', price: params.lensPrice }
          ]
        }
      })
    } catch (error) {
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  }
}))
