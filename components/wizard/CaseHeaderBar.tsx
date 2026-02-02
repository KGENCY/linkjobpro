"use client";

import { Progress } from "@/components/ui/progress";

interface CaseHeaderBarProps {
  foreignerName: string;
  companyName: string;
  visaType: string;
  progress: number;
}

export function CaseHeaderBar({
  foreignerName,
  companyName,
  visaType,
  progress,
}: CaseHeaderBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">외국인:</span>{" "}
              <span className="font-semibold text-gray-900">{foreignerName}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div>
              <span className="text-gray-500">회사:</span>{" "}
              <span className="font-semibold text-gray-900">{companyName}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div>
              <span className="text-gray-500">신청:</span>{" "}
              <span className="font-semibold text-gray-900">{visaType}</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(progress)}% 완료
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}