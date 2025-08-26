'use client'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    // Import store dynamically to avoid SSR issues
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    return await store.fetchChats(userId)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return []
  }
}

export async function getChatsPage(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ chats: Chat[]; nextOffset: number | null }> {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    return await store.fetchChatsPage(userId, limit, offset)
  } catch (error) {
    console.error('Error fetching chat page:', error)
    return { chats: [], nextOffset: null }
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    return await store.loadChat(id, userId)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return null
  }
}

export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    const result = await store.clearAllChatsFromServer(userId)
    
    if (!result.error) {
      revalidatePath('/')
      redirect('/')
    }
    
    return result
  } catch (error) {
    console.error('Error clearing chats:', error)
    return { error: 'Failed to clear chats' }
  }
}

export async function deleteChat(
  chatId: string,
  userId = 'anonymous'
): Promise<{ error?: string }> {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    const result = await store.destroyChat(chatId, userId)
    
    if (!result.error) {
      revalidatePath('/')
    }
    
    return result
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error)
    return { error: 'Failed to delete chat' }
  }
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    const savedChat = await store.persistChat(chat, userId)
    
    revalidatePath('/')
    return savedChat
  } catch (error) {
    console.error('Error saving chat:', error)
    throw error
  }
}

export async function getSharedChat(id: string) {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    return await store.getSharedChat(id)
  } catch (error) {
    console.error('Error fetching shared chat:', error)
    return null
  }
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  try {
    const { useChatStore } = await import('@/lib/stores/chat')
    const store = useChatStore.getState()
    const sharedChat = await store.shareChat(id, userId)
    
    revalidatePath('/')
    return sharedChat
  } catch (error) {
    console.error('Error sharing chat:', error)
    return null
  }
}
