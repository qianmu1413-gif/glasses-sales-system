// 微信吸附侧边栏窗口
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let sidebarWindow: BrowserWindow | null = null
let wechatWindowBounds: { x: number; y: number; width: number; height: number } | null = null
let updateInterval: NodeJS.Timeout | null = null

// 查找微信窗口（Windows平台）
function findWeChatWindow(): { x: number; y: number; width: number; height: number } | null {
  try {
    const windowManager = require('node-window-manager')
    const windows = windowManager.windowManager.getWindows()

    // 查找微信窗口（支持多种微信客户端）
    const wechatWindow = windows.find((win: any) => {
      const title = win.getTitle().toLowerCase()
      const processName = win.path?.toLowerCase() || ''

      return (
        title.includes('微信') ||
        title.includes('wechat') ||
        processName.includes('wechat') ||
        processName.includes('weixin')
      )
    })

    if (wechatWindow) {
      const bounds = wechatWindow.getBounds()
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      }
    }
  } catch (error) {
    console.error('查找微信窗口失败:', error)
  }

  return null
}

// 计算侧边栏窗口位置
function calculateSidebarPosition(wechatBounds?: { x: number; y: number; width: number; height: number }) {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  const sidebarWidth = 350
  const gap = 5 // 窗口间隙

  if (wechatBounds) {
    // 如果找到微信窗口，计算吸附位置
    const rightSpace = screenWidth - (wechatBounds.x + wechatBounds.width)
    const leftSpace = wechatBounds.x

    // 优先吸附在右侧，如果右侧空间不够则吸附在左侧
    if (rightSpace >= sidebarWidth + gap) {
      // 吸附在微信窗口右侧
      return {
        x: wechatBounds.x + wechatBounds.width + gap,
        y: wechatBounds.y,
        width: sidebarWidth,
        height: wechatBounds.height
      }
    } else if (leftSpace >= sidebarWidth + gap) {
      // 吸附在微信窗口左侧
      return {
        x: wechatBounds.x - sidebarWidth - gap,
        y: wechatBounds.y,
        width: sidebarWidth,
        height: wechatBounds.height
      }
    }
  }

  // 默认位置：屏幕右侧
  return {
    x: screenWidth - sidebarWidth - 20,
    y: 100,
    width: sidebarWidth,
    height: Math.min(screenHeight - 200, 800)
  }
}

export function createWeChatSidebarWindow(): BrowserWindow {
  if (sidebarWindow && !sidebarWindow.isDestroyed()) {
    sidebarWindow.focus()
    return sidebarWindow
  }

  // 尝试查找微信窗口
  wechatWindowBounds = findWeChatWindow()

  // 计算侧边栏位置
  const bounds = calculateSidebarPosition(wechatWindowBounds)

  sidebarWindow = new BrowserWindow({
    ...bounds,
    minWidth: 300,
    minHeight: 400,
    maxWidth: 500,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'WeFlow 销售助手'
  })

  // 加载侧边栏页面
  if (process.env.VITE_DEV_SERVER_URL) {
    sidebarWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/wechat-sidebar`)
  } else {
    // 生产环境：使用正确的路径
    const indexPath = join(__dirname, '../dist/index.html')
    sidebarWindow.loadFile(indexPath, {
      hash: '/wechat-sidebar'
    })
  }

  // 添加页面加载错误处理
  sidebarWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('吸附窗口加载失败:', errorCode, errorDescription)
  })

  sidebarWindow.webContents.on('did-finish-load', () => {
    console.log('吸附窗口加载成功')
  })

  // 启动自动跟随微信窗口的定时器
  startAutoFollow()

  // 窗口关闭时清理
  sidebarWindow.on('closed', () => {
    stopAutoFollow()
    sidebarWindow = null
  })

  // 始终打开开发者工具以便调试
  sidebarWindow.webContents.openDevTools({ mode: 'detach' })

  return sidebarWindow
}

export function closeSidebarWindow(): void {
  stopAutoFollow()
  if (sidebarWindow && !sidebarWindow.isDestroyed()) {
    sidebarWindow.close()
  }
}

export function getSidebarWindow(): BrowserWindow | null {
  return sidebarWindow
}

// 启动自动跟随
function startAutoFollow(): void {
  if (updateInterval) return

  // 每500ms检查一次微信窗口位置
  updateInterval = setInterval(() => {
    updateSidebarPosition()
  }, 500)
}

// 停止自动跟随
function stopAutoFollow(): void {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// 更新侧边栏位置（当微信窗口移动时调用）
export function updateSidebarPosition(): void {
  if (!sidebarWindow || sidebarWindow.isDestroyed()) return

  const newWechatBounds = findWeChatWindow()

  // 如果微信窗口位置发生变化，更新侧边栏位置
  if (newWechatBounds && (!wechatWindowBounds ||
      newWechatBounds.x !== wechatWindowBounds.x ||
      newWechatBounds.y !== wechatWindowBounds.y ||
      newWechatBounds.width !== wechatWindowBounds.width ||
      newWechatBounds.height !== wechatWindowBounds.height)) {

    wechatWindowBounds = newWechatBounds
    const bounds = calculateSidebarPosition(wechatWindowBounds)

    sidebarWindow.setBounds(bounds, true) // true = 动画效果
  }
}
