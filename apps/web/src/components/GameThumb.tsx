"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  slug: string;
  title?: string;
};

const EXT_ORDER = ["webp", "png", "svg", "jpg", "jpeg"] as const;

export function GameThumb({ slug, title = "Game" }: Props) {
  const sources = useMemo(
    () => EXT_ORDER.map((ext) => `/games/${slug}/thumb.${ext}`),
    [slug]
  );

  const [i, setI] = useState(0);
  const [dead, setDead] = useState(false);

  // When all thumb.* formats fail, show a styled placeholder
  if (dead) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
          letterSpacing: ".2px",
          color: "rgba(255,255,255,.9)",
          background:
            "radial-gradient(24px 24px at 20% 20%, rgba(255,255,255,.22), transparent 60%), linear-gradient(135deg, rgba(59,130,246,.55), rgba(168,85,247,.35))",
        }}
      >
        {title.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  const src = sources[i];

  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
      onError={() => {
        if (i < sources.length - 1) setI(i + 1);
        else setDead(true);
      }}
    />
  );
}

export default GameThumb;
