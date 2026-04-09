"use client";

import { useState } from "react";
import { X, MoveRight, AlertCircle } from "lucide-react";

interface MoveModalProps {
  fromColumn: string;
  toColumn: string;
  cardTitle: string;
  onConfirm: (observation: string) => Promise<void>;
  onCancel: () => void;
}

export function MoveModal({
  fromColumn,
  toColumn,
  cardTitle,
  onConfirm,
  onCancel,
}: MoveModalProps) {
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MIN_LEN = 10;
  const remaining = MIN_LEN - observation.length;
  const isValid = observation.trim().length >= MIN_LEN;

  async function handleConfirm() {
    if (!isValid) {
      setError(`A observação precisa ter no mínimo ${MIN_LEN} caracteres.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirm(observation.trim());
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const msg =
        e?.response?.data?.error?.message ?? "Erro ao mover card. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-md bg-kanban-surface border border-kanban-border rounded-2xl shadow-modal animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-kanban-border">
          <div>
            <h2
              className="text-base font-bold text-kanban-text"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Mover Card
            </h2>
            <p className="text-xs text-kanban-muted mt-0.5 truncate max-w-[280px]">{cardTitle}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth"
          >
            <X size={16} />
          </button>
        </div>

        {/* Column path */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 p-3 bg-kanban-card rounded-xl border border-kanban-border">
            <span className="text-sm font-medium text-kanban-muted">{fromColumn}</span>
            <MoveRight size={14} className="text-kanban-accent flex-shrink-0" />
            <span className="text-sm font-bold text-kanban-accent-light">{toColumn}</span>
          </div>
        </div>

        {/* Observation */}
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-kanban-text mb-1.5">
              Observação <span className="text-kanban-danger">*</span>
            </label>
            <p className="text-xs text-kanban-muted mb-2">
              Descreva o motivo da movimentação (mín. {MIN_LEN} caracteres).
            </p>
            <textarea
              value={observation}
              onChange={(e) => {
                setObservation(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ex: Iniciando desenvolvimento após alinhamento com o cliente..."
              rows={4}
              className="w-full px-3 py-2.5 bg-kanban-card border border-kanban-border rounded-xl
                text-sm text-kanban-text placeholder-kanban-muted resize-none
                focus:outline-none focus:border-kanban-accent focus:ring-1 focus:ring-kanban-accent/30
                transition-smooth"
              disabled={loading}
            />
            {/* Counter */}
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  isValid ? "text-kanban-muted" : "text-kanban-warning"
                }`}
              >
                {observation.length} caracteres
                {!isValid && remaining > 0 && ` (faltam ${remaining})`}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-kanban-border text-sm font-medium
              text-kanban-muted hover:text-kanban-text hover:bg-kanban-card transition-smooth disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-kanban-accent text-white text-sm font-semibold
              hover:bg-kanban-accent-light disabled:opacity-40 disabled:cursor-not-allowed
              transition-smooth shadow-glow-sm hover:shadow-glow-accent"
          >
            {loading ? "Movendo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
