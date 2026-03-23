// OpenAI Provider实现
import type { LLMProvider, LLMMessage, LLMResponse } from './llmService'

export class OpenAIProvider implements LLMProvider {
  private apiKey: string
  private model: string
  private baseURL: string

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey
    this.model = model
    this.baseURL = 'https://api.openai.com/v1'
  }

  async chat(messages: LLMMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(`OpenAI API错误: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  }
}
