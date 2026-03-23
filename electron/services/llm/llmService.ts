// LLM统一服务接口
import { ConfigService } from '../config'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LLMProvider {
  chat(messages: LLMMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse>
}

class LLMService {
  private provider: LLMProvider | null = null
  private config: ConfigService

  constructor() {
    this.config = ConfigService.getInstance()
  }

  async initialize(): Promise<void> {
    const providerType = this.config.get('llmProvider') || 'openai'
    const apiKey = providerType === 'openai'
      ? this.config.get('openaiApiKey')
      : this.config.get('claudeApiKey')

    if (!apiKey) {
      throw new Error(`请先配置${providerType === 'openai' ? 'OpenAI' : 'Claude'} API Key`)
    }

    if (providerType === 'openai') {
      const { OpenAIProvider } = await import('./openaiProvider')
      this.provider = new OpenAIProvider(apiKey, this.config.get('openaiModel') || 'gpt-4')
    } else {
      const { ClaudeProvider } = await import('./claudeProvider')
      this.provider = new ClaudeProvider(apiKey, this.config.get('claudeModel') || 'claude-3-5-sonnet-20241022')
    }
  }

  async chat(messages: LLMMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (!this.provider) {
      await this.initialize()
    }
    return this.provider!.chat(messages, options)
  }

  isInitialized(): boolean {
    return this.provider !== null
  }
}

let llmServiceInstance: LLMService | null = null

export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService()
  }
  return llmServiceInstance
}

export async function initLLMService(): Promise<void> {
  const service = getLLMService()
  await service.initialize()
}
