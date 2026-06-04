"use client";

import { create } from "zustand";
import type { ApiUser } from "@/lib/api";

type AuthState = {
  user?: ApiUser;
  token?: string;
  hydrated: boolean;
  setSession: (user: ApiUser, token: string) => void;
  hydrate: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  setSession: (user, token) => {
    localStorage.setItem("bookleaf.token", token);
    localStorage.setItem("bookleaf.user", JSON.stringify(user));
    set({ user, token, hydrated: true });
  },
  hydrate: () => {
    const token = localStorage.getItem("bookleaf.token") ?? undefined;
    const raw = localStorage.getItem("bookleaf.user");
    set({ token, user: raw ? JSON.parse(raw) : undefined, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem("bookleaf.token");
    localStorage.removeItem("bookleaf.user");
    set({ user: undefined, token: undefined, hydrated: true });
  }
}));
