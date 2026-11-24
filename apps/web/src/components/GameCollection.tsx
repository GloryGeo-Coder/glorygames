import Link from "next/link";
import { GameThumb } from "@/components/GameThumb";
import { gamePagePath } from "@/lib/gamePaths";

type Pick = { slug: string; title: string; goal: string; controls: string; screenshot?: string; alt?: string };
export default function GameCollection({title, intro, games}: {title: string; intro: string; games: Pick[]}) {
  return <div className="container section"><Link href="/games">← Games</Link>
    <h1>{title}</h1><p>{intro}</p><div className="grid">{games.map(game =>
      <Link className="tile" key={game.slug} href={gamePagePath(game.slug)}>
        <div className="thumb thumbWrap" style={{position:"relative"}}>{game.screenshot ? <img src={"/images/editorial/"+game.screenshot} alt={game.alt || ""} loading="lazy" style={{width:"100%",height:"100%",objectFit:"contain"}}/> : <GameThumb slug={game.slug} title={game.title}/>}</div>
        <div className="tileBody"><h2 className="tileTitle">{game.title}</h2><p>{game.goal}</p><p>{game.controls}</p></div>
      </Link>)}</div></div>;
}
