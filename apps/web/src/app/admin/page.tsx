export const metadata = {
  title: "Admin • WebGameArena",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="sectionTitle">
          <h2>Admin</h2>
          <p>Web maintenance is paused.</p>
        </div>

        <p>Games remain available to play. Catalogue updates are handled through reviewed releases.</p>
      </div>
    </main>
  );
}
