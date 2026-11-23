import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getNeonSql } from "@/lib/neon";
import { communityAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {title:"Community | WebGameArena",description:"Read updates from the game developers and join the discussion.",alternates:{canonical:"/community"}};
type Params = {page?:string; post?:string; replies?:string; notice?:string};
type Post = {id:string; title:string; body:string; published:string; likes:string; liked:boolean};
type Reply = {id:string;body:string;title?:string};
function pageNum(value?:string) {
  return /^\d{1,5}$/.test(value || "") ? Math.max(1,Number(value)) : 1;
}
const notices:Record<string,string> = {saved:"Change saved.",queued:"Comment sent for review.",failed:"Could not save the change. Refresh and try again.",blocked:"Use up to 180 characters. Leave out personal details, links and offensive language.",wait:"Please wait a moment before commenting again."};

function Fields({action,id,post,page}:{action:string;id:string;post?:string;page:number}) {
  return <><input type="hidden" name="action" value={action}/><input type="hidden" name="id" value={id}/>
    <input type="hidden" name="page" value={page}/>{post && <input type="hidden" name="post" value={post}/>}</>;
}

export default async function Community({searchParams}:{searchParams:Promise<Params>}) {
  const q = await searchParams;
  const page = pageNum(q.page), replies = pageNum(q.replies);
  const user = await getSessionUser();
  let posts:Post[] = [], comments:Reply[] = [], pending:Reply[] = [];
  let editor = false, available = false;
  try {
    const sql = getNeonSql();
    const [feed, permissions] = await Promise.all([
      sql`SELECT * FROM wga_board.feed(${user?.id ?? null},${page})`,
      user ? sql`SELECT wga_board.is_editor(${user.id}) AS editor` : Promise.resolve([]),
    ]);
    posts = feed as Post[];
    editor = permissions[0]?.editor === true;
    if (q.post && posts.slice(0,10).some(p=>p.id===q.post)) comments = await sql`SELECT * FROM wga_board.replies(${q.post}::uuid,${replies})` as Reply[];
    if (editor && user) pending = await sql`SELECT * FROM wga_board.pending(${user.id})` as Reply[];
    available = true;
  } catch { /* Keep editorial updates readable during database maintenance. */ }
  return <div className="container section board"><h1>Community</h1>
    <p>Game updates from the WebGameArena team and conversations with players.</p>
    <Link href="/game-updates">Game updates archive</Link>{" · "}<Link href="/community-guidelines">Community guidelines</Link>{" · "}<Link href="/contact">Report a concern</Link>
    {q.notice && notices[q.notice] && <p role="status">{notices[q.notice]}</p>}
    {!available && <p role="status">Community posts and reactions are temporarily unavailable.</p>}
    {available && editor && <section className="heroCard"><h2>Publish a post</h2>
      <form action={communityAction}><Fields action="publish" id={crypto.randomUUID()} page={1}/>
        <label>Title<input name="title" required maxLength={100}/></label>
        <label>Post<textarea name="body" required maxLength={1800} rows={4}/></label><button className="pill">Publish post</button>
      </form>
      <h2>Comment review</h2>{!pending.length && <p>No comments waiting.</p>}
      {pending.map(c=><div key={c.id}><strong>{c.title}</strong><p>{c.body}</p><form action={communityAction}>
        <input type="hidden" name="id" value={c.id}/><button name="action" value="approve">Approve</button>{" "}<button name="action" value="remove">Reject</button></form></div>)}
    </section>}
    {available && posts.length===0 && <p>{page===1 ? "The team hasn't published a discussion yet." : "No more posts."}</p>}
    {available && posts.slice(0,10).map(p=>{
      const url = "/community?page="+page+"&post="+p.id;
      return <article className="heroCard" key={p.id} id={"p-"+p.id}><time dateTime={new Date(p.published).toISOString()}>{new Date(p.published).toLocaleDateString("en-ZA",{timeZone:"Africa/Johannesburg",dateStyle:"long"})}</time>
        <h2>{p.title}</h2><p className="boardBody">{p.body}</p><p>{p.likes} {Number(p.likes)===1?"like":"likes"}</p>
        {user && <form action={communityAction}><Fields action={p.liked?"unlike":"like"} id={p.id} post={p.id} page={page}/><button aria-pressed={p.liked}>{p.liked?"Unlike":"Like"}</button></form>}
        {q.post!==p.id ? <Link href={url+"#p-"+p.id}>View discussion</Link> : <>
          <h3>Comments</h3>{!comments.length && <p>No published comments on this page.</p>}
          {comments.slice(0,20).map(c=><div key={c.id}><p>{c.body}</p>{editor && <form action={communityAction}><Fields action="remove" id={c.id} post={p.id} page={page}/><button>Remove comment</button></form>}</div>)}
          {replies>1 && <Link href={url+"&replies="+(replies-1)+"#p-"+p.id}>Newer comments </Link>}
          {comments.length>20 && <Link href={url+"&replies="+(replies+1)+"#p-"+p.id}>Older comments</Link>}
          {user ? <form action={communityAction}><Fields action="comment" id={crypto.randomUUID()} post={p.id} page={page}/>
            <label>Comment<textarea name="body" maxLength={180} required rows={2}/></label><small>Comments are reviewed before publication. Leave out names and contact details.</small>
            <button>Send for review</button></form> : <Link href="/login">Sign in to like or comment</Link>}
        </>}
      </article>;
    })}
    <nav className="discoveryLinks" aria-label="Community pages">{page>1 && <Link href={"/community?page="+(page-1)}>Newer posts</Link>}{posts.length>10 && <Link href={"/community?page="+(page+1)}>Older posts</Link>}</nav>
  </div>;
}
