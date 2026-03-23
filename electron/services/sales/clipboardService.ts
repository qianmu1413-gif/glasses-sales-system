// 剪贴板服务
import { clipboard } from 'electron'

export class ClipboardService {
  /**
   * 复制文本到剪贴板
   */
  copyText(text: string): void {
    clipboard.writeText(text)
  }

  /**
   * 从剪贴板读取文本
   */
  readText(): string {
    return clipboard.readText()
  }

  /**
   * 清空剪贴板
   */
  clear(): void {
    clipboard.clear()
  }
}

// 单例实例
let clipboardServiceInstance: ClipboardService | null = null

/**
 * 获取剪贴板服务实例
 */
export function getClipboardService(): ClipboardService {
  if (!clipboardServiceInstance) {
    clipboardServiceInstance = new ClipboardService()
  }
  return clipboardServiceInstance
}
