import { getNeonSql } from "@/lib/neon";

export class CommunityInputError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function communityBody(request: Request): Promise<Record<string, unknown>> {
  let origin: string;
  try { origin = new URL(request.headers.get("origin") || "").origin; }
  catch { throw new CommunityInputError(403, "Same-origin request required."); }
  if (origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new CommunityInputError(403, "Same-origin request required.");
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new CommunityInputError(415, "JSON required.");
  const reader = request.body?.getReader();
  if (!reader) throw new CommunityInputError(400, "Missing request body.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 4096) { await reader.cancel(); throw new CommunityInputError(413, "Request too large."); }
    chunks.push(value);
  }
  const input = new Uint8Array(bytes); let offset = 0;
  for (const chunk of chunks) { input.set(chunk, offset); offset += chunk.byteLength; }
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder().decode(input)); }
  catch { throw new CommunityInputError(400, "Invalid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new CommunityInputError(400, "Invalid request.");
  return parsed as Record<string, unknown>;
}

export function communityName(value: unknown) {
  const name = typeof value === "string" ? value.replace(/[^\w\s.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 40) : "";
  return name && !/\d{7,}/.test(name) ? name : "Guest Player";
}

export function communityText(value: unknown) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (!text || text.length > 180 || /https?:|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){7,}|(.)\1{8,}|<\/?[a-z]/i.test(text)
    || /\b(?:fuck|shit|cunt|porn|nudes?|sexchat)\b/i.test(text)) {
    throw new CommunityInputError(400, "Message blocked. Keep chat respectful and free of links or personal details.");
  }
  return text;
}

export function communityScore(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > 2_000_000_000) throw new CommunityInputError(400, "Invalid score.");
  return value;
}

export async function communityRateKey(request: Pick<Request, "headers">, actor?: string | null) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new CommunityInputError(503, "Community service unavailable.");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const scope = actor ? `account:${actor}` : `network:${request.headers.get("cf-connecting-ip") || "unknown"}`;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`wga-community-v1:${scope}`));
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
}

// Match the existing revocation writer: leave the role read-only by default,
// and open only this transaction for one narrowly granted server function.
export async function communityWrite(query: (sql: ReturnType<typeof getNeonSql>) => any) {
  const sql = getNeonSql();
  const results = await sql.transaction([sql`SET TRANSACTION READ WRITE`, query(sql)], { readOnly: false });
  return results[1] as Record<string, any>[];
}

export function communityError(error: unknown) {
  const status = error instanceof CommunityInputError ? error.status : error instanceof Error && error.message.includes("community_rate_limited") ? 429 : 503;
  const message = error instanceof CommunityInputError ? error.message : status === 429 ? "Too many requests. Please wait and try again." : "Community service unavailable.";
  return Response.json({ ok: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
