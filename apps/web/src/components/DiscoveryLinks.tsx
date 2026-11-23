import Link from "next/link";

export default function DiscoveryLinks() {
  return <nav className="discoveryLinks" aria-label="Explore the library">
    <Link className="pill" href="/learning-arcade">Learning Arcade</Link>
    <Link className="pill" href="/quick-play">Quick Play</Link>
    <Link className="pill" href="/game-saves">Game Saves &amp; Resume</Link>
    <Link className="pill" href="/community">Community updates</Link>
  </nav>;
}
