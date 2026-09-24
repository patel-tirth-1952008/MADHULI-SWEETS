"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Invalid username or password");
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-jalebi shadow-warm">
            <span className="font-gu text-2xl font-bold text-cocoa" lang="gu">
              મા
            </span>
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Admin Panel</h1>
          <p className="mt-1 text-sm text-ink2">Madhuli Namkeen &amp; Sweets</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="username"
              className="w-full rounded-xl border border-linemed bg-white px-4 py-3 text-sm text-ink placeholder:text-mute"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-linemed bg-white px-4 py-3 text-sm text-ink placeholder:text-mute"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-bad/10 px-4 py-2.5 text-sm font-semibold text-bad">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn-press w-full rounded-full bg-gold px-6 py-3.5 text-base font-extrabold text-cocoa disabled:opacity-70"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-mute">
          <a href="/" className="underline">
            ← Back to storefront
          </a>
        </p>
      </div>
    </div>
  );
}
