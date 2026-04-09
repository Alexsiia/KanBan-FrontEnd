import MockAdapter from "axios-mock-adapter";
import { api } from "@/services/api";
import { getBoards, getBoard, getActivity } from "@/services/boards";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
});

const BOARD_ID = "board-uuid-1";

describe("getBoards", () => {
  it("retorna a lista de boards do usuário", async () => {
    mock.onGet("/boards").reply(200, {
      items: [
        {
          id: BOARD_ID,
          name: "Projeto Alpha",
          description: "Board de exemplo",
          owner: { id: "u1", username: "admin" },
          my_permission: "editor",
          members_count: 3,
          cards_count: 12,
          is_archived: false,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
      total: 1,
    });

    const boards = await getBoards();
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe("Projeto Alpha");
    expect(boards[0].my_permission).toBe("editor");
  });

  it("retorna lista vazia quando não há boards", async () => {
    mock.onGet("/boards").reply(200, { items: [], total: 0 });
    const boards = await getBoards();
    expect(boards).toHaveLength(0);
  });
});

describe("getBoard", () => {
  it("retorna board com colunas e cards aninhados", async () => {
    mock.onGet(`/boards/${BOARD_ID}`).reply(200, {
      id: BOARD_ID,
      name: "Projeto Alpha",
      my_permission: "editor",
      columns: [
        {
          id: "col-1",
          name: "Backlog",
          position: 0,
          color: "#6B7280",
          wip_limit: null,
          cards: [
            {
              id: "card-1",
              title: "Criar tela de login",
              priority: "high",
              assignee: { id: "u1", username: "alice" },
              position: 0,
              due_date: "2024-02-15",
              tags: ["frontend"],
            },
          ],
        },
        {
          id: "col-2",
          name: "Em Andamento",
          position: 1,
          color: "#3B82F6",
          wip_limit: 3,
          cards: [],
        },
      ],
    });

    const board = await getBoard(BOARD_ID);
    expect(board.name).toBe("Projeto Alpha");
    expect(board.columns).toHaveLength(2);
    expect(board.columns[0].cards).toHaveLength(1);
    expect(board.columns[1].wip_limit).toBe(3);
  });

  it("lança 404 quando board não existe", async () => {
    mock.onGet(`/boards/nao-existe`).reply(404, {
      error: { code: "NOT_FOUND", message: "Board não encontrado." },
    });

    await expect(getBoard("nao-existe")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("getActivity", () => {
  it("retorna feed de atividade do board", async () => {
    mock.onGet(`/boards/${BOARD_ID}/activity`).reply(200, {
      items: [
        {
          id: "act-1",
          card: { id: "card-1", title: "Criar tela de login" },
          action: "moved",
          observation: "Desenvolvimento iniciado.",
          from_column: "Backlog",
          to_column: "Em Andamento",
          performed_by: { id: "u1", username: "alice" },
          created_at: "2024-01-15T10:00:00Z",
        },
      ],
    });

    const activity = await getActivity(BOARD_ID);
    expect(activity).toHaveLength(1);
    expect(activity[0].action).toBe("moved");
    expect(activity[0].card.title).toBe("Criar tela de login");
  });
});
