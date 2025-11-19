import { create } from "zustand";
import { clearTokens, getRefreshToken } from "@/store/storage";
import { getToken, getUser, signOut } from "@/services/auth";
import { User } from "@/types/auth";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (state: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (state: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (state) => set({ isAuthenticated: state }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    set({ user: null, isAuthenticated: false });
    await clearTokens();
  },

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });

    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        const user = await getUser();
        set({ isAuthenticated: !!user, user });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
