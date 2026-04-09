"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function CreateCardModal({ onClose, onCreate }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-kanban-surface border border-kanban-border rounded-2xl p-6 relative">

        <button onClick={onClose} className="absolute top-3 right-3 text-kanban-muted">
          <X size={16} />
        </button>

        <h2 className="text-lg font-bold text-kanban-text mb-4">
          Novo Card
        </h2>

        {/* TITLE */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl mb-3"
        />

        {/* DESCRIPTION */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl mb-3"
        />

        {/* PRIORITY */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl mb-4"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-kanban-muted">
            Cancelar
          </button>

          <button
            onClick={() => {
              if (!title.trim()) return;

              onCreate({
                title,
                description,
                priority,
              });
            }}
            className="px-4 py-1.5 bg-kanban-accent text-white rounded-lg text-sm"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}