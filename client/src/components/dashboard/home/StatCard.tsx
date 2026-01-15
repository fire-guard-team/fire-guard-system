import type { FC } from "react";

export type StatusType = "normal" | "critical" | "elevated";

export interface StatCardProps {
  title: string;
  value: string | number;
  statusLabel: string;
  statusType: StatusType;
}

const statusStyles: Record<StatusType, string> = {
  normal: "bg-green-100 text-green-700 border border-green-200",
  critical: "bg-red-100 text-red-700 border border-red-200",
  elevated: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  statusLabel,
  statusType,
}) => {
  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm flex flex-col gap-6 justify-between h-full">
      <div className="text-sm font-medium text-gray-600">{title}</div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
      </div>
      <span
        className={`w-fit inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[statusType]}`}
      >
        {statusLabel}
      </span>
    </div>
  );
};

export default StatCard;
