// apps/web/src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notFoundPage">
      <div className="container">
        <section className="notFoundCard">
          <div className="badge notFoundBadge">404 • Page not found</div>

          <h1>Oops — this level does not exist.</h1>

          <p>
            The page, game, or route you are looking for could not be found.
            It may have moved, been renamed, or is still being built.
          </p>

          <div className="notFoundActions">
            <Link className="cta" href="/games">
              Browse Games
            </Link>

            <Link className="pill" href="/">
              Back to Home
            </Link>

            <Link className="pill" href="/contact">
              Report a Problem
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}