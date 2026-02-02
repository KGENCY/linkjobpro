"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  onPrevious,
  onNext,
}: NavigationButtonsProps) {
  return (
    <div className="border-t border-gray-200 bg-white px-8 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          이전
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="min-w-32"
        >
          {currentStep === totalSteps ? "완료" : "다음 단계로"}
          {currentStep !== totalSteps && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );
}