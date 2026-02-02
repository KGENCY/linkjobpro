"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface StepSidebarProps {
  steps: Step[];
  currentStep: number;
}

export function StepSidebar({ steps, currentStep }: StepSidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">진행 단계</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors",
              currentStep === step.number && "bg-blue-50",
              step.completed && "opacity-75"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                step.completed
                  ? "bg-green-500 text-white"
                  : currentStep === step.number
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {step.completed ? <Check className="w-5 h-5" /> : step.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}