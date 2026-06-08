// apps/web/src/lib/useCurrentUser.ts

"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (data?.ok && data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName || "Player",
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

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

        if (cancelled) return;

        if (data?.ok && data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            displayName: data.user.displayName || "Player",
          });
        } else {
          setUser(null);
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

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    loading,
    displayName: user?.displayName ?? null,
    reload: loadUser,
  };
}