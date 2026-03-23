// LLM 统一服务接口
import { OpenAIProvider } from './openaiProvider'
import { ClaudeProvider } from './claudeProvider'
import type { LLMConfig, LLMResponse } from '../../../src/types/sales'

type LLMProvider = OpenAIProvider | ClaudeProvider

export class LLMService {
  private provider: LLMProvider
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
    this.provider = this.createProvider(config)
  }

  private createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config)
      case 'claude':
        return new ClaudeProvider(config)
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`)
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(prompt: string): Promise<LLMResponse> {
    return this.provider.chat(prompt)
  }

  /**
   * 发送流式聊天请求
   */
  async chatStream(prompt: string, onChunk: (chunk: string) => void): Promise<LLMResponse> {
    return this.provider.chatStream(prompt, onChunk)
  }

  /**
   * 切换Provider
   */
  switchProvider(config: LLMConfig): void {
    this.config = config
    this.provider = this.createProvider(config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): LLMConfig {
    return { ...this.config }
  }
}

// 单例实例
let llmServiceInstance: LLMService | null = null

/**
 * 初始化LLM服务
 */
export function initLLMService(config: LLMConfig): LLMService {
  llmServiceInstance = new LLMService(config)
  return llmServiceInstance
}

/**
 * 获取LLM服务实例
 */
export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    throw new Error('LLM Service not initialized. Call initLLMService first.')
  }
  return llmServiceInstance
}
