// 顾客数据库服务
import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

interface CustomerProfile {
  wxid: string
  name: string
  ageRange: string
  personality: string
  purchasePower: string
  preferences: string
  faceShape?: string
  lastAnalyzedAt: number
  confidence: number
  analysisSource: string
}

interface CustomerNote {
  id: number
  wxid: string
  content: string
  createdAt: number
}

class CustomerDatabaseService {
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

      const dbPath = join(dbDir, 'customers.db')
      this.db = new Database(dbPath)

      // 创建顾客画像表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS customer_profiles (
          wxid TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          ageRange TEXT,
          personality TEXT,
          purchasePower TEXT,
          preferences TEXT,
          faceShape TEXT,
          lastAnalyzedAt INTEGER,
          confidence REAL,
          analysisSource TEXT
        )
      `)

      // 创建顾客备注表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS customer_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wxid TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (wxid) REFERENCES customer_profiles(wxid)
        )
      `)

      // 创建索引
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_notes_wxid ON customer_notes(wxid);
        CREATE INDEX IF NOT EXISTS idx_profiles_updated ON customer_profiles(lastAnalyzedAt);
      `)

      console.log('顾客数据库初始化成功')
    } catch (error) {
      console.error('初始化数据库失败:', error)
    }
  }

  // 保存或更新顾客画像
  saveProfile(profile: any): boolean {
    if (!this.db) return false

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO customer_profiles 
        (wxid, name, ageRange, personality, purchasePower, preferences, faceShape, lastAnalyzedAt, confidence, analysisSource)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        profile.wxid,
        profile.name,
        profile.ageRange,
        JSON.stringify(profile.personality),
        profile.purchasePower,
        JSON.stringify(profile.preferences),
        profile.faceShape || null,
        profile.lastAnalyzedAt?.getTime() || Date.now(),
        profile.confidence,
        profile.analysisSource
      )

      return true
    } catch (error) {
      console.error('保存顾客画像失败:', error)
      return false
    }
  }

  // 获取顾客画像
  getProfile(wxid: string): any | null {
    if (!this.db) return null

    try {
      const stmt = this.db.prepare('SELECT * FROM customer_profiles WHERE wxid = ?')
      const row = stmt.get(wxid) as CustomerProfile | undefined

      if (!row) return null

      return {
        wxid: row.wxid,
        name: row.name,
        ageRange: row.ageRange,
        personality: JSON.parse(row.personality),
        purchasePower: row.purchasePower,
        preferences: JSON.parse(row.preferences),
        faceShape: row.faceShape,
        lastAnalyzedAt: new Date(row.lastAnalyzedAt),
        confidence: row.confidence,
        analysisSource: row.analysisSource
      }
    } catch (error) {
      console.error('获取顾客画像失败:', error)
      return null
    }
  }

  // 获取所有顾客画像
  getAllProfiles(): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare('SELECT * FROM customer_profiles ORDER BY lastAnalyzedAt DESC')
      const rows = stmt.all() as CustomerProfile[]

      return rows.map(row => ({
        wxid: row.wxid,
        name: row.name,
        ageRange: row.ageRange,
        personality: JSON.parse(row.personality),
        purchasePower: row.purchasePower,
        preferences: JSON.parse(row.preferences),
        faceShape: row.faceShape,
        lastAnalyzedAt: new Date(row.lastAnalyzedAt),
        confidence: row.confidence,
        analysisSource: row.analysisSource
      }))
    } catch (error) {
      console.error('获取所有顾客画像失败:', error)
      return []
    }
  }

  // 搜索顾客
  searchProfiles(keyword: string): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM customer_profiles 
        WHERE name LIKE ? OR wxid LIKE ?
        ORDER BY lastAnalyzedAt DESC
      `)
      const rows = stmt.all(`%${keyword}%`, `%${keyword}%`) as CustomerProfile[]

      return rows.map(row => ({
        wxid: row.wxid,
        name: row.name,
        ageRange: row.ageRange,
        personality: JSON.parse(row.personality),
        purchasePower: row.purchasePower,
        preferences: JSON.parse(row.preferences),
        faceShape: row.faceShape,
        lastAnalyzedAt: new Date(row.lastAnalyzedAt),
        confidence: row.confidence,
        analysisSource: row.analysisSource
      }))
    } catch (error) {
      console.error('搜索顾客失败:', error)
      return []
    }
  }

  // 添加顾客备注
  addNote(wxid: string, content: string): boolean {
    if (!this.db) return false

    try {
      const stmt = this.db.prepare(`
        INSERT INTO customer_notes (wxid, content, createdAt)
        VALUES (?, ?, ?)
      `)

      stmt.run(wxid, content, Date.now())
      return true
    } catch (error) {
      console.error('添加备注失败:', error)
      return false
    }
  }

  // 获取顾客备注
  getNotes(wxid: string): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM customer_notes 
        WHERE wxid = ? 
        ORDER BY createdAt DESC
      `)
      const rows = stmt.all(wxid) as CustomerNote[]

      return rows.map(row => ({
        id: row.id,
        wxid: row.wxid,
        content: row.content,
        createdAt: new Date(row.createdAt)
      }))
    } catch (error) {
      console.error('获取备注失败:', error)
      return []
    }
  }

  // 删除顾客
  deleteProfile(wxid: string): boolean {
    if (!this.db) return false

    try {
      const transaction = this.db.transaction(() => {
        this.db!.prepare('DELETE FROM customer_notes WHERE wxid = ?').run(wxid)
        this.db!.prepare('DELETE FROM customer_profiles WHERE wxid = ?').run(wxid)
      })

      transaction()
      return true
    } catch (error) {
      console.error('删除顾客失败:', error)
      return false
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

let customerDatabaseServiceInstance: CustomerDatabaseService | null = null

export function getCustomerDatabaseService(): CustomerDatabaseService {
  if (!customerDatabaseServiceInstance) {
    customerDatabaseServiceInstance = new CustomerDatabaseService()
  }
  return customerDatabaseServiceInstance
}
