import Link from "next/link";
export const metadata = {title:"Game Saves & Resume | WebGameArena", description:"How to resume Math Sprint Arena, Science Lab Dash and Recycle Rush in the same browser.", alternates:{canonical:"/game-saves"}};
export default function Saves(){
  return <article className="container section"><Link href="/games">← Games</Link><h1>Game Saves &amp; Resume</h1>
    <p>Return with the same browser profile on the same device. Clearing site data or ending a private browsing session can erase a local save.</p>
    <h2>Math Sprint Arena</h2><p>Choose the same grade and select <strong>Continue Adventure</strong>. In Grade 4, we returned to puzzle two of Place Value Power after leaving. After finishing all five puzzles and starting Number Line Bridge, we closed the tab and returned to the first puzzle of that mission.</p>
    <Link href="/play/math-sprint-arena">Open Math Sprint Arena</Link>
    <h2>Science Lab Dash</h2><p>Finish the first mission before leaving. When you reopen the game, choose <strong>Continue adventure</strong>. Our return visit opened mission two, The Cold-Room Trail, with its own investigation counters.</p>
    <Link href="/play/science-lab-dash">Open Science Lab Dash</Link>
    <h2>Recycle Rush Story</h2><p>Reopen Story and select <strong>Wake the Workshop</strong> on the mission list. Check Recovery points and the collection counter. Our return visit restored 100 points and one collected item in the first mission.</p>
    <Link href="/play/recycle-rush">Open Recycle Rush</Link>
    <p>A leaderboard score records a result. To continue a campaign, use the game's own mission or Continue screen.</p>
  </article>;
}
