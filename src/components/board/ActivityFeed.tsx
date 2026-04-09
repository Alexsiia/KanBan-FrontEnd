"use client";

import { ActivityEntry } from "@/types";
import { formatRelative } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, MoveRight } from "lucide-react";

interface ActivityFeedProps {
  items: ActivityEntry[];
  loading: boolean;
  onCardClick: (cardId: string) => void;
}

// Consistent with CardDetailModal action labels (translated to PT-BR)
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
  moved: "text-blue-400",
  created: "text-green-400",
  commented: "text-purple-400",
  edited: "text-yellow-400",
  archived: "text-red-400",
  priority_changed: "text-orange-400",
  due_date_changed: "text-cyan-400",
};

export function ActivityFeed({ items, loading, onCardClick }: ActivityFeedProps) {
  return (
    <div className="w-72 flex-shrink-0 bg-kanban-surface border-l border-kanban-border flex flex-col h-full">
      <div className="p-4 border-b border-kanban-border flex items-center gap-2 flex-shrink-0">
        <Activity size={14} className="text-kanban-accent" />
        <h3
          className="text-sm font-bold text-kanban-text"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Atividade Recente
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="text-xs text-kanban-muted text-center py-8">Nenhuma atividade ainda.</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onCardClick(item.card.id)}
              className="w-full text-left p-3 bg-kanban-card rounded-xl border border-kanban-border
                hover:border-kanban-accent/40 hover:bg-kanban-card/80 transition-smooth group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    actionColors[item.action] ?? "text-kanban-muted"
                  }`}
                >
                  {actionLabels[item.action] ?? item.action}
                </span>
                <span className="text-[10px] text-kanban-muted">· {item.performed_by.username}</span>
              </div>

              <p className="text-xs font-medium text-kanban-text truncate group-hover:text-kanban-accent-light transition-smooth">
                {item.card.title}
              </p>

              {item.from_column && item.to_column && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-kanban-muted truncate max-w-[80px]">{item.from_column}</span>
                  <MoveRight size={9} className="text-kanban-muted flex-shrink-0" />
                  <span className="text-[10px] text-kanban-accent-light truncate max-w-[80px]">{item.to_column}</span>
                </div>
              )}

              {item.observation && (
                <p className="text-[10px] text-kanban-muted mt-1 line-clamp-2 leading-relaxed">
                  {item.observation}
                </p>
              )}

              <p className="text-[10px] text-kanban-muted/50 mt-1">{formatRelative(item.created_at)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
