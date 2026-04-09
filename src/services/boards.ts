import { api } from "./api";

export interface CreateBoardDTO {
  name: string;
  description?: string;
}

// 🔥 GET BOARDS (corrigido com items)
export async function getBoards() {
  const res = await api.get("/boards");
  const data = res.data;

  return (
    data?.items || // ✅ CORRETO
    data?.boards ||
    data?.data ||
    (Array.isArray(data) ? data : [])
  );
}

// GET BOARD DETAIL
export async function getBoard(boardId: string) {
  const res = await api.get(`/boards/${boardId}`);
  return res.data;
}

// 🔥 CREATE BOARD + COLUNAS (PRONTO)
export async function createBoardWithColumns(data: CreateBoardDTO) {
  const res = await api.post("/boards", data);
  const board = res.data;

  const defaultColumns = [
    { name: "Backlog", position: 0, wip_limit: 3 },
    { name: "Em Andamento", position: 1, wip_limit: 3 },
    { name: "Em Revisão", position: 2, wip_limit: 2 },
    { name: "Concluído", position: 3, wip_limit: null },
  ];

  await Promise.all(
    defaultColumns.map((col) =>
      api.post(`/boards/${board.id}/columns`, col)
    )
  );

  return board;
}

// DELETE BOARD
export async function deleteBoard(boardId: string) {
  await api.delete(`/boards/${boardId}`);
}

// GET ACTIVITY
export async function getActivity(boardId: string) {
  const res = await api.get(`/boards/${boardId}/activity`);
  return res.data?.items || [];
}