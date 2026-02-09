"use client";

import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

interface EmptyStateProps {
  onCreateCase: () => void;
}

export function EmptyState({ onCreateCase }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          첫 케이스를 만들어보세요
        </h2>
        <p className="text-gray-600 mb-2">
          하나의 케이스 안에서 비자 서류와 문서를 한 번에 관리합니다.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          모든 서류와 문서는 케이스별로 자동 정리됩니다.
        </p>
        <Button size="lg" onClick={onCreateCase}>
          새 케이스 만들기
        </Button>
      </div>
    </div>
  );
}