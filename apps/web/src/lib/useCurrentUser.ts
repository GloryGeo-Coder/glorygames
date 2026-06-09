// apps/web/src/lib/useCurrentUser.ts

"use client";

import { useCallback, useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
};

function normalizeUser(data: any): CurrentUser | null {
  const rawUser = data?.user ?? null;

  if (!rawUser?.id || !rawUser?.email) {
    return null;
  }

  return {
    id: String(rawUser.id),
    email: String(rawUser.email),
    displayName: String(rawUser.displayName || "Player"),
  };
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      setUser(normalizeUser(data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!cancelled) {
          setUser(normalizeUser(data));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    function onUserChanged() {
      run();
    }

    function onFocus() {
      run();
    }

    run();

    window.addEventListener("wga:user-changed", onUserChanged);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("wga:user-changed", onUserChanged);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return {
    user,
    loading,
    displayName: user?.displayName ?? null,
    reload: loadUser,
  };
}
