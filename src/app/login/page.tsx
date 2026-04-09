"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/boards");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
      return;
    }
    setError("");
    setSubmitting(true);

    const result = await login(username.trim(), password);
    setSubmitting(false);

    if (result.success) {
      router.replace("/boards");
    } else {
      setError(result.message ?? "Erro ao fazer login.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-kanban-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "var(--accent)", boxShadow: "0 0 32px rgba(108,99,255,0.4)" }}
          >
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <h1
            className="text-3xl font-extrabold text-kanban-text"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Kanban
          </h1>
          <p className="text-kanban-muted text-sm mt-1">Gerenciador colaborativo de projetos</p>
        </div>

        {/* Card */}
        <div
          className="bg-kanban-surface border border-kanban-border rounded-2xl p-6 shadow-modal"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-kanban-text mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nome de usuário"
                autoComplete="username"
                autoFocus
                className="w-full px-3 py-2.5 bg-kanban-card border border-kanban-border rounded-xl
                  text-sm text-kanban-text placeholder-kanban-muted
                  focus:outline-none focus:border-kanban-accent focus:ring-1 focus:ring-kanban-accent/30
                  transition-smooth"
                disabled={submitting}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-kanban-text mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 bg-kanban-card border border-kanban-border rounded-xl
                    text-sm text-kanban-text placeholder-kanban-muted
                    focus:outline-none focus:border-kanban-accent focus:ring-1 focus:ring-kanban-accent/30
                    transition-smooth"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kanban-muted hover:text-kanban-text transition-smooth"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-kanban-accent text-white text-sm font-semibold
                hover:bg-kanban-accent-light disabled:opacity-50 disabled:cursor-not-allowed
                transition-smooth shadow-glow-sm hover:shadow-glow-accent mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
