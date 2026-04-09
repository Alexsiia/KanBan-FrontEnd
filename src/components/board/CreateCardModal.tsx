"use client";

import { useState } from "react";
import { X, AlertCircle, ChevronDown } from "lucide-react";
import { createCard } from "@/services/cards";
import { getErrorMessage } from "@/lib/utils";

interface CreateCardModalProps {
  boardId: string;
  columnId: string;
  columnName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica",
};

export function CreateCardModal({ boardId, columnId, columnName, onSuccess, onCancel }: CreateCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!title.trim()) { setError("Título obrigatório."); return; }
    setLoading(true);
    setError("");
    try {
      await createCard(boardId, columnId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-md bg-kanban-surface border border-kanban-border rounded-2xl shadow-modal animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-kanban-border">
          <div>
            <h2 className="text-base font-bold text-kanban-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              Novo Card
            </h2>
            <p className="text-xs text-kanban-muted mt-0.5">Coluna: {columnName}</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-kanban-text mb-1.5">Título <span className="text-kanban-danger">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implementar tela de login"
              className="w-full px-3 py-2.5 bg-kanban-card border border-kanban-border rounded-xl
                text-sm text-kanban-text placeholder-kanban-muted
                focus:outline-none focus:border-kanban-accent transition-smooth"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-kanban-text mb-1.5">Prioridade</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-kanban-card border border-kanban-border rounded-xl
                  text-sm text-kanban-text appearance-none focus:outline-none focus:border-kanban-accent"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-kanban-muted pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-kanban-text mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva o card..."
              className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
                text-sm text-kanban-text placeholder-kanban-muted resize-none
                focus:outline-none focus:border-kanban-accent transition-smooth"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-kanban-text mb-1.5">Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
                  text-sm text-kanban-text focus:outline-none focus:border-kanban-accent transition-smooth"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-kanban-text mb-1.5">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="frontend, bug"
                className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
                  text-sm text-kanban-text placeholder-kanban-muted focus:outline-none focus:border-kanban-accent transition-smooth"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-kanban-border text-sm text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!title.trim() || loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-kanban-accent text-white text-sm font-semibold
                hover:bg-kanban-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-smooth shadow-glow-sm">
              {loading ? "Criando..." : "Criar Card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
