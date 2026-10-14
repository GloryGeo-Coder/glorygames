/**
 * Serve Google's authorised seller record at https://webgamearena.com/ads.txt.
 *
 * No invalid placeholder is published: the endpoint responds 404 until a
 * valid publisher ID is provided through the existing AdSense client ID or
 * an optional dedicated ADSENSE_PUBLISHER_ID environment variable.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publisherId(): string | null {
  const publisher = (process.env.ADSENSE_PUBLISHER_ID ?? "").trim();
  if (/^pub-\d{16}$/.test(publisher)) return publisher;

  const client = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim();
  const match = /^ca-pub-(\d{16})$/.exec(client);
  return match ? `pub-${match[1]}` : null;
}

export async function GET() {
  const id = publisherId();

  if (!id) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
