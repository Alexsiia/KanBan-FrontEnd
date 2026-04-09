import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { api } from "@/services/api";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  localStorage.clear();
});

describe("API interceptor — token", () => {
  it("anexa Authorization header quando token existe no localStorage", async () => {
    localStorage.setItem("access_token", "meu-token-123");

    let capturedHeaders: Record<string, string> = {};
    mock.onGet("/boards").reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, { items: [], total: 0 }];
    });

    await api.get("/boards");

    expect(capturedHeaders["Authorization"]).toBe("Bearer meu-token-123");
  });

  it("não anexa Authorization quando não há token", async () => {
    let capturedHeaders: Record<string, string> = {};
    mock.onGet("/boards").reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, { items: [], total: 0 }];
    });

    await api.get("/boards");

    expect(capturedHeaders["Authorization"]).toBeUndefined();
  });
});

describe("API interceptor — refresh token", () => {
  it("renova o token ao receber 401 e re-tenta a requisição", async () => {
    localStorage.setItem("access_token", "token-expirado");
    localStorage.setItem("refresh_token", "refresh-valido");

    let callCount = 0;
    mock.onGet("/boards").reply(() => {
      callCount++;
      if (callCount === 1) return [401, {}];
      return [200, { items: [], total: 0 }];
    });

    mock.onPost("/auth/refresh").reply(200, {
      access_token: "token-novo",
      expires_in: 3600,
    });

    const result = await api.get("/boards");

    expect(result.status).toBe(200);
    expect(localStorage.getItem("access_token")).toBe("token-novo");
  });

  it("limpa localStorage e redireciona quando refresh falha", async () => {
    localStorage.setItem("access_token", "token-expirado");
    localStorage.setItem("refresh_token", "refresh-expirado");

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    mock.onGet("/boards").reply(401, {});
    mock.onPost("/auth/refresh").reply(401, {});

    await expect(api.get("/boards")).rejects.toBeDefined();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(window.location.href).toBe("/login");

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });
});
