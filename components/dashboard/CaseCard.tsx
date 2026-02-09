"use client";

import { Case, STATUS_LABELS, STATUS_COLORS, STEP_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseCardProps {
  case: Case;
  onClick: () => void;
}

export function CaseCard({ case: caseData, onClick }: CaseCardProps) {
  const steps = [1, 2, 3] as const;

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        {/* 케이스 제목 */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {caseData.foreignerName} · {caseData.companyName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{caseData.visaType}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>마지막 작업: {caseData.lastUpdated}</span>
          </div>
        </div>

        {/* 상태 배지 */}
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            STATUS_COLORS[caseData.status]
          )}
        >
          {STATUS_LABELS[caseData.status]}
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors",
                  caseData.currentStep === step
                    ? "bg-blue-500 text-white"
                    : caseData.currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    "w-10 h-0.5",
                    caseData.currentStep > step ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        {/* 현재 단계 강조 */}
        <p className="text-sm">
          <span className="text-gray-500">현재: </span>
          <span className="text-blue-600 font-semibold">{STEP_LABELS[caseData.currentStep]}</span>
        </p>
      </div>

      {/* 진행 상태 요약 */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          {caseData.stepProgress}
        </span>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
          케이스 열기
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Card>
  );
}