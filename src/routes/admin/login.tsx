import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Moderator Sign In — HAID Watch" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in? Skip the form.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          HAID Watch
        </p>
        <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight">
          Moderator Sign In
        </h1>

        <form
          onSubmit={handleLogin}
          className="mt-8 flex flex-col gap-5 rounded-lg border border-border bg-card p-7 shadow-(--shadow-card)"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-input bg-card px-3.5 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-input bg-card px-3.5 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
