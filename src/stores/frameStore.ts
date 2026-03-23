// 镜框状态管理
import { create } from 'zustand'
import type { Frame, FrameFilter, FrameRecommendation } from '../types/frames'

interface FrameState {
  // 镜框列表
  frames: Frame[]
  setFrames: (frames: Frame[]) => void

  // 筛选条件
  filter: FrameFilter
  setFilter: (filter: FrameFilter) => void

  // 搜索关键词
  searchQuery: string
  setSearchQuery: (query: string) => void

  // 推荐结果
  recommendations: FrameRecommendation[]
  setRecommendations: (recommendations: FrameRecommendation[]) => void

  // 选中的镜框
  selectedFrame: Frame | null
  setSelectedFrame: (frame: Frame | null) => void

  // 加载状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 错误信息
  error: string | null
  setError: (error: string | null) => void
}

export const useFrameStore = create<FrameState>((set) => ({
  frames: [],
  setFrames: (frames) => set({ frames }),

  filter: {},
  setFilter: (filter) => set({ filter }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  recommendations: [],
  setRecommendations: (recommendations) => set({ recommendations }),

  selectedFrame: null,
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error: error })
}))
