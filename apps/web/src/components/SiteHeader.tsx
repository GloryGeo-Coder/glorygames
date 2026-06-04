import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="header">
      <div className="container headerInner">
        <Link className="brand" href="/">
          <span className="brandMark" />
          <span>WebGameArena</span>
        </Link>

        <nav className="nav">
          <Link className="pill" href="/games">Games</Link>
          <span className="pill" aria-disabled="true">Community (soon)</span>
          <span className="pill" aria-disabled="true">Creators (soon)</span>

          {user ? (
            <>
              <span className="pill">Hi, {user.displayName}</span>
              <LogoutButton />
            </>
          ) : (
            <Link className="pill" href="/login">Sign in</Link>
          )}

          <Link className="cta" href="/games">Play now</Link>
        </nav>
      </div>
    </header>
  );
}
