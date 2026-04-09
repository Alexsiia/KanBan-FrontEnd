"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b border-kanban-border"
      style={{ background: "rgba(13, 15, 20, 0.9)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/boards"
          className="flex items-center gap-2 group"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <div className="w-7 h-7 rounded-lg bg-kanban-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-accent transition-all">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="font-bold text-kanban-text tracking-tight hidden sm:block">
            Kanban
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/boards"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
              pathname.startsWith("/boards")
                ? "bg-kanban-accent/20 text-kanban-accent-light"
                : "text-kanban-muted hover:text-kanban-text hover:bg-kanban-card"
            }`}
          >
            Boards
          </Link>
        </nav>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-kanban-card border border-kanban-border rounded-lg">
              <User size={13} className="text-kanban-muted" />
              <span className="text-sm text-kanban-text font-medium">{user.username}</span>
              {user.role === "admin" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-kanban-accent/20 text-kanban-accent-light border border-kanban-accent/30 font-semibold uppercase tracking-wide">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 rounded-lg text-kanban-muted hover:text-kanban-danger hover:bg-red-500/10 transition-smooth"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
