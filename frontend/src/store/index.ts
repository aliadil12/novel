

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Novel, User } from '@/types'
import { 
  fetchNovels as apiFetchNovels, 
  login as apiLogin, 
  register as apiRegister, 
  updateProfile as apiUpdateProfile, 
  getUser as apiGetUser, 
  logout as apiLogout 
} from '@/lib/api'
import Cookies from 'js-cookie'

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  updateProfile: (data: FormData) => Promise<User>
  fetchUser: () => Promise<void>
}

interface NovelState {
  novels: Novel[]
  fetchNovels: () => Promise<void>
}

interface FavoriteState {
  favorites: string[]
  addFavorite: (novelId: string) => void
  removeFavorite: (novelId: string) => void
  isFavorite: (novelId: string) => boolean
}

interface AppState extends AuthState, NovelState, FavoriteState {}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const { user, token } = await apiLogin(email, password);
        set({ user, token });
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 }); // Set cookie to expire in 7 days
      },
      logout: async () => {
        await apiLogout();
        set({ user: null, token: null });
        localStorage.removeItem('token');
        Cookies.remove('token');
      },
      register: async (name: string, email: string, password: string) => {
        const { user, token } = await apiRegister(name, email, password)
        set({ user, token })
      },
      updateProfile: async (formData: FormData) => {
        const updatedUser = await apiUpdateProfile(formData)
        set({ user: updatedUser })
        return updatedUser
      },
      fetchUser: async () => {
        try {
          const { user } = await apiGetUser()
          set({ user })
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      },

      // Novel State
      novels: [],
      fetchNovels: async () => {
        try {
          const novels = await apiFetchNovels();
          console.log('Fetched novels in store:', novels); // أضف هذا السطر للتحقق
          set({ novels });
        } catch (error) {
          console.error('Error fetching novels:', error);
        }
      },

      // Favorite State
      favorites: [],
      addFavorite: (novelId: string) => {
        set((state) => ({
          favorites: [...state.favorites, novelId]
        }))
      },
      removeFavorite: (novelId: string) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== novelId)
        }))
      },
      isFavorite: (novelId: string) => {
        return get().favorites.includes(novelId)
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        token: state.token,
        favorites: state.favorites
      }),
    }
  )
)

export default useAppStore

