// 顾客数据库服务
import Database from 'better-sqlite3'
import * as path from 'path'
import { app } from 'electron'
import type { CustomerProfile } from '../../../src/types/sales'
import type { Order } from '../../../src/types/orders'

export class CustomerDatabaseService {
  private db: Database.Database | null = null

  /**
   * 初始化数据库
   */
  initialize(): void {
    const dbPath = path.join(app.getPath('userData'), 'customers.db')
    this.db = new Database(dbPath)
    this.createTables()
  }

  /**
   * 创建表
   */
  private createTables(): void {
    if (!this.db) return

    // 顾客画像表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        wxid TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age_range TEXT NOT NULL,
        personality TEXT NOT NULL,
        purchase_power TEXT NOT NULL,
        preferences TEXT NOT NULL,
        face_shape TEXT,
        last_analyzed_at TEXT NOT NULL,
        confidence REAL NOT NULL,
        analysis_source TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 订单表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        wxid TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        frame_id TEXT NOT NULL,
        frame_name TEXT NOT NULL,
        lens_option TEXT NOT NULL,
        pricing TEXT NOT NULL,
        status TEXT NOT NULL,
        prescription TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (wxid) REFERENCES customer_profiles(wxid)
      )
    `)

    // 顾客标签表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customer_tags (
        wxid TEXT NOT NULL,
        tag TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (wxid, tag),
        FOREIGN KEY (wxid) REFERENCES customer_profiles(wxid)
      )
    `)

    // 顾客备注表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customer_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wxid TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (wxid) REFERENCES customer_profiles(wxid)
      )
    `)
  }

  /**
   * 保存顾客画像
   */
  saveCustomerProfile(profile: CustomerProfile): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO customer_profiles (
        wxid, name, age_range, personality, purchase_power, preferences,
        face_shape, last_analyzed_at, confidence, analysis_source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const now = new Date().toISOString()
    stmt.run(
      profile.wxid,
      profile.name,
      profile.ageRange,
      JSON.stringify(profile.personality),
      profile.purchasePower,
      JSON.stringify(profile.preferences),
      profile.faceShape || null,
      profile.lastAnalyzedAt.toISOString(),
      profile.confidence,
      profile.analysisSource,
      now,
      now
    )
  }

  /**
   * 获取顾客画像
   */
  getCustomerProfile(wxid: string): CustomerProfile | null {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM customer_profiles WHERE wxid = ?')
    const row = stmt.get(wxid) as any

    if (!row) return null

    return {
      wxid: row.wxid,
      name: row.name,
      ageRange: row.age_range,
      personality: JSON.parse(row.personality),
      purchasePower: row.purchase_power,
      preferences: JSON.parse(row.preferences),
      faceShape: row.face_shape || undefined,
      lastAnalyzedAt: new Date(row.last_analyzed_at),
      confidence: row.confidence,
      analysisSource: row.analysis_source
    }
  }

  /**
   * 获取所有顾客画像
   */
  getAllCustomerProfiles(): CustomerProfile[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM customer_profiles ORDER BY updated_at DESC')
    const rows = stmt.all() as any[]

    return rows.map(row => ({
      wxid: row.wxid,
      name: row.name,
      ageRange: row.age_range,
      personality: JSON.parse(row.personality),
      purchasePower: row.purchase_power,
      preferences: JSON.parse(row.preferences),
      faceShape: row.face_shape || undefined,
      lastAnalyzedAt: new Date(row.last_analyzed_at),
      confidence: row.confidence,
      analysisSource: row.analysis_source
    }))
  }

  /**
   * 保存订单
   */
  saveOrder(order: Order): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO orders (
        id, wxid, customer_name, frame_id, frame_name, lens_option,
        pricing, status, prescription, notes, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      order.id,
      order.wxid,
      order.customerName,
      order.frameId,
      order.frameName,
      JSON.stringify(order.lensOption),
      JSON.stringify(order.pricing),
      order.status,
      order.prescription ? JSON.stringify(order.prescription) : null,
      order.notes || null,
      order.createdAt.toISOString(),
      order.updatedAt.toISOString(),
      order.completedAt ? order.completedAt.toISOString() : null
    )
  }

  /**
   * 获取订单
   */
  getOrder(id: string): Order | null {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?')
    const row = stmt.get(id) as any

    if (!row) return null

    return this.rowToOrder(row)
  }

  /**
   * 获取顾客的所有订单
   */
  getCustomerOrders(wxid: string): Order[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM orders WHERE wxid = ? ORDER BY created_at DESC')
    const rows = stmt.all(wxid) as any[]

    return rows.map(row => this.rowToOrder(row))
  }

  /**
   * 获取所有订单
   */
  getAllOrders(): Order[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM orders ORDER BY created_at DESC')
    const rows = stmt.all() as any[]

    return rows.map(row => this.rowToOrder(row))
  }

  /**
   * 更新订单状态
   */
  updateOrderStatus(id: string, status: Order['status']): void {
    if (!this.db) throw new Error('Database not initialized')

    const completedAt = status === 'completed' ? new Date().toISOString() : null
    const stmt = this.db.prepare('UPDATE orders SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?')
    stmt.run(status, completedAt, new Date().toISOString(), id)
  }

  /**
   * 添加顾客标签
   */
  addCustomerTag(wxid: string, tag: string): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('INSERT OR IGNORE INTO customer_tags (wxid, tag, created_at) VALUES (?, ?, ?)')
    stmt.run(wxid, tag, new Date().toISOString())
  }

  /**
   * 移除顾客标签
   */
  removeCustomerTag(wxid: string, tag: string): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('DELETE FROM customer_tags WHERE wxid = ? AND tag = ?')
    stmt.run(wxid, tag)
  }

  /**
   * 获取顾客标签
   */
  getCustomerTags(wxid: string): string[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT tag FROM customer_tags WHERE wxid = ?')
    const rows = stmt.all(wxid) as any[]

    return rows.map(row => row.tag)
  }

  /**
   * 添加顾客备注
   */
  addCustomerNote(wxid: string, content: string): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('INSERT INTO customer_notes (wxid, content, created_at) VALUES (?, ?, ?)')
    stmt.run(wxid, content, new Date().toISOString())
  }

  /**
   * 获取顾客备注
   */
  getCustomerNotes(wxid: string): Array<{ id: number; content: string; createdAt: Date }> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM customer_notes WHERE wxid = ? ORDER BY created_at DESC')
    const rows = stmt.all(wxid) as any[]

    return rows.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: new Date(row.created_at)
    }))
  }

  /**
   * 将数据库行转换为Order对象
   */
  private rowToOrder(row: any): Order {
    return {
      id: row.id,
      wxid: row.wxid,
      customerName: row.customer_name,
      frameId: row.frame_id,
      frameName: row.frame_name,
      lensOption: JSON.parse(row.lens_option),
      pricing: JSON.parse(row.pricing),
      status: row.status,
      prescription: row.prescription ? JSON.parse(row.prescription) : undefined,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    }
  }

  /**
   * 关闭数据库
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// 单例实例
let customerDatabaseServiceInstance: CustomerDatabaseService | null = null

/**
 * 获取顾客数据库服务实例
 */
export function getCustomerDatabaseService(): CustomerDatabaseService {
  if (!customerDatabaseServiceInstance) {
    customerDatabaseServiceInstance = new CustomerDatabaseService()
  }
  return customerDatabaseServiceInstance
}
