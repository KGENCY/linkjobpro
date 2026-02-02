"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  onCreateCase: () => void;
}

export function EmptyState({ onCreateCase }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          아직 케이스가 없습니다
        </h2>
        <p className="text-gray-600 mb-6">
          새 케이스를 만들어 E-7 업무를 시작하세요
        </p>
        <Button size="lg" onClick={onCreateCase}>
          새 케이스 만들기
        </Button>
      </div>
    </div>
  );
}