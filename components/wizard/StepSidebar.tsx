"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseNotesPanel } from "./CaseNotesPanel";

interface Step {
  number: number;
  title: string;
  completed: boolean;
  subSteps?: { title: string; completed: boolean }[];
}

interface StepSidebarProps {
  steps: Step[];
  currentStep: number;
  // 케이스 특이사항 (메모장형)
  caseMemo?: string;
  onMemoChange?: (memo: string) => void;
  lastMemoSavedAt?: string;
}

export function StepSidebar({
  steps,
  currentStep,
  caseMemo = "",
  onMemoChange,
  lastMemoSavedAt,
}: StepSidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-hidden">
      <h2 className="text-lg font-bold text-gray-900 mb-6">진행 단계</h2>
      <div className="space-y-2">
        {steps.map((step, index) => {
          // 1단계: 제출 서류 요건 (외국인 + 사업체 동시 진행)
          if (step.number === 1) {
            const isActive = currentStep === 1;
            const isCompleted = step.completed;

            return (
              <div key={step.number} className="mb-4">
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors",
                    isActive && "bg-blue-50",
                    isCompleted && "opacity-75"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {step.title}
                    </div>
                    {/* 동시 진행 서브 항목 */}
                    {step.subSteps && isActive && (
                      <div className="mt-2 space-y-1.5">
                        {step.subSteps.map((subStep, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center gap-2 text-xs"
                          >
                            {subStep.completed ? (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            ) : (
                              <Circle className="w-4 h-4 text-blue-400" />
                            )}
                            <span className={cn(
                              subStep.completed ? "text-green-700" : "text-blue-700"
                            )}>
                              {subStep.title}
                            </span>
                          </div>
                        ))}
                        <p className="text-[10px] text-gray-400 mt-1 pl-6">
                          동시 진행 가능
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 나머지 단계 (2, 3번 = 서류 생성, 최종 출력)
          const actualStepNumber = step.number;
          const isActive = currentStep === actualStepNumber;
          const isCompleted = step.completed;

          return (
            <div
              key={step.number}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                isActive && "bg-blue-50",
                isCompleted && "opacity-75"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : actualStepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 케이스 특이사항 패널 (메모장형) */}
      {onMemoChange && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <CaseNotesPanel
            memo={caseMemo}
            onMemoChange={onMemoChange}
            lastSavedAt={lastMemoSavedAt}
          />
        </div>
      )}
    </div>
  );
}
