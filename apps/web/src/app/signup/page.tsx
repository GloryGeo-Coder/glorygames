import Link from "next/link";
import { PUBLIC_SIGNUP_ENABLED } from "@/lib/launchPolicy";
import SignupForm from "./ui";

export default function SignupPage() {
  return (
    <main className="section">
      <div className="container">
        {PUBLIC_SIGNUP_ENABLED ? <SignupForm /> : <section className="heroCard" style={{padding:24}}><h1>Play without an account</h1><p>New account registration is paused while we improve account safety. Games remain free to play, and progress can save on this device.</p><Link href="/games" className="cta">Browse games</Link><p>Already have an account? <Link href="/login">Sign in</Link></p></section>}
      </div>
    </main>
  );
}
