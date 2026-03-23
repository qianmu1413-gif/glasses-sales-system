// 剪贴板服务
import { clipboard } from 'electron'

class ClipboardService {
  copyToClipboard(text: string): void {
    clipboard.writeText(text)
  }

  getFromClipboard(): string {
    return clipboard.readText()
  }
}

let clipboardServiceInstance: ClipboardService | null = null

export function getClipboardService(): ClipboardService {
  if (!clipboardServiceInstance) {
    clipboardServiceInstance = new ClipboardService()
  }
  return clipboardServiceInstance
}
