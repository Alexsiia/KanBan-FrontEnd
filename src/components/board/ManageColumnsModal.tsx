"use client";

import { useState } from "react";
import { Column } from "@/types";
import { createColumn, deleteColumn, updateColumn } from "@/services/columns";
import { getErrorMessage } from "@/lib/utils";
import { X, Plus, Trash2, Edit2, Check, AlertCircle, ChevronDown } from "lucide-react";

interface ManageColumnsModalProps {
  boardId: string;
  columns: Column[];
  onClose: () => void;
  onUpdate: () => void;
}

const COLORS = ["#6B7280","#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4"];

export function ManageColumnsModal({ boardId, columns, onClose, onUpdate }: ManageColumnsModalProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6B7280");
  const [newWip, setNewWip] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWip, setEditWip] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

  async function handleCreate() {
    if (!newName.trim()) { setCreateError("Nome obrigatório."); return; }
    setCreating(true);
    setCreateError("");
    try {
      // RN-12: position is unique per board — place at end
      const nextPosition = columns.length > 0 ? Math.max(...columns.map(c => c.position)) + 1 : 0;
      await createColumn(boardId, {
        name: newName.trim(),
        position: nextPosition,
        color: newColor,
        wip_limit: newWip ? parseInt(newWip) : null, // RN-14: null = sem limite
      });
      setNewName(""); setNewWip("");
      onUpdate();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(col: Column) {
    setEditingId(col.id);
    setEditName(col.name);
    setEditWip(col.wip_limit !== null ? String(col.wip_limit) : "");
    setEditColor(col.color ?? "#6B7280");
    setEditError("");
  }

  async function handleSaveEdit(colId: string) {
    if (!editName.trim()) { setEditError("Nome obrigatório."); return; }
    setEditLoading(true);
    setEditError("");
    try {
      await updateColumn(boardId, colId, {
        name: editName.trim(),
        color: editColor,
        wip_limit: editWip ? parseInt(editWip) : null, // RN-14
      });
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(col: Column) {
    // RN-13: só pode deletar se não houver cards ativos
    if (col.cards.length > 0) {
      setDeleteError((prev) => ({
        ...prev,
        [col.id]: `Não é possível deletar: coluna tem ${col.cards.length} card(s) ativo(s). (RN-13)`,
      }));
      return;
    }
    setDeletingId(col.id);
    try {
      await deleteColumn(boardId, col.id);
      onUpdate();
    } catch (err) {
      setDeleteError((prev) => ({ ...prev, [col.id]: getErrorMessage(err) }));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-kanban-surface border border-kanban-border rounded-2xl shadow-modal animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-kanban-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-kanban-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              Gerenciar Colunas
            </h2>
            <p className="text-xs text-kanban-muted mt-0.5">Somente admin (RN-07)</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Existing columns */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider">Colunas existentes</p>
            {columns.map((col) => (
              <div key={col.id} className="p-3 bg-kanban-card rounded-xl border border-kanban-border">
                {editingId === col.id ? (
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1.5 bg-kanban-surface border border-kanban-accent rounded-lg text-sm text-kanban-text focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editWip}
                        onChange={(e) => setEditWip(e.target.value)}
                        placeholder="WIP limit (vazio = sem limite)"
                        min="1"
                        className="flex-1 px-2 py-1.5 bg-kanban-surface border border-kanban-border rounded-lg text-sm text-kanban-text focus:outline-none focus:border-kanban-accent placeholder-kanban-muted"
                      />
                      <div className="flex gap-1">
                        {COLORS.map((c) => (
                          <button key={c} onClick={() => setEditColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-smooth ${editColor === c ? "border-white scale-110" : "border-transparent"}`}
                            style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    {editError && <p className="text-xs text-red-400">{editError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs border border-kanban-border text-kanban-muted rounded-lg hover:text-kanban-text transition-smooth">
                        Cancelar
                      </button>
                      <button onClick={() => handleSaveEdit(col.id)} disabled={editLoading}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-kanban-accent text-white rounded-lg hover:bg-kanban-accent-light disabled:opacity-50 transition-smooth">
                        <Check size={11} /> {editLoading ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: col.color ?? "#6B7280" }} />
                    <span className="flex-1 text-sm font-medium text-kanban-text truncate">{col.name}</span>
                    <span className="text-xs text-kanban-muted">
                      {col.cards.length} cards{col.wip_limit !== null ? ` / WIP ${col.wip_limit}` : ""}
                    </span>
                    <button onClick={() => startEdit(col)} className="p-1 text-kanban-muted hover:text-kanban-accent-light transition-smooth">
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(col)}
                      disabled={deletingId === col.id}
                      className="p-1 text-kanban-muted hover:text-red-400 transition-smooth disabled:opacity-50"
                      title={col.cards.length > 0 ? "Coluna com cards não pode ser deletada (RN-13)" : "Deletar coluna"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
                {deleteError[col.id] && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {deleteError[col.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Create new column */}
          <div className="space-y-3 p-4 bg-kanban-card/50 rounded-xl border border-dashed border-kanban-border">
            <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider flex items-center gap-1">
              <Plus size={11} /> Nova coluna
            </p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da coluna"
              className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl text-sm text-kanban-text placeholder-kanban-muted focus:outline-none focus:border-kanban-accent transition-smooth"
            />
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="number"
                value={newWip}
                onChange={(e) => setNewWip(e.target.value)}
                placeholder="WIP limit (opcional)"
                min="1"
                className="flex-1 min-w-[150px] px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl text-sm text-kanban-text placeholder-kanban-muted focus:outline-none focus:border-kanban-accent transition-smooth"
              />
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-smooth ${newColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            {createError && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {createError}</p>
            )}
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="w-full py-2 rounded-xl bg-kanban-accent text-white text-sm font-semibold
                hover:bg-kanban-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
            >
              {creating ? "Criando..." : "Criar Coluna"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
