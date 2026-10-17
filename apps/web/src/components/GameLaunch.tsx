import { GameThumb } from "@/components/GameThumb";
import styles from "./GameLaunch.module.css";

export default function GameLaunch({ slug, title }: { slug: string; title: string }) {
  return (
    <section className={styles.launch} aria-label={`Launch ${title}`}>
      <div className={styles.art}><GameThumb slug={slug} title={title} /></div>
      <div className={styles.content}>
        <p className={styles.label}>READY TO PLAY</p>
        <h2>{title}</h2>
        <a className={styles.play} href={`/games/${encodeURIComponent(slug)}/index.html`} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">▶</span> Play Game
          <span className={styles.srOnly}> — opens in a new tab</span>
        </a>
        <p className={styles.note}>Opens in a dedicated game tab. Use Enter Fullscreen in the game menu where your browser supports it.</p>
        <p className={styles.note}>Keep this page open for scores, instructions and chat.</p>
      </div>
    </section>
  );
}
