import { apiClient } from '@/lib/chat-history/apiClient'
import { Model } from '@/lib/types/models'

export class ConfigService {
static async getModelList(): Promise<Model[]> {
    //const response = await apiClient.get<Model[]>(`/config?modelList`)

    //if (response.status !== 200) {
       // throw new Error('Failed to fetch model list')
    //}
    //return response.data || []
    return []
  }
}