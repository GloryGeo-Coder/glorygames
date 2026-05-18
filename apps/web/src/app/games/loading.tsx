import SkeletonGrid from "@/components/SkeletonGrid";

export default function LoadingGames() {
  return (
    <main className="section">
      <div className="container">
        <div className="sectionTitle">
          <h2>Games</h2>
          <p>Loading…</p>
        </div>
        <SkeletonGrid count={12} />
      </div>
    </main>
  );
}
