"use client";

import { useEffect, useState } from "react";
import { Card, HistoryEntry } from "@/types";
import { getCard, getCardHistory, commentCard, updateCard, archiveCard } from "@/services/cards";
import {
  X, MessageSquare, Clock, Tag, User, Calendar,
  AlertCircle, Send, Edit2, Archive, Check, ChevronDown
} from "lucide-react";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatRelative, getErrorMessage } from "@/lib/utils";

interface CardDetailModalProps {
  cardId: string;
  permission: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const actionLabels: Record<string, string> = {
  created: "Criado",
  moved: "Movido",
  edited: "Editado",
  commented: "Comentou",
  assigned: "Atribuído",
  unassigned: "Desatribuído",
  archived: "Arquivado",
  priority_changed: "Prioridade alterada",
  due_date_changed: "Data alterada",
};

const actionColors: Record<string, string> = {
  created: "text-green-400 bg-green-400/10",
  moved: "text-blue-400 bg-blue-400/10",
  edited: "text-yellow-400 bg-yellow-400/10",
  commented: "text-purple-400 bg-purple-400/10",
  archived: "text-red-400 bg-red-400/10",
  priority_changed: "text-orange-400 bg-orange-400/10",
  due_date_changed: "text-cyan-400 bg-cyan-400/10",
  assigned: "text-indigo-400 bg-indigo-400/10",
  unassigned: "text-gray-400 bg-gray-400/10",
};

const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica",
};

export function CardDetailModal({
  cardId, permission, onClose, onUpdate,
}: CardDetailModalProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingCard, setLoadingCard] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<string>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Archive state
  const [archiving, setArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const canComment = ["editor", "viewer", "admin"].includes(permission);
  const canEdit = ["editor", "admin"].includes(permission);

  useEffect(() => {
    getCard(cardId)
      .then((c) => {
        setCard(c);
        setEditTitle(c.title);
        setEditDescription(c.description ?? "");
        setEditPriority(c.priority);
        setEditDueDate(c.due_date ?? "");
        setEditTags(c.tags?.join(", ") ?? "");
      })
      .finally(() => setLoadingCard(false));

    getCardHistory(cardId)
      .then((data) => setHistory(data.items))
      .finally(() => setLoadingHistory(false));
  }, [cardId]);

  async function handleComment() {
    if (!comment.trim()) return;
    setSendingComment(true);
    setCommentError("");
    try {
      const entry = await commentCard(cardId, comment.trim());
      setHistory((prev) => [entry, ...prev]);
      setComment("");
      onUpdate?.();
    } catch {
      setCommentError("Erro ao enviar comentário.");
    } finally {
      setSendingComment(false);
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) { setSaveError("Título obrigatório."); return; }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateCard(cardId, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        due_date: editDueDate || undefined,
        tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      setCard(updated);
      setIsEditing(false);
      // Refresh history to show RN-17: each edited field generates a history entry
      const histData = await getCardHistory(cardId);
      setHistory(histData.items);
      onUpdate?.();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      await archiveCard(cardId);
      onUpdate?.();
      onClose();
    } catch (err) {
      setConfirmArchive(false);
      setArchiving(false);
      setSaveError(getErrorMessage(err));
    }
  }

  // RN-17: render metadata showing before/after values
  function renderMetadata(entry: HistoryEntry) {
    if (!entry.metadata) return null;
    const meta = entry.metadata as Record<string, unknown>;
    if (meta.field && meta.from !== undefined && meta.to !== undefined) {
      return (
        <p className="text-[10px] text-kanban-muted mt-0.5">
          <span className="line-through opacity-60">{String(meta.from)}</span>
          {" → "}
          <span className="text-kanban-accent-light">{String(meta.to)}</span>
        </p>
      );
    }
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-kanban-surface
        border border-kanban-border rounded-2xl shadow-modal animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-kanban-border flex-shrink-0">
          <div className="flex-1 pr-3">
            {loadingCard ? (
              <Skeleton className="h-5 w-64 mb-2" />
            ) : isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 bg-kanban-card border border-kanban-accent rounded-lg
                  text-base font-bold text-kanban-text focus:outline-none"
              />
            ) : (
              <>
                <h2 className="text-base sm:text-lg font-bold text-kanban-text leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {card?.title}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {card?.priority && <PriorityBadge priority={card.priority} />}
                  {card?.column && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-kanban-accent/10 text-kanban-accent-light border border-kanban-accent/20">
                      {card.column.name}
                    </span>
                  )}
                  {card?.is_archived && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Arquivado
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* RN-06: editor can edit and archive */}
            {canEdit && !card?.is_archived && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-accent-light hover:bg-kanban-card transition-smooth"
                  title="Editar card"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setConfirmArchive(true)}
                  className="p-1.5 rounded-lg text-kanban-muted hover:text-red-400 hover:bg-red-500/10 transition-smooth"
                  title="Arquivar card"
                >
                  <Archive size={14} />
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={() => { setIsEditing(false); setSaveError(""); }}
                className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth"
                title="Cancelar edição"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Confirm archive */}
        {confirmArchive && (
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30 flex items-center gap-3 flex-shrink-0">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400 flex-1">Arquivar este card? Esta ação gera um registro no histórico (RN-18).</p>
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-smooth"
            >
              {archiving ? "Arquivando..." : "Confirmar"}
            </button>
            <button
              onClick={() => setConfirmArchive(false)}
              className="px-3 py-1 text-xs border border-kanban-border text-kanban-muted rounded-lg hover:text-kanban-text transition-smooth"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 space-y-5">

            {/* Edit form */}
            {isEditing && (
              <div className="space-y-3 p-4 bg-kanban-card rounded-xl border border-kanban-accent/30">
                <p className="text-xs font-semibold text-kanban-accent-light uppercase tracking-wider">Editando card (RN-17)</p>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-kanban-muted mb-1">Prioridade</label>
                  <div className="relative">
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-kanban-surface border border-kanban-border rounded-xl
                        text-sm text-kanban-text appearance-none focus:outline-none focus:border-kanban-accent"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-kanban-muted pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-kanban-muted mb-1">Descrição</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-kanban-surface border border-kanban-border rounded-xl
                      text-sm text-kanban-text placeholder-kanban-muted resize-none
                      focus:outline-none focus:border-kanban-accent transition-smooth"
                    placeholder="Descrição opcional..."
                  />
                </div>

                {/* Due date + Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-kanban-muted mb-1">Prazo</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-kanban-surface border border-kanban-border rounded-xl
                        text-sm text-kanban-text focus:outline-none focus:border-kanban-accent transition-smooth"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-kanban-muted mb-1">Tags (separadas por vírgula)</label>
                    <input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="frontend, auth, bug"
                      className="w-full px-3 py-2 bg-kanban-surface border border-kanban-border rounded-xl
                        text-sm text-kanban-text placeholder-kanban-muted focus:outline-none focus:border-kanban-accent transition-smooth"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> {saveError}
                  </p>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setIsEditing(false); setSaveError(""); }}
                    className="px-4 py-2 text-xs border border-kanban-border text-kanban-muted rounded-xl hover:text-kanban-text transition-smooth"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-kanban-accent text-white rounded-xl
                      hover:bg-kanban-accent-light disabled:opacity-50 transition-smooth"
                  >
                    <Check size={12} />
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            )}

            {/* Meta info */}
            {!loadingCard && card && !isEditing && (
              <div className="grid grid-cols-2 gap-3">
                {card.assignee && (
                  <div className="flex items-center gap-2 p-3 bg-kanban-card rounded-xl border border-kanban-border">
                    <User size={13} className="text-kanban-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-kanban-muted uppercase tracking-wide">Responsável</p>
                      <p className="text-sm font-medium text-kanban-text truncate">{card.assignee.username}</p>
                    </div>
                  </div>
                )}
                {card.due_date && (
                  <div className="flex items-center gap-2 p-3 bg-kanban-card rounded-xl border border-kanban-border">
                    <Calendar size={13} className="text-kanban-muted flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-kanban-muted uppercase tracking-wide">Prazo</p>
                      <p className="text-sm font-medium text-kanban-text">{formatDate(card.due_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {card?.description && !isEditing && (
              <div>
                <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider mb-2">Descrição</p>
                <p className="text-sm text-kanban-text leading-relaxed bg-kanban-card p-3 rounded-xl border border-kanban-border">
                  {card.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {card?.tags && card.tags.length > 0 && !isEditing && (
              <div>
                <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag size={11} /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-kanban-border text-kanban-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comment box — RN-05: viewer e editor podem comentar */}
            {canComment && !card?.is_archived && (
              <div>
                <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MessageSquare size={11} /> Comentar
                </p>
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
                      text-sm text-kanban-text placeholder-kanban-muted resize-none
                      focus:outline-none focus:border-kanban-accent transition-smooth"
                    disabled={sendingComment}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleComment(); }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim() || sendingComment}
                    className="px-3 py-2 self-end rounded-xl bg-kanban-accent text-white text-sm
                      hover:bg-kanban-accent-light disabled:opacity-40 disabled:cursor-not-allowed
                      transition-smooth shadow-glow-sm"
                  >
                    <Send size={14} />
                  </button>
                </div>
                {commentError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {commentError}
                  </p>
                )}
              </div>
            )}

            {/* History — RN-15: imutável; RN-16/17/18: exibe created, edited (com metadata), archived */}
            <div>
              <p className="text-xs font-semibold text-kanban-muted uppercase tracking-wider mb-3 flex items-center gap-1">
                <Clock size={11} /> Histórico
              </p>
              {loadingHistory ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-kanban-muted text-center py-6">Nenhuma interação ainda.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 p-3 bg-kanban-card rounded-xl border border-kanban-border">
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wide h-fit
                        ${actionColors[entry.action] ?? "text-kanban-muted bg-kanban-border"}`}>
                        {actionLabels[entry.action] ?? entry.action}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-kanban-text">{entry.performed_by.username}</span>
                          {entry.from_column && entry.to_column && (
                            <span className="text-xs text-kanban-muted">
                              · {entry.from_column.name} → {entry.to_column.name}
                            </span>
                          )}
                        </div>
                        {entry.observation && (
                          <p className="text-xs text-kanban-muted mt-0.5 leading-relaxed">{entry.observation}</p>
                        )}
                        {/* RN-17: show metadata (field changed + before/after values) */}
                        {renderMetadata(entry)}
                        <p className="text-[10px] text-kanban-muted/60 mt-1">{formatRelative(entry.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
