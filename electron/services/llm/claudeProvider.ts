// Claude Provider 实现
import Anthropic from '@anthropic-ai/sdk'
import type { LLMConfig, LLMResponse } from '../../../src/types/sales'

export class ClaudeProvider {
  private client: Anthropic
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: LLMConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    })
    this.model = config.model || 'claude-3-5-sonnet-20241022'
    this.temperature = config.temperature ?? 0.7
    this.maxTokens = config.maxTokens ?? 2000
  }

  async chat(prompt: string): Promise<LLMResponse> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{ role: 'user', content: prompt }]
      })

      const content = message.content[0]?.type === 'text' ? message.content[0].text : ''
      const usage = message.usage

      return {
        content,
        usage: usage ? {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens
        } : undefined,
        cost: this.calculateCost(usage?.input_tokens || 0, usage?.output_tokens || 0)
      }
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async chatStream(prompt: string, onChunk: (chunk: string) => void): Promise<LLMResponse> {
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })

      let fullContent = ''
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text
          fullContent += content
          onChunk(content)
        }
      }

      return {
        content: fullContent
      }
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Sonnet 价格 (2026年3月估算)
    const inputCost = (inputTokens / 1000000) * 3  // $3 per 1M tokens
    const outputCost = (outputTokens / 1000000) * 15  // $15 per 1M tokens
    return inputCost + outputCost
  }
}
