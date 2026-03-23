// Prompt模板管理

export const CUSTOMER_PROFILE_PROMPT = `你是一个专业的眼镜销售顾问助手。请根据以下微信聊天记录，分析顾客的画像特征。

请从以下维度进行分析：
1. 年龄段：18-25、26-35、36-45、46-60、60+
2. 性格特征：如理性、感性、注重品质、价格敏感、追求时尚等
3. 消费能力：low（低）、medium（中）、high（高）
4. 风格偏好：如商务、时尚、运动、休闲、复古等
5. 价格区间：根据对话推测顾客可接受的价格范围
6. 脸型（如果提到）：round（圆脸）、square（方脸）、oval（鹅蛋脸）、heart（心形脸）、long（长脸）

请以JSON格式返回分析结果，格式如下：
{
  "ageRange": "26-35",
  "personality": ["理性", "注重品质"],
  "purchasePower": "medium",
  "preferences": {
    "style": ["商务", "时尚"],
    "priceRange": [500, 2000],
    "brands": []
  },
  "faceShape": "oval",
  "confidence": 0.8,
  "reasoning": "分析依据说明"
}

聊天记录：
{messages}

请仅返回JSON，不要包含其他文字。`

export const SALES_SCRIPT_PROMPT = `你是一个专业的眼镜销售顾问。请根据以下信息生成自然、个性化的销售话术。

顾客画像：
{profile}

对话场景：{scenario}

当前对话上下文：
{context}

要求：
1. 话术要自然、亲切，不要过于生硬
2. 根据顾客的性格特征调整语气（理性顾客用数据和逻辑，感性顾客用情感和体验）
3. 根据消费能力推荐合适价位的产品
4. 话术长度控制在50-150字
5. 不要使用过于夸张的形容词

场景说明：
- greeting: 欢迎顾客，建立初步联系
- consultation: 了解顾客需求，询问使用场景
- recommendation: 推荐合适的镜框
- negotiation: 处理价格异议，介绍优惠
- closing: 促成交易
- afterSales: 售后服务和关怀

请直接返回话术内容，不要包含其他说明文字。`

export function buildCustomerProfilePrompt(messages: Array<{ sender: string; content: string; time: Date }>): string {
  const messagesText = messages
    .map(m => `[${m.time.toLocaleString()}] ${m.sender}: ${m.content}`)
    .join('\n')

  return CUSTOMER_PROFILE_PROMPT.replace('{messages}', messagesText)
}

export function buildSalesScriptPrompt(
  profile: any,
  scenario: string,
  context: { recentMessages?: any[]; customerQuestion?: string } = {}
): string {
  const profileText = JSON.stringify(profile, null, 2)
  const contextText = context.recentMessages
    ? context.recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')
    : context.customerQuestion || '无'

  return SALES_SCRIPT_PROMPT
    .replace('{profile}', profileText)
    .replace('{scenario}', scenario)
    .replace('{context}', contextText)
}
