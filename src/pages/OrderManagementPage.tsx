import React, { useEffect, useState } from 'react'
import { useOrderStore } from '../stores/orderStore'
import { Calculator, ShoppingCart, Package, CheckCircle } from 'lucide-react'
import type { Order, LensOption } from '../types/orders'

const OrderManagementPage: React.FC = () => {
  const { orders, currentOrder, priceCalculation, calculatePrice, loadOrders } = useOrderStore()
  const [showCalculator, setShowCalculator] = useState(false)

  // 价格计算器状态
  const [framePrice, setFramePrice] = useState(0)
  const [selectedLens, setSelectedLens] = useState<LensOption | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)

  useEffect(() => {
    loadOrders()
  }, [])

  const handleCalculate = async () => {
    if (!selectedLens) return

    await calculatePrice({
      framePrice,
      lensPrice: selectedLens.basePrice,
      discountPercent
    })
  }

  const lensOptions: LensOption[] = [
    {
      type: 'single',
      brand: '依视路',
      basePrice: 500,
      addons: { antiReflective: 100, scratchResistant: 50, uvProtection: 80 }
    },
    {
      type: 'progressive',
      brand: '蔡司',
      basePrice: 1200,
      addons: { antiReflective: 150, scratchResistant: 80, uvProtection: 100 }
    },
    {
      type: 'blue-light',
      brand: '明月',
      basePrice: 600,
      addons: { antiReflective: 100, scratchResistant: 50, uvProtection: 80 }
    },
    {
      type: 'photochromic',
      brand: '全视线',
      basePrice: 800,
      addons: { antiReflective: 120, scratchResistant: 60, uvProtection: 90 }
    }
  ]

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      processing: '配镜中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部操作栏 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {showCalculator ? '关闭计算器' : '价格计算器'}
          </button>
        </div>

        {/* 价格计算器 */}
        {showCalculator && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">价格计算器</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左侧：输入 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    镜框价格
                  </label>
                  <input
                    type="number"
                    value={framePrice}
                    onChange={(e) => setFramePrice(Number(e.target.value))}
                    placeholder="输入镜框价格"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    镜片类型
                  </label>
                  <select
                    value={selectedLens?.type || ''}
                    onChange={(e) => {
                      const lens = lensOptions.find(l => l.type === e.target.value)
                      setSelectedLens(lens || null)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择镜片类型</option>
                    <option value="single">单光镜片</option>
                    <option value="progressive">渐进镜片</option>
                    <option value="blue-light">防蓝光镜片</option>
                    <option value="photochromic">变色镜片</option>
                  </select>
                </div>

                {selectedLens && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">品牌: {selectedLens.brand}</div>
                    <div className="text-sm text-gray-600">基础价格: ¥{selectedLens.basePrice}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    折扣 (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    placeholder="输入折扣百分比"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={!selectedLens || framePrice === 0}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  计算价格
                </button>
              </div>

              {/* 右侧：结果 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">价格明细</h3>

                {priceCalculation ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">镜框价格:</span>
                      <span className="text-gray-800">¥{priceCalculation.framePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">镜片价格:</span>
                      <span className="text-gray-800">¥{priceCalculation.lensPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">小计:</span>
                      <span className="text-gray-800">¥{priceCalculation.subtotal}</span>
                    </div>
                    {priceCalculation.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>折扣:</span>
                        <span>-¥{priceCalculation.discount}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">总价:</span>
                        <span className="text-xl font-bold text-red-600">
                          ¥{priceCalculation.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    请输入信息并计算
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 订单列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">订单列表</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无订单
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-800">订单 #{order.id}</div>
                        <div className="text-sm text-gray-500">{order.customerName}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="ml-8 space-y-1 text-sm text-gray-600">
                    <div>镜框: {order.frameName} - ¥{order.framePrice}</div>
                    <div>镜片: {order.lensType} - ¥{order.lensPrice}</div>
                    <div className="font-semibold text-gray-800">
                      总价: ¥{order.totalPrice}
                    </div>
                    <div className="text-xs text-gray-500">
                      创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderManagementPage
