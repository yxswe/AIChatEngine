## Areas
Auth && user profile

Chat message managemnet

## Todo
1. page.ts getModel 重新实现
2. zustand的生命周期管理缩短至 refresh？ 去掉周期性的与服务器同步这个功能改为refresh自动刷新，考虑问题：新tab上有了新会话之后，如果在老的tab上不刷新接着会话会不会冲突？
3. 如何保证后端api只有指定的前端能去访问


## Tech Stack

### State Management - Zustand

Zustand is a lightweight state management library used for managing global state in this project.

#### Core Features
- **Singleton Pattern**: Store created with `create()` function only creates instance on first call
- **Global Sharing**: All components share the same state instance
- **Persistence**: Supports persisting state to localStorage
- **TypeScript Friendly**: Full TypeScript support

#### Usage Example

```typescript
// Create store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      
      signIn: async (email: string, password: string) => {
        // Sign in logic
      },
      
      signOut: async () => {
        // Sign out logic
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ session: state.session })
    }
  )
)

// Use in components
const { user, signIn, signOut } = useAuthStore()
```

#### Project Implementation
- **Auth State Management**: [`lib/stores/auth.ts`](lib/stores/auth.ts) - User login, registration, session management
- **Session Persistence**: Automatically saves user session to local storage
- **Global State Sync**: All components share authentication state in real-time
