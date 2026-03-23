// OpenAI Provider 实现
import OpenAI from 'openai'
import type { LLMConfig, LLMResponse } from '../../../src/types/sales'

export class OpenAIProvider {
  private client: OpenAI
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey
    })
    this.model = config.model || 'gpt-4-turbo-preview'
    this.temperature = config.temperature ?? 0.7
    this.maxTokens = config.maxTokens ?? 2000
  }

  async chat(prompt: string): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      })

      const content = completion.choices[0]?.message?.content || ''
      const usage = completion.usage

      return {
        content,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        } : undefined,
        cost: this.calculateCost(usage?.prompt_tokens || 0, usage?.completion_tokens || 0)
      }
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async chatStream(prompt: string, onChunk: (chunk: string) => void): Promise<LLMResponse> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true
      })

      let fullContent = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          onChunk(content)
        }
      }

      return {
        content: fullContent
      }
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // GPT-4 Turbo 价格 (2026年3月估算)
    const promptCost = (promptTokens / 1000) * 0.01  // $0.01 per 1K tokens
    const completionCost = (completionTokens / 1000) * 0.03  // $0.03 per 1K tokens
    return promptCost + completionCost
  }
}
