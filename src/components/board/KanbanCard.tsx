"use client";

import { DraggableProvided } from "@hello-pangea/dnd";
import { Card } from "@/types";

interface KanbanCardProps {
  card: Card;
  index: number;
  canDrag: boolean;
  provided: DraggableProvided;
  onClick: () => void;
}

export function KanbanCard({
  card,
  provided,
  onClick,
}: KanbanCardProps) {

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className="
        bg-kanban-card
        border border-kanban-border
        rounded-xl
        p-3
        cursor-pointer
        transition
        hover:border-kanban-accent
      "
    >

      <p className="text-sm font-medium text-kanban-text">
        {card.title}
      </p>

      {card.priority && (
        <span
          className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold
            ${
              card.priority === "high"
                ? "bg-red-500/20 text-red-400"
                : card.priority === "medium"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }
          `}
        >
          {card.priority === "high"
            ? "Alta"
            : card.priority === "medium"
            ? "Média"
            : "Baixa"}
        </span>
      )}

    </div>
  );
}