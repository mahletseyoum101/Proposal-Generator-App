"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-dodo-ink mb-2">Check your email</h1>
          <p className="text-dodo-muted">
            We sent a confirmation link to <span className="text-dodo-ink">{email}</span>. Confirm
            your address, then sign in.
          </p>
          <Link href="/login" className="inline-block mt-6 text-dodo-gold-dark font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-dodo-ink mb-1">Create an account</h1>
        <p className="text-dodo-muted mb-8">Start generating proposals in minutes.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dodo-ink mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-dodo-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dodo-ink text-white rounded-xl py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-dodo-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-dodo-gold-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
