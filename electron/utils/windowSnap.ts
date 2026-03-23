// 窗口吸附功能
import { BrowserWindow, screen } from 'electron'

const SNAP_THRESHOLD = 20 // 吸附阈值（像素）

export function enableWindowSnap(win: BrowserWindow) {
  let isMoving = false
  let originalBounds: { x: number; y: number; width: number; height: number } | null = null

  // 监听窗口移动
  win.on('will-move', () => {
    if (!isMoving) {
      isMoving = true
      originalBounds = win.getBounds()
    }
  })

  win.on('moved', () => {
    if (!isMoving) return

    const bounds = win.getBounds()
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
    const workArea = display.workArea

    let snappedX = bounds.x
    let snappedY = bounds.y

    // 吸附到左边缘
    if (Math.abs(bounds.x - workArea.x) < SNAP_THRESHOLD) {
      snappedX = workArea.x
    }

    // 吸附到右边缘
    if (Math.abs(bounds.x + bounds.width - (workArea.x + workArea.width)) < SNAP_THRESHOLD) {
      snappedX = workArea.x + workArea.width - bounds.width
    }

    // 吸附到顶部边缘
    if (Math.abs(bounds.y - workArea.y) < SNAP_THRESHOLD) {
      snappedY = workArea.y
    }

    // 吸附到底部边缘
    if (Math.abs(bounds.y + bounds.height - (workArea.y + workArea.height)) < SNAP_THRESHOLD) {
      snappedY = workArea.y + workArea.height - bounds.height
    }

    // 如果位置发生变化，应用吸附
    if (snappedX !== bounds.x || snappedY !== bounds.y) {
      win.setBounds({
        x: snappedX,
        y: snappedY,
        width: bounds.width,
        height: bounds.height
      })
    }

    isMoving = false
  })
}
