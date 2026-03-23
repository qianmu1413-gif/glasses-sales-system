// 智能报价单生成服务
import { app } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'

export interface QuotationItem {
  name: string
  specification: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Quotation {
  id: string
  customerName: string
  customerPhone?: string
  items: QuotationItem[]
  subtotal: number
  discount: number
  total: number
  validUntil: Date
  notes?: string
  createdAt: Date
}

class QuotationService {
  // 生成报价单HTML
  generateQuotationHTML(quotation: Quotation): string {
    const validDate = quotation.validUntil.toLocaleDateString('zh-CN')
    const createDate = quotation.createdAt.toLocaleDateString('zh-CN')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>眼镜配镜报价单</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Microsoft YaHei", Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .quotation { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #1e40af; margin-bottom: 10px; }
    .header .subtitle { color: #64748b; font-size: 14px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .info-item { flex: 1; }
    .info-item label { font-weight: bold; color: #475569; display: block; margin-bottom: 5px; font-size: 14px; }
    .info-item .value { color: #1e293b; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background: #2563eb; color: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { font-weight: 600; font-size: 14px; }
    td { font-size: 14px; color: #334155; }
    tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .summary { margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
    .summary-row.total { font-size: 20px; font-weight: bold; color: #dc2626; border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 10px; }
    .notes { margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; }
    .notes h3 { color: #92400e; margin-bottom: 10px; font-size: 16px; }
    .notes p { color: #78350f; line-height: 1.6; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 13px; }
    @media print {
      body { padding: 0; background: white; }
      .quotation { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="quotation">
    <div class="header">
      <h1>眼镜配镜报价单</h1>
      <div class="subtitle">EYEWEAR QUOTATION</div>
    </div>

    <div class="info-section">
      <div class="info-item">
        <label>客户姓名</label>
        <div class="value">${quotation.customerName}</div>
      </div>
      ${quotation.customerPhone ? `
      <div class="info-item">
        <label>联系电话</label>
        <div class="value">${quotation.customerPhone}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <label>报价日期</label>
        <div class="value">${createDate}</div>
      </div>
      <div class="info-item">
        <label>有效期至</label>
        <div class="value">${validDate}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>项目名称</th>
          <th>规格说明</th>
          <th class="text-right">数量</th>
          <th class="text-right">单价（元）</th>
          <th class="text-right">小计（元）</th>
        </tr>
      </thead>
      <tbody>
        ${quotation.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.specification}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">¥${item.unitPrice.toFixed(2)}</td>
          <td class="text-right">¥${item.totalPrice.toFixed(2)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>小计：</span>
        <span>¥${quotation.subtotal.toFixed(2)}</span>
      </div>
      ${quotation.discount > 0 ? `
      <div class="summary-row" style="color: #dc2626;">
        <span>优惠：</span>
        <span>-¥${quotation.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row total">
        <span>合计金额：</span>
        <span>¥${quotation.total.toFixed(2)}</span>
      </div>
    </div>

    ${quotation.notes ? `
    <div class="notes">
      <h3>温馨提示</h3>
      <p>${quotation.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>感谢您的信任与支持！如有任何疑问，请随时联系我们。</p>
      <p style="margin-top: 10px;">本报价单自开具之日起${Math.ceil((quotation.validUntil.getTime() - quotation.createdAt.getTime()) / (1000 * 60 * 60 * 24))}天内有效</p>
    </div>
  </div>
</body>
</html>`
  }

  // 生成并保存报价单
  async generateQuotation(quotation: Quotation): Promise<string> {
    const html = this.generateQuotationHTML(quotation)
    const downloadsPath = app.getPath('downloads')
    const fileName = `报价单_${quotation.customerName}_${quotation.id}.html`
    const filePath = join(downloadsPath, fileName)

    await writeFile(filePath, html, 'utf-8')
    return filePath
  }

  // 创建报价单对象
  createQuotation(
    customerName: string,
    items: QuotationItem[],
    options: {
      customerPhone?: string
      discountPercent?: number
      validDays?: number
      notes?: string
    } = {}
  ): Quotation {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discount = options.discountPercent ? subtotal * (options.discountPercent / 100) : 0
    const total = subtotal - discount

    const now = new Date()
    const validUntil = new Date(now.getTime() + (options.validDays || 7) * 24 * 60 * 60 * 1000)

    return {
      id: Date.now().toString(),
      customerName,
      customerPhone: options.customerPhone,
      items,
      subtotal,
      discount,
      total,
      validUntil,
      notes: options.notes || '1. 本报价单仅供参考，最终价格以实际成交为准\n2. 配镜需提供准确的验光数据\n3. 定制镜片一般需要3-7个工作日\n4. 支持多种支付方式，可开具正规发票',
      createdAt: now
    }
  }
}

let quotationServiceInstance: QuotationService | null = null

export function getQuotationService(): QuotationService {
  if (!quotationServiceInstance) {
    quotationServiceInstance = new QuotationService()
  }
  return quotationServiceInstance
}
