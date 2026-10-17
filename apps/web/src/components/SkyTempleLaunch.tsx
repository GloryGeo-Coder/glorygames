import { GameThumb } from "@/components/GameThumb";
import { SKY_TEMPLE } from "@/lib/skyTempleLaunch";
import styles from "./SkyTempleLaunch.module.css";

export default function SkyTempleLaunch() {
  return (
    <section className={styles.launch} aria-label="Launch Sky Temple 3D">
      <div className={styles.art}>
        <GameThumb slug={SKY_TEMPLE.slug} title={SKY_TEMPLE.title} />
      </div>
      <div className={styles.content}>
        <p className={styles.chapter}>FOUR WORLDS · FOUR GUARDIANS</p>
        <h2>Rise of the Relic Master</h2>
        <p>Explore floating islands, crystal caverns, stormy citadels and a sunlit sanctuary.</p>
        <a className={styles.play} href={SKY_TEMPLE.href} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">▶</span> Play Game
          <span className={styles.srOnly}> — opens in a new tab</span>
        </a>
        <p className={styles.note}>Opens in a new tab with the full window for your adventure. Your progress, audio settings and scores stay on this device.</p>
      </div>
    </section>
  );
}
