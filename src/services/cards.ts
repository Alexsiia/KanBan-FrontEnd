import { api } from "./api";
import { Card, HistoryEntry } from "@/types";

export const getCard = async (cardId: string): Promise<Card> => {
  const res = await api.get<Card>(`/cards/${cardId}`);
  return res.data;
};

export const moveCard = async (
  cardId: string,
  targetColumnId: string,
  observation: string,
  position = 0
): Promise<Card> => {
  const res = await api.post<Card>(`/cards/${cardId}/move`, {
    target_column_id: targetColumnId,
    position,
    observation,
  });
  return res.data;
};

export const commentCard = async (
  cardId: string,
  observation: string
): Promise<HistoryEntry> => {
  const res = await api.post<HistoryEntry>(`/cards/${cardId}/comments`, {
    observation,
  });
  return res.data;
};

export const getCardHistory = async (
  cardId: string,
  page = 1,
  perPage = 20
): Promise<{ items: HistoryEntry[]; total: number }> => {
  const res = await api.get(`/cards/${cardId}/history`, {
    params: { page, per_page: perPage },
  });
  return res.data;
};

export const updateCard = async (
  cardId: string,
  data: Partial<{
    title: string;
    description: string;
    priority: string;
    assignee_id: string;
    due_date: string;
    tags: string[];
  }>
): Promise<Card> => {
  const res = await api.patch<Card>(`/cards/${cardId}`, data);
  return res.data;
};

export const createCard = async (
  boardId: string,
  columnId: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
    tags?: string[];
  }
): Promise<Card> => {
  const res = await api.post<Card>(
    `/boards/${boardId}/columns/${columnId}/cards`,
    data
  );
  return res.data;
};

export const archiveCard = async (cardId: string): Promise<void> => {
  await api.delete(`/cards/${cardId}`);
};
