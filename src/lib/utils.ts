export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour}h`;
  if (diffDay < 7) return `há ${diffDay}d`;
  return formatDate(dateStr);
}

export function getErrorMessage(error: unknown): string {
  const e = error as {
    response?: { data?: { error?: { message?: string }; detail?: string }; status?: number };
    message?: string;
  };
  return (
    e?.response?.data?.error?.message ??
    e?.response?.data?.detail ??
    e?.message ??
    "Erro desconhecido."
  );
}
