"use client";

import { useState } from "react";

export function MoveCardModal({ onClose, onConfirm }: any) {

  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-kanban-surface p-6 rounded-xl w-full max-w-md">

        <h2 className="text-lg font-bold mb-3">
          Movimentar card
        </h2>

        <p className="text-sm text-kanban-muted mb-3">
          Informe uma observação (mín. 10 caracteres)
        </p>

        <textarea
          className="w-full p-2 rounded bg-kanban-card border border-kanban-border"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">

          <button onClick={onClose}>
            Cancelar
          </button>

          <button
            disabled={text.length < 10}
            onClick={() => onConfirm(text)}
            className="bg-kanban-accent px-4 py-1 rounded text-white disabled:opacity-50"
          >
            Confirmar
          </button>

        </div>

      </div>
    </div>
  );
}