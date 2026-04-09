"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export function ManageColumnsModal({ boardId, onClose }: any) {
  const [columns, setColumns] = useState<any[]>([]);
  const [name, setName] = useState("");

  const fetchColumns = async () => {
    const res = await api.get(`/boards/${boardId}`);
    setColumns(res.data.columns);
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const createColumn = async () => {
    await api.post(`/boards/${boardId}/columns`, {
      name,
      position: columns.length,
    });
    setName("");
    fetchColumns();
  };

  const deleteColumn = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await api.delete(`/boards/${boardId}/columns/${id}`);
    fetchColumns();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-[400px]">
        <h2 className="font-bold mb-4">Colunas</h2>

        <div className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da coluna"
          />
          <button onClick={createColumn}>Criar</button>
        </div>

        {columns.map((c) => (
          <div key={c.id} className="flex justify-between mb-2">
            <span>{c.name}</span>
            <button onClick={() => deleteColumn(c.id)}>X</button>
          </div>
        ))}

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}