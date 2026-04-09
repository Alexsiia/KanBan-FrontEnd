const config = {
  low: { label: "Baixa", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  medium: { label: "Média", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  high: { label: "Alta", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  critical: { label: "Crítica", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export function PriorityBadge({
  priority,
}: {
  priority: "low" | "medium" | "high" | "critical";
}) {
  const { label, color } = config[priority] ?? config.medium;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      {label}
    </span>
  );
}
