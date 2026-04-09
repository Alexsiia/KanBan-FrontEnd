export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "member";
  is_active: boolean;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  owner: { id: string; username: string };
  my_permission: "editor" | "viewer" | "admin";
  members_count: number;
  cards_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color?: string;
  wip_limit: number | null;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  column?: { id: string; name: string };
  board?: { id: string; name: string };
  priority: "low" | "medium" | "high" | "critical";
  assignee?: { id: string; username: string } | null;
  position: number;
  due_date?: string | null;
  tags?: string[];
  is_archived?: boolean;
  created_by?: { id: string; username: string };
  created_at?: string;
  updated_at?: string;
}

export interface BoardDetail {
  id: string;
  name: string;
  my_permission: "editor" | "viewer" | "admin";
  columns: Column[];
}

export interface HistoryEntry {
  id: string;
  action:
    | "created"
    | "moved"
    | "edited"
    | "commented"
    | "assigned"
    | "unassigned"
    | "archived"
    | "priority_changed"
    | "due_date_changed";
  observation?: string | null;
  from_column?: { id: string; name: string } | null;
  to_column?: { id: string; name: string } | null;
  metadata?: Record<string, unknown> | null;
  performed_by: { id: string; username: string };
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  card: { id: string; title: string };
  action: string;
  observation?: string | null;
  from_column?: string | null;
  to_column?: string | null;
  performed_by: { id: string; username: string };
  created_at: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Column {
  id: string;
  name: string;
  limit?: number; // 👈 limite opcional
  cards: Card[];
}