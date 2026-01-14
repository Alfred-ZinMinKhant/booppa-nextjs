import React, { Suspense } from "react";
import ReportClient from "./ReportClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-4 text-gray-400">Loading report...</div>}>
      {/* Client-side component handles search params and fetch */}
      <ReportClient />
    </Suspense>
  );
}
