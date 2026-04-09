import React from "react";
import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

describe("PriorityBadge", () => {
  it("renderiza 'Baixa' para priority low", () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText("Baixa")).toBeInTheDocument();
  });

  it("renderiza 'Média' para priority medium", () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText("Média")).toBeInTheDocument();
  });

  it("renderiza 'Alta' para priority high", () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  it("renderiza 'Crítica' para priority critical", () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText("Crítica")).toBeInTheDocument();
  });

  it("aplica cor verde para low", () => {
    const { container } = render(<PriorityBadge priority="low" />);
    expect(container.firstChild).toHaveClass("text-green-400");
  });

  it("aplica cor vermelha para critical", () => {
    const { container } = render(<PriorityBadge priority="critical" />);
    expect(container.firstChild).toHaveClass("text-red-400");
  });
});
