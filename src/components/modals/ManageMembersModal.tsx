"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { X, Users, Plus } from "lucide-react";

interface Props {
  boardId: string;
  onClose: () => void;
}

export function ManageMembersModal({ boardId, onClose }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("editor");
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [m, u] = await Promise.all([
        api.get(`/boards/${boardId}/members`),
        api.get(`/users`),
      ]);
      setMembers(m.data.items);
      setUsers(u.data.items);
    } catch {
      alert("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function addMember() {
    if (!selectedUser) return;

    try {
      await api.post(`/boards/${boardId}/members`, {
        user_id: selectedUser,
        permission,
      });
      setSelectedUser("");
      fetchData();
    } catch {
      alert("Erro ao adicionar membro");
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remover membro?")) return;

    try {
      await api.delete(`/boards/${boardId}/members/${userId}`);
      fetchData();
    } catch {
      alert("Erro ao remover");
    }
  }

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md animate-fade-in rounded-2xl border border-kanban-border p-6 shadow-modal"
        style={{ background: "var(--surface)" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-kanban-accent" />
            <h2
              className="text-lg font-bold text-kanban-text"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Membros
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-kanban-muted hover:text-kanban-text transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* ADD MEMBER */}
        <div className="flex gap-2 mb-5">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
              text-sm text-kanban-text focus:outline-none focus:border-kanban-accent"
          >
            <option value="">Selecionar usuário</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="px-3 py-2 bg-kanban-card border border-kanban-border rounded-xl
              text-sm text-kanban-text focus:outline-none focus:border-kanban-accent"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <button
            onClick={addMember}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-kanban-accent text-white text-sm
              hover:bg-kanban-accent-light transition shadow-glow-sm"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* MEMBERS LIST */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {members.map((m) => (
            <div
              key={m.user.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-kanban-card border border-kanban-border"
            >
              <span className="text-sm text-kanban-text">
                {m.user.username}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-lg bg-kanban-accent/20 text-kanban-accent-light">
                  {m.permission}
                </span>

                <button
                  onClick={() => removeMember(m.user.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-kanban-card border border-kanban-border text-sm text-kanban-text
              hover:border-kanban-accent transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}