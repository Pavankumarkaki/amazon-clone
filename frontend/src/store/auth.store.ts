import { create } from "zustand";
import { apiClient, setAccessToken } from "@/lib/apiClient";
import { getQueryClient } from "@/lib/queryClientRegistry";
import { queryKeys } from "@/lib/queryKeys";
import type { TokenResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const data = await apiClient<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.access_token);
    const user = await apiClient<User>("/auth/me");
    const { mergeGuestCartToServer } = await import("@/hooks/useCart");
    await mergeGuestCartToServer();
    set({ user });
  },

  register: async (email, password, fullName) => {
    await apiClient<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    await useAuthStore.getState().login(email, password);
  },

  logout: async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setAccessToken(null);
    set({ user: null });
    getQueryClient()?.removeQueries({ queryKey: queryKeys.cart.all });
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const user = await apiClient<User>("/auth/me");
      const { mergeGuestCartToServer } = await import("@/hooks/useCart");
      await mergeGuestCartToServer();
      set({ user, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isLoading: false });
    }
  },
}));
