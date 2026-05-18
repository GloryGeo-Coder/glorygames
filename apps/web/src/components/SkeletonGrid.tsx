export default function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="tile skeleton" key={i}>
          <div className="thumb" />
          <div className="tileBody">
            <div style={{ height: 16, width: "70%", background: "rgba(255,255,255,.10)", borderRadius: 10, marginBottom: 10 }} />
            <div style={{ height: 12, width: "90%", background: "rgba(255,255,255,.08)", borderRadius: 10, marginBottom: 8 }} />
            <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,.08)", borderRadius: 10, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ height: 26, width: 64, background: "rgba(255,255,255,.08)", borderRadius: 999 }} />
              <div style={{ height: 26, width: 64, background: "rgba(255,255,255,.08)", borderRadius: 999 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
