"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CaseCard } from "@/components/dashboard/CaseCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CreateCaseDialog } from "@/components/dashboard/CreateCaseDialog";
import { MOCK_CASES } from "@/lib/mock-data";
import { Case, CaseStatus } from "@/lib/types";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "collecting" | "writing" | "revision" | "ready" | "completed";

const FILTER_TABS: { id: FilterTab; label: string; statusFilter?: CaseStatus[] }[] = [
  { id: "all", label: "전체" },
  { id: "collecting", label: "진행중", statusFilter: ["collecting", "writing"] },
  { id: "revision", label: "보완요청", statusFilter: ["revision"] },
  { id: "ready", label: "출력대기", statusFilter: ["ready"] },
  { id: "completed", label: "완료", statusFilter: ["completed"] },
];

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 필터링된 케이스
  const filteredCases = cases.filter((c) => {
    const tab = FILTER_TABS.find((t) => t.id === activeFilter);
    if (!tab?.statusFilter) return true;
    return tab.statusFilter.includes(c.status);
  });

  // 케이스 생성
  const handleCreateCase = (data: {
    foreignerName: string;
    companyName: string;
    visaType: string;
  }) => {
    const newCase: Case = {
      id: `case-${Date.now()}`,
      foreignerName: data.foreignerName,
      companyName: data.companyName,
      visaType: data.visaType,
      status: "collecting",
      currentStep: 1,
      stepProgress: "제출 서류 0/9 완료",
      createdAt: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setCases([newCase, ...cases]);

    // 새 케이스의 wizard로 즉시 이동
    router.push(`/wizard?caseId=${newCase.id}`);
  };

  // 케이스 클릭
  const handleCaseClick = (caseId: string) => {
    router.push(`/wizard?caseId=${caseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Image src="/LinkVisa.png" alt="LinkVisa" width={140} height={36} priority />
              <p className="text-xs text-gray-400 mt-1">효율적 비자 관리 시스템</p>
            </div>
            <Button size="lg" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              새 케이스 만들기
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {cases.length === 0 ? (
          <EmptyState onCreateCase={() => setIsCreateDialogOpen(true)} />
        ) : (
          <>
            {/* 필터 탭 */}
            <div className="mb-6">
              <div className="flex gap-2 bg-white p-2 rounded-lg border border-gray-200 inline-flex">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      activeFilter === tab.id
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {tab.label}
                    {tab.id === "all" && (
                      <span className="ml-2 text-xs opacity-75">
                        ({cases.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 케이스 카드 그리드 */}
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  해당하는 케이스가 없습니다
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCases.map((caseData) => (
                  <CaseCard
                    key={caseData.id}
                    case={caseData}
                    onClick={() => handleCaseClick(caseData.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 새 케이스 생성 다이얼로그 */}
      <CreateCaseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCase={handleCreateCase}
      />
    </div>
  );
}