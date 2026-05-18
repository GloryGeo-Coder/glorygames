import AdminClient from "./admin-client";

export const metadata = {
  title: "Admin • GloryGames"
};

export default function AdminPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="sectionTitle">
          <h2>Admin</h2>
          <p>Sync your /public/games folder into the database</p>
        </div>

        <AdminClient />
      </div>
    </main>
  );
}
