"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Login failed");
      }

      router.refresh();
      router.push("/games");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="heroCard" style={{ padding: 22, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Sign in</h2>

      <form onSubmit={onSubmit} className="toolbar" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button className="cta" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {err ? (
          <div style={{ color: "rgba(255,120,120,.95)", fontWeight: 800 }}>{err}</div>
        ) : null}

        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>
          Don’t have an account? <Link className="pill" href="/signup">Create one</Link>
        </div>
      </form>
    </div>
  );
}
