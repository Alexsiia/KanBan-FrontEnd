"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Column, Card } from "@/types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: Column;
  canDrag: boolean;
  canCreate: boolean;
  onCreateCard: (columnId: string) => void;
  onCardClick: (card: Card) => void;
}

export function KanbanColumn({
  column,
  canDrag,
  canCreate,
  onCreateCard,
  onCardClick,
}: KanbanColumnProps) {

  const limit = column.wip_limit;

  return (
    <div className="w-72 bg-kanban-surface rounded-2xl p-3 flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">

        <div className="flex items-center gap-2">

          <h2 className="text-sm font-bold text-kanban-text">
            {column.name}
          </h2>

          <span className="text-xs bg-kanban-card px-2 py-0.5 rounded">
            {column.cards.length}
            {limit !== null && ` / ${limit}`}
          </span>

        </div>

        {canCreate && (
          <button
            onClick={() => onCreateCard(String(column.id))}
            className="text-kanban-muted hover:text-white transition"
          >
            +
          </button>
        )}

      </div>

      {/* DROPPABLE */}
      <Droppable droppableId={String(column.id)}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-3 min-h-[100px]"
          >

            {column.cards.map((card: Card, index: number) => (
              <Draggable
                key={String(card.id)}
                draggableId={String(card.id)}
                index={index}
                isDragDisabled={!canDrag}
              >
                {(provided) => (

                  <KanbanCard
                    card={card}
                    index={index}
                    canDrag={canDrag}
                    provided={provided}
                    onClick={() => onCardClick(card)}
                  />

                )}
              </Draggable>
            ))}

            {provided.placeholder}

          </div>
        )}
      </Droppable>

    </div>
  );
}