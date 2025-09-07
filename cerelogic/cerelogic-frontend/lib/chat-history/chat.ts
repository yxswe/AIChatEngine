'use client'

// import { apiClient } from '@/lib/chat-history/apiClient'
import { type Chat } from '@/lib/types'

//   /**
//    * Fetch all chats for a user
//    */
// export async function getChats(userId: string): Promise<Chat[]> {
//     const response = await apiClient.get<Chat[]>(`/chats?userId=${userId}`)
//     return response.data || []
// }

// /**
//  * Fetch chats with pagination
//  */
// export async function getChatsPage(
//     userId: string,
//     limit = 20,
//     offset = 0
//   ): Promise<{ chats: Chat[]; nextOffset: number | null }> {
//     const response = await apiClient.get<{ chats: Chat[]; nextOffset: number | null }>(
//       `/chats/page?userId=${userId}&limit=${limit}&offset=${offset}`
//     )
//     return response.data || { chats: [], nextOffset: null }
// }

// /**
//  * Get a specific chat by ID
//  */
// export async function getChat(id: string, userId: string): Promise<Chat | null> {
//     const response = await apiClient.get<Chat>(`/chats/${id}?userId=${userId}`)
//     return response.data
// }

// /**
//  * Save a chat (create or update)
//  */
// export async function saveChat(chat: Chat, userId: string): Promise<Chat> {
//     const response = await apiClient.post<Chat>('/chats', { ...chat, userId })
//     return response.data
// }

// /**
//  * Delete a specific chat
//  */
// export async function deleteChat(chatId: string, userId: string): Promise<void> {
//     await apiClient.delete(`/chats/${chatId}?userId=${userId}`)
// }

// /**
//  * Clear all chats for a user
//  */
// export async function clearChats(userId: string): Promise<void> {
//     await apiClient.delete(`/chats?userId=${userId}`)
// }

// /**
//  * Share a chat (make it publicly accessible)
//  */
// export async function shareChat(id: string, userId: string): Promise<Chat> {
//     const response = await apiClient.post<Chat>(`/chats/${id}/share`, { userId })
//     return response.data
// }

// /**
//  * Get a shared chat by ID (public access)
//  */
// export async function getSharedChat(id: string): Promise<Chat | null> {
//     const response = await apiClient.get<Chat>(`/chats/${id}/shared`)
//     return response.data
// }



export async function getChats(userId: string): Promise<Chat[]> {
    return  []
}

/**
 * Fetch chats with pagination
 */
export async function getChatsPage(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ chats: Chat[]; nextOffset: number | null }> {
    
    return { chats: [], nextOffset: null }
}

/**
 * Get a specific chat by ID
 */
export async function getChat(id: string, userId: string): Promise<Chat | null> {
    return null
}

/**
 * Save a chat (create or update)
 */
export async function saveChat(chat: Chat, userId: string): Promise<Chat> {
    // Mock implementation - simulate saving a chat
    const savedChat: Chat = {
        ...chat,
        userId,
        id: chat.id || `chat_${Date.now()}`,
        createdAt: chat.createdAt || new Date(),
        path: chat.path || `/chat/${chat.id || Date.now()}`
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return savedChat
}

/**
 * Delete a specific chat
 */
export async function deleteChat(chatId: string, userId: string): Promise<void> {
    // Mock implementation - simulate deleting a chat
    console.log(`Mock: Deleting chat ${chatId} for user ${userId}`)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Clear all chats for a user
 */
export async function clearChats(userId: string): Promise<void> {
    // Mock implementation - simulate clearing all chats
    console.log(`Mock: Clearing all chats for user ${userId}`)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Share a chat (make it publicly accessible)
 */
export async function shareChat(id: string, userId: string): Promise<Chat> {
    // Mock implementation - simulate sharing a chat
    const sharedChat: Chat = {
        id,
        userId,
        title: `Shared Chat ${id}`,
        createdAt: new Date(),
        path: `/chat/${id}`,
        messages: [],
        sharePath: `/share/${id}`
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return sharedChat
}

/**
 * Get a shared chat by ID (public access)
 */
export async function getSharedChat(id: string): Promise<Chat | null> {
    // Mock implementation - simulate getting a shared chat
    console.log(`Mock: Getting shared chat ${id}`)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Return null for now, or you can return a mock shared chat
    return null
}
