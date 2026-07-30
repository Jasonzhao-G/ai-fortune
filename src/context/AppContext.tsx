"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, type Locale, type Theme, type Translations } from "@/lib/i18n";
import type { UserProfile } from "@/lib/types";
import { getOrCreateUser } from "@/lib/user-store";
import { registerReferral } from "@/lib/community-store";

interface AppContextValue {
  locale: Locale;
  theme: Theme;
  t: Translations;
  user: UserProfile | null;
  setLocale: (l: Locale) => void;
  setTheme: (t: Theme) => void;
  refreshUser: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") ?? undefined;
    const u = getOrCreateUser(ref);
    if (ref && ref !== u.id && u.referredBy === ref) {
      registerReferral(ref, u.id);
    }
    setUser(u);

    try {
      const savedLocale = localStorage.getItem("ai-fortune-locale") as Locale | null;
      const savedTheme = localStorage.getItem("ai-fortune-theme") as Theme | null;
      if (savedLocale === "zh" || savedLocale === "en") setLocaleState(savedLocale);
      const th = savedTheme === "light" ? "light" : "dark";
      setThemeState(th);
      applyTheme(th);
    } catch { /* ignore */ }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("ai-fortune-locale", l); } catch { /* ignore */ }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem("ai-fortune-theme", t); } catch { /* ignore */ }
    applyTheme(t);
  }, []);

  const refreshUser = useCallback(() => setUser(getOrCreateUser()), []);

  const t = translations[locale];

  return (
    <AppContext.Provider value={{ locale, theme, t, user, setLocale, setTheme, refreshUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
