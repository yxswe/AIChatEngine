export function isReasoningModel(model: string): boolean {
  if (typeof model !== 'string') {
    return false
  }
  return (
    model.includes('deepseek-r1') ||
    model.includes('deepseek-reasoner') ||
    model.includes('o3-mini')
  )
}
