// 报价单生成器组件
import React, { useState } from 'react'
import { FileText, Plus, Trash2, Download } from 'lucide-react'

interface QuotationItem {
  name: string
  specification: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Props {
  customerName?: string
  onGenerated?: (filePath: string) => void
}

export const QuotationGenerator: React.FC<Props> = ({ customerName = '', onGenerated }) => {
  const [formData, setFormData] = useState({
    customerName: customerName,
    customerPhone: '',
    discountPercent: 0,
    validDays: 7,
    notes: ''
  })

  const [items, setItems] = useState<QuotationItem[]>([
    { name: '镜框', specification: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
    { name: '镜片', specification: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])

  const [generating, setGenerating] = useState(false)

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // 自动计算小计
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { name: '', specification: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discount = subtotal * (formData.discountPercent / 100)
    const total = subtotal - discount
    return { subtotal, discount, total }
  }

  const handleGenerate = async () => {
    if (!formData.customerName) {
      alert('请输入客户姓名')
      return
    }

    if (items.some(item => !item.name || item.unitPrice === 0)) {
      alert('请完善所有项目信息')
      return
    }

    setGenerating(true)
    try {
      const result = await window.electronAPI.sales.generateQuotation({
        customerName: formData.customerName,
        items: items,
        options: {
          customerPhone: formData.customerPhone || undefined,
          discountPercent: formData.discountPercent,
          validDays: formData.validDays,
          notes: formData.notes || undefined
        }
      })

      if (result.success && result.filePath) {
        alert('报价单已生成并自动打开！\n保存位置：' + result.filePath)
        onGenerated?.(result.filePath)
      } else {
        alert('生成失败：' + (result.error || '未知错误'))
      }
    } catch (error) {
      console.error('生成报价单失败:', error)
      alert('生成失败：' + String(error))
    } finally {
      setGenerating(false)
    }
  }

  const { subtotal, discount, total } = calculateTotal()

  return (
    <div className="quotation-generator bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          生成报价单
        </h3>
      </div>

      <div className="space-y-4">
        {/* 客户信息 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名 *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
            <input
              type="text"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="选填"
            />
          </div>
        </div>

        {/* 项目列表 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">项目明细</label>
            <button
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加项目
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-2 bg-gray-50 rounded">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="项目名称"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={item.specification}
                    onChange={(e) => updateItem(index, 'specification', e.target.value)}
                    placeholder="规格说明"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="数量"
                    min="1"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="单价"
                    min="0"
                    step="0.01"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <div className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-right">
                    ¥{item.totalPrice.toFixed(2)}
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 价格汇总 */}
        <div className="bg-blue-50 rounded p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>小计：</span>
            <span>¥{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>优惠折扣：</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="1"
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span>%</span>
              <span className="text-red-600">-¥{discount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
            <span>合计：</span>
            <span className="text-red-600">¥{total.toFixed(2)}</span>
          </div>
        </div>

        {/* 其他设置 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有效期（天）</label>
            <input
              type="number"
              value={formData.validDays}
              onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) || 7 })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注说明</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="可选，留空则使用默认说明"
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
        >
          <Download className="w-5 h-5" />
          {generating ? '生成中...' : '生成报价单'}
        </button>
      </div>
    </div>
  )
}
