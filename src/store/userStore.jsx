import { create } from "zustand"
import { sendRequest } from "../utils/functions"

const useUserStore = create((set, get) => ({
  user: null,
  loading: true,

  fetchUser: async () => {

    set({ loading: true })

    try {

      const res = await sendRequest("GET", null, "/auth/me")

      if (res?.success && res?.user) {
        set({ user: res.user, loading: false })
      } 
      else if (res?.success && res?.data) {
        set({ user: res.data, loading: false })
      } 
      else {
        set({ user: null, loading: false })
      }

    } catch (error) {

      set({ user: null, loading: false })

    }
  },

  clearUser: () => {
    set({ user: null })
  },

  isAuthenticated: () => {
    return !!get().user
  },

  getUserProfile: () => {
    return get().user?.profile || null
  },

  // 🆕 NUEVA ACCIÓN: Modifica directamente el estado local en memoria
  updateLocalAvatar: (newAvatarUrl) => {
    set((state) => {
      if (!state.user) return {};

      // Caso A: Tu store tiene la estructura anidada { success: true, user: { user: { avatar, ... } } }
      if (state.user.user) {
        return {
          user: {
            ...state.user,
            user: { 
              ...state.user.user, 
              avatar: newAvatarUrl 
            }
          }
        };
      } 
      
      // Caso B: Tu store tiene la estructura plana { success: true, user: { avatar, ... } }
      return {
        user: { 
          ...state.user, 
          avatar: newAvatarUrl 
        }
      };
    });
  }

}))

export default useUserStore