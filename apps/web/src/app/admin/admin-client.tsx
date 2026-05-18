"use client";

import { useEffect, useMemo, useState } from "react";

type SyncResult = {
  ok: boolean;
  dryRun: boolean;
  deleteMissing: boolean;
  totals: { scanned: number; created: number; updated: number; unchanged: number; deleted: number };
  created: string[];
  updated: string[];
  unchanged: string[];
  deleted: string[];
  error?: string;
};

function Badge({ label }: { label: string }) {
  return (
    <span className="badge" style={{ cursor: "default" }}>
      {label}
    </span>
  );
}

function ListTable({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="heroCard" style={{ padding: 14, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <b>{title}</b>
        <span className="pill" aria-disabled="true">
          {items.length}
        </span>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((s) => (
          <span key={s} className="pill" style={{ cursor: "default" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminClient() {
  // Admin key + sync state
  const [adminKey, setAdminKey] = useState("");
  const [remember, setRemember] = useState(true);

  const [dryRun, setDryRun] = useState(false);
  const [deleteMissing, setDeleteMissing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create-game state (MUST be inside the component)
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("arcade,2d");
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Load saved key
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gg_admin_key");
      if (saved) setAdminKey(saved);
    } catch {}
  }, []);

  const canRun = useMemo(() => adminKey.trim().length >= 6 && !loading, [adminKey, loading]);

  async function runSync() {
    setError(null);
    setResult(null);
    setLoading(true);

    const key = adminKey.trim();

    try {
      if (remember) {
        try {
          localStorage.setItem("gg_admin_key", key);
        } catch {}
      }

      const qs = new URLSearchParams();
      if (dryRun) qs.set("dry", "1");
      if (deleteMissing) qs.set("deleteMissing", "1");

      const url = `/api/admin/sync-games${qs.toString() ? `?${qs}` : ""}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "x-admin-key": key },
      });

      const json = (await res.json().catch(() => null)) as SyncResult | null;

      if (!res.ok) {
        setError(json?.error || `Request failed (${res.status})`);
        return;
      }

      setResult(json);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function createGame() {
    setCreateErr(null);
    setCreateMsg(null);

    const key = adminKey.trim();
    if (!key) {
      setCreateErr("Enter admin key first.");
      return;
    }

    try {
      if (remember) {
        try {
          localStorage.setItem("gg_admin_key", key);
        } catch {}
      }

      const payload = {
        slug: newSlug,
        title: newTitle,
        description: newDesc,
        tags: newTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/admin/create-game", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setCreateErr(json?.error || `Create failed (${res.status})`);
        return;
      }

      setCreateMsg(`✅ Created: /public/games/${json.slug} (now click "Sync now")`);
      setNewSlug("");
      setNewTitle("");
      setNewDesc("");
      // keep tags
    } catch (e: any) {
      setCreateErr(e?.message || "Network error");
    }
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    } catch {}
  }

  function clearSavedKey() {
    try {
      localStorage.removeItem("gg_admin_key");
    } catch {}
    setAdminKey("");
  }

  return (
    <div className="adminWrap">
      {/* ADMIN KEY + SYNC */}
      <div className="heroCard" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <b>Sync Games</b>
            <div style={{ color: "rgba(255,255,255,.65)", marginTop: 6 }}>
              Scans <span className="pill" aria-disabled="true">/public/games/*</span> and upserts into the DB.
              <div style={{ marginTop: 6 }}>
                Convention: each game must have{" "}
                <span className="pill" aria-disabled="true">/public/games/&lt;slug&gt;/index.html</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge label="POST /api/admin/sync-games" />
            {dryRun ? <Badge label="Dry run" /> : null}
            {deleteMissing ? <Badge label="Delete missing" /> : null}
          </div>
        </div>

        <div className="toolbar" style={{ marginTop: 14 }}>
          <input
            className="input"
            placeholder="Admin key (x-admin-key)…"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            type="password"
            autoComplete="off"
          />

          <button className="cta" onClick={runSync} disabled={!canRun}>
            {loading ? "Syncing…" : "Sync now"}
          </button>

          <button className="pill" onClick={clearSavedKey} disabled={loading}>
            Clear saved key
          </button>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={loading} />
            <span style={{ color: "rgba(255,255,255,.75)" }}>Remember key on this device</span>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} disabled={loading} />
            <span style={{ color: "rgba(255,255,255,.75)" }}>Dry run (no DB writes)</span>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={deleteMissing}
              onChange={(e) => setDeleteMissing(e.target.checked)}
              disabled={loading}
            />
            <span style={{ color: "rgba(255,255,255,.75)" }}>Delete DB games missing on disk</span>
          </label>
        </div>

        {error ? (
          <div className="heroCard" style={{ padding: 14, marginTop: 12, borderColor: "rgba(239,68,68,.35)" }}>
            <b style={{ color: "rgba(255,255,255,.95)" }}>Error</b>
            <div style={{ color: "rgba(255,255,255,.75)", marginTop: 6 }}>{error}</div>
          </div>
        ) : null}

        {result ? (
          <div className="heroCard" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <b>Sync complete</b>
                <div style={{ color: "rgba(255,255,255,.65)", marginTop: 6 }}>
                  Scanned <b style={{ color: "rgba(255,255,255,.92)" }}>{result.totals.scanned}</b>
                  {" • "}Created <b style={{ color: "rgba(255,255,255,.92)" }}>{result.totals.created}</b>
                  {" • "}Updated <b style={{ color: "rgba(255,255,255,.92)" }}>{result.totals.updated}</b>
                  {" • "}Unchanged <b style={{ color: "rgba(255,255,255,.92)" }}>{result.totals.unchanged}</b>
                  {" • "}Deleted <b style={{ color: "rgba(255,255,255,.92)" }}>{result.totals.deleted}</b>
                </div>
              </div>

              <button className="pill" onClick={copyResult}>Copy JSON</button>
            </div>
          </div>
        ) : null}
      </div>

      {/* CREATE GAME */}
      <div className="heroCard" style={{ padding: 16, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <b>Create New Game</b>
            <div style={{ color: "rgba(255,255,255,.65)", marginTop: 6 }}>
              Copies <span className="pill" aria-disabled="true">/public/games/_template</span> into a new folder and writes{" "}
              <span className="pill" aria-disabled="true">game.json</span>.
            </div>
          </div>

          <button className="cta" onClick={createGame} disabled={loading}>
            Create game
          </button>
        </div>

        <div className="toolbar" style={{ marginTop: 12 }}>
          <input className="input" placeholder="slug (e.g. neon-dodger)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
          <input className="input" placeholder="Title (optional)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>

        <div style={{ marginTop: 10 }}>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 90, paddingTop: 10 }}
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="tags (comma separated) e.g. arcade,2d,keyboard"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />
        </div>

        {createErr ? (
          <div className="heroCard" style={{ padding: 12, marginTop: 12, borderColor: "rgba(239,68,68,.35)" }}>
            <b>Error</b>
            <div style={{ color: "rgba(255,255,255,.75)", marginTop: 6 }}>{createErr}</div>
          </div>
        ) : null}

        {createMsg ? (
          <div className="heroCard" style={{ padding: 12, marginTop: 12 }}>
            <b>Success</b>
            <div style={{ color: "rgba(255,255,255,.75)", marginTop: 6 }}>{createMsg}</div>
          </div>
        ) : null}
      </div>

      {/* RESULT LISTS */}
      {result ? (
        <>
          <ListTable title="Created" items={result.created} />
          <ListTable title="Updated" items={result.updated} />
          <ListTable title="Unchanged" items={result.unchanged} />
          <ListTable title="Deleted" items={result.deleted} />
        </>
      ) : null}
    </div>
  );
}
