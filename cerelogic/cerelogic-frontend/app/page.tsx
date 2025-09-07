import { generateId } from 'ai'

import { ConfigService } from '@/lib/config/get-config'

import { Chat } from '@/components/chat'

export default async function Page() {
  const id = generateId()
  const models = await ConfigService.getModelList()
  return <Chat id={id} models={models} />
}
