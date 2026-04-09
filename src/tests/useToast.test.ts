import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/hooks/useToast";

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("começa com lista vazia", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it("adiciona toast corretamente", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Operação realizada!", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Operação realizada!");
    expect(result.current.toasts[0].type).toBe("success");
  });

  it("remove toast pelo id", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Toast 1", "info");
    });

    const id = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("remove toast automaticamente após 4 segundos", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Auto remove", "info");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("pode ter múltiplos toasts ao mesmo tempo", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Erro 1", "error");
      result.current.addToast("Sucesso!", "success");
      result.current.addToast("Info", "info");
    });

    expect(result.current.toasts).toHaveLength(3);
  });

  it("usa 'info' como tipo padrão", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Mensagem sem tipo");
    });

    expect(result.current.toasts[0].type).toBe("info");
  });
});
