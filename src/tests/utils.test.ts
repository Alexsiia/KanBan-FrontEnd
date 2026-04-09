import { formatDate, formatRelative, getErrorMessage } from "@/lib/utils";

describe("formatDate", () => {
  it("formata data ISO corretamente", () => {
    const result = formatDate("2024-03-15");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it("retorna string vazia para null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("retorna string vazia para undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });
});

describe("formatRelative", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retorna 'agora mesmo' para menos de 60 segundos", () => {
    const date = new Date("2024-06-01T11:59:30Z").toISOString();
    expect(formatRelative(date)).toBe("agora mesmo");
  });

  it("retorna minutos para menos de 1 hora", () => {
    const date = new Date("2024-06-01T11:45:00Z").toISOString();
    expect(formatRelative(date)).toBe("há 15 min");
  });

  it("retorna horas para menos de 24 horas", () => {
    const date = new Date("2024-06-01T09:00:00Z").toISOString();
    expect(formatRelative(date)).toBe("há 3h");
  });

  it("retorna dias para menos de 7 dias", () => {
    const date = new Date("2024-05-29T12:00:00Z").toISOString();
    expect(formatRelative(date)).toBe("há 3d");
  });

  it("retorna data formatada para mais de 7 dias", () => {
    const date = new Date("2024-05-01T12:00:00Z").toISOString();
    const result = formatRelative(date);
    expect(result).toMatch(/2024/);
  });
});

describe("getErrorMessage", () => {
  it("extrai mensagem do padrão de erro da API", () => {
    const error = {
      response: {
        data: { error: { message: "Observação obrigatória." } },
      },
    };
    expect(getErrorMessage(error)).toBe("Observação obrigatória.");
  });

  it("extrai detail do FastAPI", () => {
    const error = {
      response: { data: { detail: "Not found" } },
    };
    expect(getErrorMessage(error)).toBe("Not found");
  });

  it("extrai message genérica do axios", () => {
    const error = { message: "Network Error" };
    expect(getErrorMessage(error)).toBe("Network Error");
  });

  it("retorna fallback para erro desconhecido", () => {
    expect(getErrorMessage({})).toBe("Erro desconhecido.");
  });

  it("prioriza error.message sobre detail", () => {
    const error = {
      response: {
        data: {
          error: { message: "WIP limit atingido." },
          detail: "Conflict",
        },
      },
    };
    expect(getErrorMessage(error)).toBe("WIP limit atingido.");
  });
});
