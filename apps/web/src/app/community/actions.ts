"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { communityText, communityWrite, communityRateKey, CommunityInputError } from "@/lib/communityHttp";
import { headers } from "next/headers";

export async function communityAction(form: FormData) {
  const incoming = await headers();
  const origin = incoming.get("origin");
  if (!origin || new URL(origin).host !== incoming.get("host") || incoming.get("sec-fetch-site") === "cross-site") {
    throw new Error("Same-origin form required");
  }
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const action = String(form.get("action") || "");
  const id = String(form.get("id") || "");
  const post = String(form.get("post") || "");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const page = Math.max(1,Math.min(100000,Number(form.get("page")) || 1));
  let notice = "failed";
  try {
    if (!uuid.test(id)) throw new Error("Invalid identifier");
    if (["like","unlike","comment"].includes(action) && uuid.test(post)) {
      const body = action === "comment" ? communityText(form.get("body")) : "";
      const key = action === "comment" ? await communityRateKey({headers: incoming}, user.id) : "";
      await communityWrite(sql => sql`SELECT wga_board.respond(${user.id},${post}::uuid,${id}::uuid,${action},${body},${key})`);
      notice = action === "comment" ? "queued" : "saved";
    } else if (["publish","approve","remove"].includes(action)) {
      const title = String(form.get("title") || "").trim();
      const body = String(form.get("body") || "").trim();
      if (action === "publish" && (!title || title.length > 100 || !body || body.length > 1800)) throw new Error("Invalid post");
      await communityWrite(sql => sql`SELECT wga_board.edit(${user.id},${action},${id}::uuid,${title},${body})`);
      notice = "saved";
    }
  } catch (err) {
    if (err instanceof CommunityInputError) notice = "blocked";
    if (err instanceof Error && err.message.includes("community_rate_limited")) notice = "wait";
  }
  const params = new URLSearchParams({page:String(page),notice});
  if (uuid.test(post)) params.set("post",post);
  redirect("/community?" + params.toString() + (uuid.test(post) ? "#p-" + post : ""));
}
