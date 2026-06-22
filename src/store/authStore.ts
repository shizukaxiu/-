import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'user' | 'admin'

export interface AuthUser {
  username: string
  role: UserRole
}

export interface AuthState {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
}

interface Credentials {
  username: string
  password: string
  role: UserRole
}

// 本地演示账号：111/111 普通用户，222/222 系统管理员
const LOCAL_CREDENTIALS: Credentials[] = [
  { username: '111', password: '111', role: 'user' },
  { username: '222', password: '222', role: 'admin' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: async (username: string, password: string) => {
        const trimmedUsername = username.trim()
        const trimmedPassword = password.trim()

        if (!trimmedUsername || !trimmedPassword) {
          throw new Error('请输入用户名和密码')
        }

        const matched = LOCAL_CREDENTIALS.find(
          (c) => c.username === trimmedUsername && c.password === trimmedPassword
        )

        if (!matched) {
          throw new Error('用户名或密码错误')
        }

        const user: AuthUser = {
          username: matched.username,
          role: matched.role,
        }

        set({ user })
        return user
      },

      logout: () => set({ user: null }),
    }),
    {
      name: 'medical-insurance-assistant-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
