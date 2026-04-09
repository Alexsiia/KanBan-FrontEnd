"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { createBoardWithColumns } from "@/services/boards";

export function CreateBoardModal({ onClose, onCreated }: any) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const board = await createBoardWithColumns({
        name,
        description,
      });

      onCreated(); // atualiza lista
      onClose();

      // 🔥 REDIRECIONA DIRETO PRO BOARD
      router.push(`/boards/${board.id}`);

    } catch {
      setError("Erro ao criar board.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-kanban-surface border border-kanban-border rounded-2xl p-6 shadow-modal relative">

          <button onClick={onClose} className="absolute top-3 right-3 text-kanban-muted">
            <X size={16} />
          </button>

          <h2 className="text-xl font-bold text-kanban-text mb-4">
            Novo Board
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl"
            />

            {error && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle size={14} className="text-red-400" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button className="w-full py-2.5 rounded-xl bg-kanban-accent text-white">
              {loading ? "Criando..." : "Criar Board"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}