"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getBoards } from "@/services/boards";
import { Navbar } from "@/components/layout/Navbar";
import { BoardCardSkeleton } from "@/components/ui/Skeleton";
import { CreateBoardModal } from "@/components/modals/CreateBoardModal";
import { Users, LayoutGrid, ArrowRight, AlertCircle, Plus } from "lucide-react";

export default function BoardsPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchBoards = async () => {
  try {
    setLoading(true);

    const data = await getBoards();

    // 🔥 GARANTIA EXTRA (nunca quebra)
    setBoards(Array.isArray(data) ? data : []);

  } catch {
    setError("Erro ao carregar boards.");
    setBoards([]); // importante
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) fetchBoards();
  }, [isAuthenticated]);

  if (authLoading) return null;

  return (
  <div className="min-h-screen" style={{ background: "var(--bg)" }}>
    <Navbar />

    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold text-kanban-text"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Seus Boards
          </h1>

          <p className="text-kanban-muted text-sm mt-1">
            {user ? `Olá, ${user.username}! ` : ""}
            Selecione um board para continuar.
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kanban-accent text-white text-sm
              font-semibold hover:bg-kanban-accent-light transition-smooth shadow-glow-sm"
          >
            <Plus size={14} />
            Novo Board
          </button>
        )}
      </div>

      {/* ERRO */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <BoardCardSkeleton />
            <BoardCardSkeleton />
            <BoardCardSkeleton />
          </>
        ) : boards.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <LayoutGrid size={40} className="text-kanban-border mb-4" />
            <p className="text-kanban-muted text-sm">
              Nenhum board disponível.
            </p>
          </div>
        ) : (
          boards.map((board: any) => (
            <button
              key={board.id}
              onClick={() => router.push(`/boards/${board.id}`)}
              className="group text-left bg-kanban-surface border border-kanban-border rounded-2xl p-6
                hover:border-kanban-accent/50 hover:shadow-glow-sm transition-all duration-200
                animate-fade-in"
            >
              {/* Nome */}
              <div className="flex items-start justify-between mb-3">
                <h2
                  className="text-base font-bold text-kanban-text group-hover:text-white transition-colors leading-tight pr-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {board.name}
                </h2>
              </div>

              {/* Descrição */}
              {board.description && (
                <p className="text-xs text-kanban-muted mb-4 line-clamp-2 leading-relaxed">
                  {board.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-auto">
                <span className="flex items-center gap-1.5 text-xs text-kanban-muted">
                  <Users size={11} />
                  {board.members_count ?? 0} membros
                </span>

                <span className="flex items-center gap-1.5 text-xs text-kanban-muted">
                  <LayoutGrid size={11} />
                  {board.cards_count ?? 0} cards
                </span>

                <ArrowRight
                  size={14}
                  className="ml-auto text-kanban-muted group-hover:text-kanban-accent-light
                    group-hover:translate-x-1 transition-all"
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>

    {/* MODAL (mantido) */}
    {showCreate && (
      <CreateBoardModal
        onClose={() => setShowCreate(false)}
        onCreated={fetchBoards}
      />
    )}
  </div>
);
}