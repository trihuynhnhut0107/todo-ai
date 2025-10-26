import { getUser, signOut } from "@/services/auth";
import { User } from "@/type";
import { create } from "zustand";
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
    try {
      
      set({ user: null, isAuthenticated: false });
      await signOut();
    } catch (error) {
      console.log(error)
    }
  },

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getUser();

      if (user) {
        set({ isAuthenticated: false, user });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;