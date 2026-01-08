// src/app/dashboard/reports/page.tsx
"use client";

import { ReportsCharts, ReportsFilters, ReportsHeader } from "../../../components/dashboard/reports";


const Reports = () => {
  return (
    <section className="space-y-6" dir="ltr">
      <ReportsHeader />
      <ReportsFilters />
      <ReportsCharts />
    </section>
  );
};

export default Reports;
