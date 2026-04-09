import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { api } from "@/services/api";
import { login, logout, getMe } from "@/services/auth";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  localStorage.clear();
});

describe("login", () => {
  it("retorna tokens e dados do usuário em login bem-sucedido", async () => {
    mock.onPost("/auth/login").reply(200, {
      access_token: "token-abc",
      refresh_token: "refresh-xyz",
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: "uuid-1",
        username: "alice",
        email: "alice@kanban.dev",
        role: "member",
      },
    });

    const data = await login("alice", "Teste@123");

    expect(data.access_token).toBe("token-abc");
    expect(data.refresh_token).toBe("refresh-xyz");
    expect(data.user.username).toBe("alice");
  });

  it("lança erro 401 para credenciais inválidas", async () => {
    mock.onPost("/auth/login").reply(401, {
      error: { code: "INVALID_CREDENTIALS", message: "Credenciais inválidas." },
    });

    await expect(login("alice", "errada")).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("lança erro 403 para usuário inativo", async () => {
    mock.onPost("/auth/login").reply(403, {
      error: { code: "USER_INACTIVE", message: "Usuário inativo." },
    });

    await expect(login("dave", "Teste@123")).rejects.toMatchObject({
      response: { status: 403 },
    });
  });
});

describe("getMe", () => {
  it("retorna dados do usuário autenticado", async () => {
    localStorage.setItem("access_token", "valid-token");

    mock.onGet("/auth/me").reply(200, {
      id: "uuid-1",
      username: "alice",
      email: "alice@kanban.dev",
      role: "member",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    });

    const user = await getMe();
    expect(user.username).toBe("alice");
    expect(user.is_active).toBe(true);
  });
});

describe("logout", () => {
  it("chama o endpoint de logout com sucesso", async () => {
    localStorage.setItem("access_token", "valid-token");
    mock.onPost("/auth/logout").reply(204);

    await expect(logout()).resolves.not.toThrow();
  });
});
