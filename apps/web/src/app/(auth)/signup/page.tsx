"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Network or server error encountered.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 selection:bg-white selection:text-black">
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" 
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card Box */}
        <div className="border border-white/10 bg-neutral-950 p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-white">Create Account</h1>
            <p className="mt-1 text-xs text-neutral-400">
              Join thousands of students learning real engineering skills.
            </p>
          </div>

          {/* Premium Google OAuth Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group relative flex w-full items-center justify-center gap-3 rounded border border-white/20 bg-neutral-900/60 px-4 py-3 text-xs font-medium text-white transition-all duration-150 hover:border-white hover:bg-neutral-800 active:scale-[0.99]"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#FFFFFF"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#D4D4D8"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#A1A1AA"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#E4E4E7"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-mono text-xs font-semibold tracking-wide">Sign up with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">or use email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {error && (
            <div className="mb-4 rounded border border-white/20 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ada Lovelace"
                className="w-full rounded border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@gmail.com"
                className="w-full rounded border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-colors focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded border border-white bg-white py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-white underline underline-offset-4 hover:text-neutral-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
