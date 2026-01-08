// src/components/dashboard/reports/ReportsCard.tsx
"use client";

import type { ReactNode } from "react";


type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const ReportsCard = ({ title, subtitle, children }: Props) => {
  return (
    <div className="rounded-2xl border border-background-dark bg-surface-dark/90 p-4 shadow-lg">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text-light">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
};

export default ReportsCard;
