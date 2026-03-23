// 微信吸附侧边栏窗口
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let sidebarWindow: BrowserWindow | null = null
let wechatWindowBounds: { x: number; y: number; width: number; height: number } | null = null

// 查找微信窗口（Windows平台）
function findWeChatWindow(): { x: number; y: number; width: number; height: number } | null {
  // 在Windows上，我们可以使用node-window-manager或其他库来查找窗口
  // 这里先返回null，表示未找到，会使用默认位置
  // TODO: 实现真正的微信窗口检测
  return null
}

// 计算侧边栏窗口位置
function calculateSidebarPosition(wechatBounds?: { x: number; y: number; width: number; height: number }) {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  
  const sidebarWidth = 350
  const sidebarHeight = 800
  
  if (wechatBounds) {
    // 如果找到微信窗口，吸附在其右侧
    return {
      x: wechatBounds.x + wechatBounds.width + 10,
      y: wechatBounds.y,
      width: sidebarWidth,
      height: Math.min(wechatBounds.height, sidebarHeight)
    }
  } else {
    // 默认位置：屏幕右侧
    return {
      x: screenWidth - sidebarWidth - 20,
      y: 100,
      width: sidebarWidth,
      height: sidebarHeight
    }
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
    sidebarWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/wechat-sidebar'
    })
  }

  // 窗口关闭时清理
  sidebarWindow.on('closed', () => {
    sidebarWindow = null
  })

  // 开发环境打开开发者工具
  if (process.env.VITE_DEV_SERVER_URL) {
    sidebarWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return sidebarWindow
}

export function closeSidebarWindow(): void {
  if (sidebarWindow && !sidebarWindow.isDestroyed()) {
    sidebarWindow.close()
  }
}

export function getSidebarWindow(): BrowserWindow | null {
  return sidebarWindow
}

// 更新侧边栏位置（当微信窗口移动时调用）
export function updateSidebarPosition(): void {
  if (!sidebarWindow || sidebarWindow.isDestroyed()) return
  
  wechatWindowBounds = findWeChatWindow()
  const bounds = calculateSidebarPosition(wechatWindowBounds)
  
  sidebarWindow.setBounds(bounds)
}
