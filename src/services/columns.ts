import { api } from "./api";

export const createColumn = async (
  boardId: string,
  data: { name: string; position: number; color?: string; wip_limit?: number | null }
) => {
  const res = await api.post(`/boards/${boardId}/columns`, data);
  return res.data;
};

export const deleteColumn = async (boardId: string, columnId: string) => {
  await api.delete(`/boards/${boardId}/columns/${columnId}`);
};

export const updateColumn = async (
  boardId: string,
  columnId: string,
  data: Partial<{ name: string; color: string; wip_limit: number | null }>
) => {
  const res = await api.patch(`/boards/${boardId}/columns/${columnId}`, data);
  return res.data;
};
