"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

import { getBoard, deleteBoard } from "@/services/boards";
import { api } from "@/services/api";

import { BoardDetail, Column, Card } from "@/types";

import { Navbar } from "@/components/layout/Navbar";
import { KanbanColumn } from "@/components/board/KanbanColumn";

import { CardDetailModal } from "@/components/board/CardDetailModal";
import { CreateCardModal } from "@/components/modals/CreateCardModal";
import { ManageMembersModal } from "@/components/modals/ManageMembersModal";
import { MoveCardModal } from "@/components/modals/MoveCardModal";

import { ToastContainer } from "@/components/ui/Toast";
import { ColumnSkeleton } from "@/components/ui/Skeleton";

import { getErrorMessage } from "@/lib/utils";

export default function BoardPage() {

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const boardId = params.id as string;

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const [pendingMove, setPendingMove] = useState<any>(null);

  const { toasts, addToast, removeToast } = useToast();

  const canEdit =
    board?.my_permission === "editor" || board?.my_permission === "admin";

  const isAdmin = board?.my_permission === "admin";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(boardId);
      setBoard(data);
    } catch (err) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [boardId, addToast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBoard();
  }, [isAuthenticated, fetchBoard]);

  // 🔥 DRAG
  function onDragEnd(result: DropResult) {

    const { source, destination, draggableId } = result;

    if (!destination || !board) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    if (!canEdit) {
      addToast("Sem permissão", "error");
      return;
    }

    const sourceColumn = board.columns.find(
      c => String(c.id) === String(source.droppableId)
    );

    const destColumn = board.columns.find(
      c => String(c.id) === String(destination.droppableId)
    );

    if (!sourceColumn || !destColumn) return;

    const card = sourceColumn.cards.find(
      c => String(c.id) === String(draggableId)
    );

    if (!card) return;

    // 🔴 WIP LIMIT
    if (
      source.droppableId !== destination.droppableId &&
      destColumn.wip_limit !== null &&
      destColumn.cards.length >= destColumn.wip_limit
    ) {
      addToast("Limite da coluna atingido", "error");
      return;
    }

    // 🔥 SEGURA MOVIMENTO
    setPendingMove({
      card,
      source,
      destination,
      destColumn
    });
  }

  // 🔥 CONFIRMA MOVIMENTO
  async function confirmMove(observation: string) {

    if (!pendingMove || !board) return;

    const { card, destination, destColumn } = pendingMove;

    try {

      await api.post(`/cards/${card.id}/move`, {
        target_column_id: destColumn.id,
        position: destination.index,
        observation
      });

      fetchBoard();

    } catch {
      addToast("Erro ao mover card", "error");
    }

    setPendingMove(null);
  }

  async function handleCreateCard(data: any) {

    const column = board?.columns.find(
      c => String(c.id) === String(createColumnId)
    );

    if (!column) return;

    if (
      column.wip_limit !== null &&
      column.cards.length >= column.wip_limit
    ) {
      addToast("Limite da coluna atingido", "error");
      return;
    }

    await api.post(`/boards/${boardId}/columns/${createColumnId}/cards`, {
      title: data.title,
      description: data.description,
      priority: data.priority,
    });

    setCreateColumnId(null);
    fetchBoard();
  }

  if (authLoading || (!board && loading)) return <ColumnSkeleton />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      <Navbar />

      <div className="flex items-center gap-3 p-4 border-b border-kanban-border">

        <button onClick={() => router.push("/boards")}>
          ← Voltar
        </button>

        <h1 className="font-bold">{board?.name}</h1>

        {isAdmin && (
          <div className="ml-auto flex gap-2">

            <button
              onClick={() => setShowMembers(true)}
              className="px-3 py-1 bg-kanban-card rounded"
            >
              Membros
            </button>

            <button
              onClick={async () => {
                if (!confirm("Deseja deletar este board?")) return;
                await deleteBoard(board!.id);
                addToast("Board deletado!", "success");
                router.push("/boards");
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Excluir
            </button>

          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 p-6 overflow-x-auto">

          {(board?.columns ?? []).map((col: Column) => (
            <KanbanColumn
              key={String(col.id)}
              column={col}
              canDrag={canEdit}
              canCreate={canEdit}
              onCreateCard={(columnId) => setCreateColumnId(columnId)}
              onCardClick={(card) => setSelectedCard(card)}
            />
          ))}

        </div>
      </DragDropContext>

      {pendingMove && (
        <MoveCardModal
          onClose={() => setPendingMove(null)}
          onConfirm={confirmMove}
        />
      )}

      {createColumnId && (
        <CreateCardModal
          onClose={() => setCreateColumnId(null)}
          onCreate={handleCreateCard}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          cardId={selectedCard.id}
          permission={board?.my_permission ?? "viewer"}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {showMembers && (
        <ManageMembersModal
          boardId={boardId}
          onClose={() => setShowMembers(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}