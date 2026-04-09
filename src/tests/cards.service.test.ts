import MockAdapter from "axios-mock-adapter";
import { api } from "@/services/api";
import { moveCard, commentCard, getCardHistory, getCard } from "@/services/cards";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
});

const CARD_ID = "card-uuid-1";
const COLUMN_ID = "col-uuid-2";

describe("moveCard", () => {
  it("move o card com observação válida", async () => {
    mock.onPost(`/cards/${CARD_ID}/move`).reply(200, {
      id: CARD_ID,
      title: "Meu Card",
      column: { id: COLUMN_ID, name: "Em Andamento" },
      position: 0,
    });

    const result = await moveCard(CARD_ID, COLUMN_ID, "Iniciando após reunião com o time.", 0);
    expect(result.column.name).toBe("Em Andamento");
  });

  it("lança erro 400 quando observação está ausente", async () => {
    mock.onPost(`/cards/${CARD_ID}/move`).reply(400, {
      error: {
        code: "OBSERVATION_REQUIRED",
        message: "Uma observação é obrigatória para mover um card.",
      },
    });

    await expect(
      moveCard(CARD_ID, COLUMN_ID, "", 0)
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it("lança erro 409 quando WIP limit atingido", async () => {
    mock.onPost(`/cards/${CARD_ID}/move`).reply(409, {
      error: {
        code: "WIP_LIMIT_REACHED",
        message: "Limite WIP da coluna destino foi atingido.",
      },
    });

    await expect(
      moveCard(CARD_ID, COLUMN_ID, "Tentativa de mover.", 0)
    ).rejects.toMatchObject({ response: { status: 409 } });
  });

  it("lança erro 422 quando card está arquivado", async () => {
    mock.onPost(`/cards/${CARD_ID}/move`).reply(422, {
      error: {
        code: "CARD_ARCHIVED",
        message: "Card arquivado não pode ser movido.",
      },
    });

    await expect(
      moveCard(CARD_ID, COLUMN_ID, "Tentativa inválida.", 0)
    ).rejects.toMatchObject({ response: { status: 422 } });
  });

  it("envia os campos corretos no body", async () => {
    let capturedBody: unknown;
    mock.onPost(`/cards/${CARD_ID}/move`).reply((config) => {
      capturedBody = JSON.parse(config.data);
      return [200, { id: CARD_ID, title: "Card", column: { id: COLUMN_ID, name: "Revisão" }, position: 2 }];
    });

    await moveCard(CARD_ID, COLUMN_ID, "Revisão solicitada pelo cliente.", 2);

    expect(capturedBody).toEqual({
      target_column_id: COLUMN_ID,
      position: 2,
      observation: "Revisão solicitada pelo cliente.",
    });
  });
});

describe("commentCard", () => {
  it("adiciona comentário com sucesso", async () => {
    mock.onPost(`/cards/${CARD_ID}/comments`).reply(201, {
      id: "history-uuid",
      action: "commented",
      observation: "Cliente aprovou o design.",
      performed_by: { id: "user-1", username: "carol" },
      created_at: "2024-01-15T10:00:00Z",
    });

    const result = await commentCard(CARD_ID, "Cliente aprovou o design.");
    expect(result.action).toBe("commented");
    expect(result.observation).toBe("Cliente aprovou o design.");
  });
});

describe("getCardHistory", () => {
  it("retorna histórico paginado corretamente", async () => {
    mock.onGet(`/cards/${CARD_ID}/history`).reply(200, {
      items: [
        {
          id: "h1",
          action: "moved",
          observation: "Desenvolvimento iniciado.",
          from_column: { id: "col-1", name: "Backlog" },
          to_column: { id: "col-2", name: "Em Andamento" },
          performed_by: { id: "u1", username: "alice" },
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "h2",
          action: "created",
          observation: null,
          from_column: null,
          to_column: { id: "col-1", name: "Backlog" },
          performed_by: { id: "u2", username: "admin" },
          created_at: "2024-01-10T09:00:00Z",
        },
      ],
      total: 2,
      page: 1,
      per_page: 20,
    });

    const result = await getCardHistory(CARD_ID);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].action).toBe("moved");
    expect(result.items[1].action).toBe("created");
    expect(result.total).toBe(2);
  });
});

describe("getCard", () => {
  it("retorna detalhes completos do card", async () => {
    mock.onGet(`/cards/${CARD_ID}`).reply(200, {
      id: CARD_ID,
      title: "Criar tela de login",
      description: "Implementar autenticação JWT",
      column: { id: "col-1", name: "Em Andamento" },
      board: { id: "board-1", name: "Projeto Alpha" },
      priority: "high",
      assignee: { id: "u1", username: "alice" },
      position: 0,
      due_date: "2024-03-01",
      tags: ["frontend", "auth"],
      created_by: { id: "u2", username: "admin" },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    });

    const card = await getCard(CARD_ID);
    expect(card.title).toBe("Criar tela de login");
    expect(card.priority).toBe("high");
    expect(card.tags).toContain("frontend");
  });
});
