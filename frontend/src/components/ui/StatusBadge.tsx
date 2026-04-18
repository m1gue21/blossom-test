interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { color: string; dot: string }> = {
  Alive: { color: 'bg-green-500/20 text-green-400 border border-green-500/30', dot: 'bg-green-400' },
  Dead: { color: 'bg-red-500/20 text-red-400 border border-red-500/30', dot: 'bg-red-400' },
  unknown: { color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30', dot: 'bg-gray-400' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['unknown'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
