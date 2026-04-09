import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoveModal } from "@/components/board/MoveModal";

const defaultProps = {
  fromColumn: "Backlog",
  toColumn: "Em Andamento",
  cardTitle: "Criar tela de login",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MoveModal", () => {
  it("renderiza com informações corretas de origem e destino", () => {
    render(<MoveModal {...defaultProps} />);

    expect(screen.getByText("Mover Card")).toBeInTheDocument();
    expect(screen.getByText("Criar tela de login")).toBeInTheDocument();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Em Andamento")).toBeInTheDocument();
  });

  it("botão Confirmar começa desabilitado", () => {
    render(<MoveModal {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /confirmar/i });
    expect(btn).toBeDisabled();
  });

  it("botão Confirmar fica desabilitado com menos de 10 caracteres", async () => {
    const user = userEvent.setup();
    render(<MoveModal {...defaultProps} />);

    await user.type(screen.getByRole("textbox"), "curto");

    const btn = screen.getByRole("button", { name: /confirmar/i });
    expect(btn).toBeDisabled();
  });

  it("botão Confirmar é habilitado com 10+ caracteres", async () => {
    const user = userEvent.setup();
    render(<MoveModal {...defaultProps} />);

    await user.type(
      screen.getByRole("textbox"),
      "Observação longa o suficiente para passar."
    );

    const btn = screen.getByRole("button", { name: /confirmar/i });
    expect(btn).not.toBeDisabled();
  });

  it("chama onConfirm com o texto da observação", async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn().mockResolvedValue(undefined);
    render(<MoveModal {...defaultProps} onConfirm={mockConfirm} />);

    const obs = "Iniciando após reunião com o cliente.";
    await user.type(screen.getByRole("textbox"), obs);
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(obs);
    });
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();
    render(<MoveModal {...defaultProps} onCancel={mockCancel} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao clicar no X", async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();
    render(<MoveModal {...defaultProps} onCancel={mockCancel} />);

    // X button (close)
    const closeButtons = screen.getAllByRole("button");
    const xBtn = closeButtons.find((b) => !b.textContent?.match(/cancelar|confirmar/i));
    await user.click(xBtn!);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it("exibe mensagem de erro quando onConfirm rejeita com 409", async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn().mockRejectedValue({
      response: {
        data: { error: { message: "Limite WIP da coluna destino foi atingido." } },
      },
    });

    render(<MoveModal {...defaultProps} onConfirm={mockConfirm} />);

    await user.type(
      screen.getByRole("textbox"),
      "Tentando mover para coluna cheia."
    );
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Limite WIP da coluna destino foi atingido.")
      ).toBeInTheDocument();
    });
  });

  it("mostra contador de caracteres", async () => {
    const user = userEvent.setup();
    render(<MoveModal {...defaultProps} />);

    await user.type(screen.getByRole("textbox"), "Olá");
    expect(screen.getByText(/3 caracteres/i)).toBeInTheDocument();
  });

  it("exibe 'faltam N' quando abaixo do mínimo", async () => {
    const user = userEvent.setup();
    render(<MoveModal {...defaultProps} />);

    await user.type(screen.getByRole("textbox"), "12345");
    expect(screen.getByText(/faltam 5/i)).toBeInTheDocument();
  });
});
