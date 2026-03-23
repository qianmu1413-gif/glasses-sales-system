// 订单管理服务
import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

interface Order {
  id: string
  wxid: string
  customerName: string
  frameId: string
  frameName: string
  framePrice: number
  lensOption: string
  lensPrice: number
  totalPrice: number
  discount: number
  status: string
  notes?: string
  createdAt: number
  updatedAt: number
}

class OrderService {
  private db: Database.Database | null = null

  constructor() {
    this.initDatabase()
  }

  private initDatabase(): void {
    try {
      const userDataPath = app.getPath('userData')
      const dbDir = join(userDataPath, 'sales-data')
      
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true })
      }

      const dbPath = join(dbDir, 'orders.db')
      this.db = new Database(dbPath)

      // 创建订单表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          wxid TEXT NOT NULL,
          customerName TEXT NOT NULL,
          frameId TEXT,
          frameName TEXT,
          framePrice REAL,
          lensOption TEXT,
          lensPrice REAL,
          totalPrice REAL NOT NULL,
          discount REAL DEFAULT 0,
          status TEXT NOT NULL,
          notes TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        )
      `)

      // 创建索引
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_orders_wxid ON orders(wxid);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(createdAt);
      `)

      console.log('订单数据库初始化成功')
    } catch (error) {
      console.error('初始化订单数据库失败:', error)
    }
  }

  // 创建订单
  createOrder(order: any): string {
    if (!this.db) throw new Error('数据库未初始化')

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()

    try {
      const stmt = this.db.prepare(`
        INSERT INTO orders 
        (id, wxid, customerName, frameId, frameName, framePrice, lensOption, lensPrice, totalPrice, discount, status, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        orderId,
        order.wxid,
        order.customerName,
        order.frameId || null,
        order.frameName || null,
        order.framePrice || 0,
        JSON.stringify(order.lensOption),
        order.lensPrice || 0,
        order.totalPrice,
        order.discount || 0,
        order.status || 'pending',
        order.notes || null,
        now,
        now
      )

      return orderId
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    }
  }

  // 获取订单
  getOrder(orderId: string): any | null {
    if (!this.db) return null

    try {
      const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?')
      const row = stmt.get(orderId) as Order | undefined

      if (!row) return null

      return {
        id: row.id,
        wxid: row.wxid,
        customerName: row.customerName,
        frameId: row.frameId,
        frameName: row.frameName,
        framePrice: row.framePrice,
        lensOption: JSON.parse(row.lensOption),
        lensPrice: row.lensPrice,
        totalPrice: row.totalPrice,
        discount: row.discount,
        status: row.status,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      return null
    }
  }

  // 获取所有订单
  getAllOrders(limit: number = 100, offset: number = 0): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM orders 
        ORDER BY createdAt DESC 
        LIMIT ? OFFSET ?
      `)
      const rows = stmt.all(limit, offset) as Order[]

      return rows.map(row => ({
        id: row.id,
        wxid: row.wxid,
        customerName: row.customerName,
        frameId: row.frameId,
        frameName: row.frameName,
        framePrice: row.framePrice,
        lensOption: JSON.parse(row.lensOption),
        lensPrice: row.lensPrice,
        totalPrice: row.totalPrice,
        discount: row.discount,
        status: row.status,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }))
    } catch (error) {
      console.error('获取所有订单失败:', error)
      return []
    }
  }

  // 按顾客获取订单
  getOrdersByCustomer(wxid: string): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM orders 
        WHERE wxid = ? 
        ORDER BY createdAt DESC
      `)
      const rows = stmt.all(wxid) as Order[]

      return rows.map(row => ({
        id: row.id,
        wxid: row.wxid,
        customerName: row.customerName,
        frameId: row.frameId,
        frameName: row.frameName,
        framePrice: row.framePrice,
        lensOption: JSON.parse(row.lensOption),
        lensPrice: row.lensPrice,
        totalPrice: row.totalPrice,
        discount: row.discount,
        status: row.status,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }))
    } catch (error) {
      console.error('获取顾客订单失败:', error)
      return []
    }
  }

  // 更新订单状态
  updateOrderStatus(orderId: string, status: string): boolean {
    if (!this.db) return false

    try {
      const stmt = this.db.prepare(`
        UPDATE orders 
        SET status = ?, updatedAt = ? 
        WHERE id = ?
      `)

      stmt.run(status, Date.now(), orderId)
      return true
    } catch (error) {
      console.error('更新订单状态失败:', error)
      return false
    }
  }

  // 更新订单
  updateOrder(orderId: string, updates: any): boolean {
    if (!this.db) return false

    try {
      const fields = []
      const values = []

      if (updates.frameName) {
        fields.push('frameName = ?')
        values.push(updates.frameName)
      }
      if (updates.framePrice !== undefined) {
        fields.push('framePrice = ?')
        values.push(updates.framePrice)
      }
      if (updates.lensOption) {
        fields.push('lensOption = ?')
        values.push(JSON.stringify(updates.lensOption))
      }
      if (updates.lensPrice !== undefined) {
        fields.push('lensPrice = ?')
        values.push(updates.lensPrice)
      }
      if (updates.totalPrice !== undefined) {
        fields.push('totalPrice = ?')
        values.push(updates.totalPrice)
      }
      if (updates.discount !== undefined) {
        fields.push('discount = ?')
        values.push(updates.discount)
      }
      if (updates.status) {
        fields.push('status = ?')
        values.push(updates.status)
      }
      if (updates.notes !== undefined) {
        fields.push('notes = ?')
        values.push(updates.notes)
      }

      fields.push('updatedAt = ?')
      values.push(Date.now())

      values.push(orderId)

      const stmt = this.db.prepare(`
        UPDATE orders 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `)

      stmt.run(...values)
      return true
    } catch (error) {
      console.error('更新订单失败:', error)
      return false
    }
  }

  // 删除订单
  deleteOrder(orderId: string): boolean {
    if (!this.db) return false

    try {
      const stmt = this.db.prepare('DELETE FROM orders WHERE id = ?')
      stmt.run(orderId)
      return true
    } catch (error) {
      console.error('删除订单失败:', error)
      return false
    }
  }

  // 获取订单统计
  getOrderStats(): any {
    if (!this.db) return null

    try {
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count, SUM(totalPrice) as revenue FROM orders')
      const statusStmt = this.db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
      
      const total = totalStmt.get() as any
      const byStatus = statusStmt.all() as any[]

      return {
        totalOrders: total.count,
        totalRevenue: total.revenue || 0,
        byStatus: byStatus.reduce((acc, row) => {
          acc[row.status] = row.count
          return acc
        }, {})
      }
    } catch (error) {
      console.error('获取订单统计失败:', error)
      return null
    }
  }

  // 关闭数据库
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

let orderServiceInstance: OrderService | null = null

export function getOrderService(): OrderService {
  if (!orderServiceInstance) {
    orderServiceInstance = new OrderService()
  }
  return orderServiceInstance
}
