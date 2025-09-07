import { apiClient } from '@/lib/chat-history/apiClient'
import { type Chat } from '@/lib/types'

export class ChatService {
  /**
   * Fetch all chats for a user
   */
  static async getChats(userId: string): Promise<Chat[]> {
    const response = await apiClient.get<Chat[]>(`/chats?userId=${userId}`)
    return response.data || []
  }

  /**
   * Fetch chats with pagination
   */
  static async getChatsPage(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ chats: Chat[]; nextOffset: number | null }> {
    const response = await apiClient.get<{ chats: Chat[]; nextOffset: number | null }>(
      `/chats/page?userId=${userId}&limit=${limit}&offset=${offset}`
    )
    return response.data || { chats: [], nextOffset: null }
  }

  /**
   * Get a specific chat by ID
   */
  static async getChat(id: string, userId: string): Promise<Chat | null> {
    const response = await apiClient.get<Chat>(`/chats/${id}?userId=${userId}`)
    return response.data
  }

  /**
   * Save a chat (create or update)
   */
  static async saveChat(chat: Chat, userId: string): Promise<Chat> {
    const response = await apiClient.post<Chat>('/chats', { ...chat, userId })
    return response.data
  }

  /**
   * Delete a specific chat
   */
  static async deleteChat(chatId: string, userId: string): Promise<void> {
    await apiClient.delete(`/chats/${chatId}?userId=${userId}`)
  }

  /**
   * Clear all chats for a user
   */
  static async clearChats(userId: string): Promise<void> {
    await apiClient.delete(`/chats?userId=${userId}`)
  }

  /**
   * Share a chat (make it publicly accessible)
   */
  static async shareChat(id: string, userId: string): Promise<Chat> {
    const response = await apiClient.post<Chat>(`/chats/${id}/share`, { userId })
    return response.data
  }

  /**
   * Get a shared chat by ID (public access)
   */
  static async getSharedChat(id: string): Promise<Chat | null> {
    const response = await apiClient.get<Chat>(`/chats/${id}/shared`)
    return response.data
  }
}