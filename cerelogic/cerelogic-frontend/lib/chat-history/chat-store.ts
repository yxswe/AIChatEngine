import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type Chat, type ExtendedCoreMessage } from '@/lib/types'
import { ChatService } from '@/lib/chat-history/chat-service'

interface ChatState {
  // State
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  lastSyncTime: number

  // Basic state management actions
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, updatedChat: Partial<Chat>) => void
  removeChat: (chatId: string) => void
  clearAllChats: () => void

  // Message management
  addMessage: (chatId: string, message: ExtendedCoreMessage) => void
  updateMessage: (chatId: string, messageId: string, content: string) => void

  // Cache and server sync methods (called by actions)
  fetchChats: (userId: string) => Promise<Chat[]>
  fetchChatsPage: (userId: string, limit?: number, offset?: number) => Promise<{ chats: Chat[]; nextOffset: number | null }>
  loadChat: (id: string, userId?: string) => Promise<Chat | null>
  persistChat: (chat: Chat, userId?: string) => Promise<Chat>
  destroyChat: (chatId: string, userId?: string) => Promise<{ error?: string }>
  clearAllChatsFromServer: (userId?: string) => Promise<{ error?: string }>
  shareChat: (id: string, userId?: string) => Promise<Chat | null>
  getSharedChat: (id: string) => Promise<Chat | null>

  // Sync management
  initializeStore: (userId: string) => Promise<void>
  syncWithServer: (userId: string) => Promise<void>
  startPeriodicSync: (userId: string, intervalMs?: number) => void
  stopPeriodicSync: () => void

  // Utility state management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void

  // Cache management
  getCachedChat: (chatId: string) => Chat | null
  isChatCached: (chatId: string) => boolean
}

const initialState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  lastSyncTime: 0,
}

let syncInterval: NodeJS.Timeout | null = null

export const useChatStore = create<ChatState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Basic state setters
      setChats: (chats) => {
        set((state) => {
          state.chats = chats
          state.lastSyncTime = Date.now()
        })
      },

      setCurrentChat: (chat) => {
        set((state) => {
          state.currentChat = chat
        })
      },

      addChat: (chat) => {
        set((state) => {
          const existingIndex = state.chats.findIndex((c: Chat) => c.id === chat.id)
          if (existingIndex !== -1) {
            state.chats[existingIndex] = chat
          } else {
            state.chats.unshift(chat)
          }
        })
      },

      updateChat: (chatId, updatedChat) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat: Chat) => chat.id === chatId)
          if (chatIndex !== -1) {
            state.chats[chatIndex] = { ...state.chats[chatIndex], ...updatedChat }
          }
          if (state.currentChat?.id === chatId) {
            state.currentChat = { ...state.currentChat, ...updatedChat }
          }
        })
      },

      removeChat: (chatId) => {
        set((state) => {
          state.chats = state.chats.filter((chat: Chat) => chat.id !== chatId)
          if (state.currentChat?.id === chatId) {
            state.currentChat = null
          }
        })
      },

      clearAllChats: () => {
        set((state) => {
          state.chats = []
          state.currentChat = null
        })
      },

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setError: (error) => {
        set((state) => {
          state.error = error
        })
      },

      reset: () => {
        set((state) => {
          Object.assign(state, initialState)
        })
        get().stopPeriodicSync()
      },

      // Message management
      addMessage: (chatId, message) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat: Chat) => chat.id === chatId)
          if (chatIndex !== -1) {
            state.chats[chatIndex].messages.push(message)
          }
          if (state.currentChat?.id === chatId) {
            state.currentChat.messages.push(message)
          }
        })
      },

      updateMessage: (chatId, messageId, content) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat: Chat) => chat.id === chatId)
          if (chatIndex !== -1) {
            const messageIndex = state.chats[chatIndex].messages.findIndex((msg: any) => msg.id === messageId)
            if (messageIndex !== -1) {
              state.chats[chatIndex].messages[messageIndex].content = content
            }
          }
          if (state.currentChat?.id === chatId) {
            const messageIndex = state.currentChat.messages.findIndex((msg: any) => msg.id === messageId)
            if (messageIndex !== -1) {
              state.currentChat.messages[messageIndex].content = content
            }
          }
        })
      },

      // Store initialization with server sync
      initializeStore: async (userId: string) => {
        const state = get()
        if (state.isInitialized) return

        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const chats = await ChatService.getChats(userId)

          set((state) => {
            state.chats = chats
            state.isInitialized = true
            state.isLoading = false
            state.lastSyncTime = Date.now()
          })

          // Start periodic sync after initialization
          get().startPeriodicSync(userId)
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to initialize store'
            state.isLoading = false
          })
        }
      },

      // Periodic sync with server
      syncWithServer: async (userId: string) => {
        try {
          const serverChats = await ChatService.getChats(userId)

          set((state) => {
            // Merge server data with local cache, preserving any unsaved local changes
            const mergedChats = [...serverChats]

            state.chats.forEach((localChat: Chat) => {
              const serverChatIndex = mergedChats.findIndex(serverChat => serverChat.id === localChat.id)
              if (serverChatIndex !== -1) {
                // If local chat has newer messages, keep local version
                const localMessageCount = localChat.messages.length
                const serverMessageCount = mergedChats[serverChatIndex].messages.length
                if (localMessageCount >= serverMessageCount) {
                  mergedChats[serverChatIndex] = localChat
                }
              } else {
                // Local chat not on server yet, keep it
                mergedChats.unshift(localChat)
              }
            })

            state.chats = mergedChats
            state.lastSyncTime = Date.now()
          })
        } catch (error) {
          console.error('Failed to sync with server:', error)
        }
      },

      startPeriodicSync: (userId: string, intervalMs = 30000) => {
        // Clear existing interval
        get().stopPeriodicSync()

        // Start new interval
        syncInterval = setInterval(() => {
          get().syncWithServer(userId)
        }, intervalMs)
      },

      stopPeriodicSync: () => {
        if (syncInterval) {
          clearInterval(syncInterval)
          syncInterval = null
        }
      },

      // Cache-first read methods
      fetchChats: async (userId: string) => {
        const state = get()

        // Initialize store if not done yet
        if (!state.isInitialized) {
          await get().initializeStore(userId)
          return state.chats
        }

        // Return cached data if available and recent (less than 5 minutes old)
        const cacheAge = Date.now() - state.lastSyncTime
        if (state.chats.length > 0 && cacheAge < 300000) {
          return state.chats
        }

        // Fetch fresh data from server
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const chats = await ChatService.getChats(userId)

          set((state) => {
            state.chats = chats
            state.isLoading = false
            state.lastSyncTime = Date.now()
          })

          return chats
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch chats'
            state.isLoading = false
          })
          // Return cached data if available, even if stale
          return state.chats
        }
      },

      fetchChatsPage: async (userId: string, limit = 20, offset = 0) => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const result = await ChatService.getChatsPage(userId, limit, offset)

          set((state) => {
            if (offset === 0) {
              state.chats = result.chats
            } else {
              state.chats.push(...result.chats)
            }
            state.isLoading = false
            state.lastSyncTime = Date.now()
          })

          return result
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch chat page'
            state.isLoading = false
          })
          return { chats: [], nextOffset: null }
        }
      },

      loadChat: async (id: string, userId = 'anonymous') => {
        // Check cache first
        const cachedChat = get().getCachedChat(id)
        if (cachedChat) {
          set((state) => {
            state.currentChat = cachedChat
          })
          return cachedChat
        }

        // Fetch from server if not in cache
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const chat = await ChatService.getChat(id, userId)

          set((state) => {
            state.currentChat = chat
            if (chat) {
              // Add to cache
              const existingIndex = state.chats.findIndex((c: Chat) => c.id === chat.id)
              if (existingIndex !== -1) {
                state.chats[existingIndex] = chat
              } else {
                state.chats.unshift(chat)
              }
            }
            state.isLoading = false
          })

          return chat
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch chat'
            state.isLoading = false
          })
          return null
        }
      },

      // Write methods with immediate sync
      persistChat: async (chat: Chat, userId = 'anonymous') => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          // Optimistic update
          get().addChat(chat)

          // Save to server
          const savedChat = await ChatService.saveChat(chat, userId)

          // Update cache with server response
          get().addChat(savedChat)

          set((state) => {
            state.isLoading = false
          })

          // Trigger immediate sync to get any other changes
          get().syncWithServer(userId)

          return savedChat
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to save chat'
            state.isLoading = false
          })
          throw error
        }
      },

      destroyChat: async (chatId: string, userId = 'anonymous') => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          // Optimistic update
          get().removeChat(chatId)

          // Delete from server
          await ChatService.deleteChat(chatId, userId)

          set((state) => {
            state.isLoading = false
          })

          // Trigger immediate sync
          get().syncWithServer(userId)

          return {}
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to delete chat'
            state.isLoading = false
          })
          return { error: 'Failed to delete chat' }
        }
      },

      clearAllChatsFromServer: async (userId = 'anonymous') => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          // Optimistic update
          get().clearAllChats()

          // Clear on server
          await ChatService.clearChats(userId)

          set((state) => {
            state.isLoading = false
          })

          // Trigger immediate sync
          get().syncWithServer(userId)

          return {}
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to clear chats'
            state.isLoading = false
          })
          return { error: 'Failed to clear chats' }
        }
      },

      shareChat: async (id: string, userId = 'anonymous') => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const sharedChat = await ChatService.shareChat(id, userId)

          if (sharedChat) {
            get().updateChat(id, { sharePath: sharedChat.sharePath })
          }

          set((state) => {
            state.isLoading = false
          })

          // Trigger immediate sync
          get().syncWithServer(userId)

          return sharedChat
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to share chat'
            state.isLoading = false
          })
          return null
        }
      },

      getSharedChat: async (id: string) => {
        try {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          const chat = await ChatService.getSharedChat(id)

          set((state) => {
            state.isLoading = false
          })

          return chat
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch shared chat'
            state.isLoading = false
          })
          return null
        }
      },

      // Cache management
      getCachedChat: (chatId) => {
        const state = get()
        return state.chats.find((chat: Chat) => chat.id === chatId) || null
      },

      isChatCached: (chatId) => {
        const state = get()
        return state.chats.some((chat: Chat) => chat.id === chatId)
      },
    })),
    {
      name: 'chat-store',
    }
  )
)
