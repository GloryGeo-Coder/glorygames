import Link from "next/link";
export const metadata = {title:"Game Updates | WebGameArena",description:"See what changed in the games and try the updated features.",alternates:{canonical:"/game-updates"}};
export default function Updates(){
  return <article className="container section board"><h1>Game updates</h1>
    <section className="heroCard"><time dateTime="2026-11-23">23 November 2026</time><h2>Recycle Rush sorting is easier to read</h2>
      <p>In Story mode, Circuit now leaves room for the selected item's label. Arcade sorting instructions have a solid backdrop, and lifting a second finger keeps your first drag active.</p>
      <img className="updateShot" src="/images/editorial/recycle-arcade.jpg" alt="Recycle Rush Arcade with the sorting instruction above the play area" width={1440} height={900}/>
      <Link href="/play/recycle-rush">Try a sorting round</Link></section>
    <section className="heroCard"><time dateTime="2026-11-21">21 November 2026</time><h2>Leaderboards and game chat are back</h2>
      <p>Browse past scores on the leaderboard. Each supported game page has its own chat for tips and questions.</p><Link href="/leaderboard">Browse the leaderboard</Link></section>
    <Link href="/community">Join the community discussion</Link></article>;
}
