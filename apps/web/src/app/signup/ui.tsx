"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Signup failed");
      }

      router.refresh();
      router.push("/games");
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="heroCard" style={{ padding: 22, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Create account</h2>

      <form onSubmit={onSubmit} className="toolbar" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="input"
          placeholder="Password (min 8 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button className="cta" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>

        {err ? (
          <div style={{ color: "rgba(255,120,120,.95)", fontWeight: 800 }}>{err}</div>
        ) : null}

        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>
          Already have an account? <Link className="pill" href="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
