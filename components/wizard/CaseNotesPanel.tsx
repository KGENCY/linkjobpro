"use client";

import { useState, useEffect, useRef } from "react";
import { StickyNote } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────
type SaveStatus = "idle" | "typing" | "saved";

interface CaseNotesPanelProps {
  memo: string;
  onMemoChange: (memo: string) => void;
  lastSavedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export function CaseNotesPanel({
  memo,
  onMemoChange,
  lastSavedAt,
}: CaseNotesPanelProps) {
  const [localMemo, setLocalMemo] = useState(memo);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [savedTime, setSavedTime] = useState<string | undefined>(lastSavedAt);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 외부 memo prop이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setLocalMemo(memo);
  }, [memo]);

  // 입력 핸들러 (디바운스 자동 저장)
  const handleChange = (value: string) => {
    setLocalMemo(value);
    setSaveStatus("typing");

    // 기존 타이머 클리어
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 1.5초 후 자동 저장
    debounceRef.current = setTimeout(() => {
      onMemoChange(value);
      setSaveStatus("saved");
      setSavedTime(
        new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(/\. /g, "-").replace(".", "")
      );

      // 3초 후 idle 상태로 전환
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }, 1500);
  };

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 저장 상태 텍스트
  const getStatusText = () => {
    switch (saveStatus) {
      case "typing":
        return "입력 중…";
      case "saved":
        return "자동 저장됨";
      default:
        return savedTime ? `마지막 저장: ${savedTime}` : "";
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col h-full min-h-0">
      {/* 패널 헤더 */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <StickyNote className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-900">케이스 특이사항</h3>
      </div>

      {/* 메모 입력 영역 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <textarea
          value={localMemo}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="이 케이스에 대한 메모를 자유롭게 작성하세요...

예시:
- 출입국 심사 시 주의사항
- 담당자 통화 내용
- 다음 단계 확인 사항"
          className="flex-1 w-full px-3 py-2.5 bg-amber-50/50 border border-amber-200 rounded-lg
                     text-sm text-gray-700 placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300
                     resize-none leading-relaxed"
          style={{ minHeight: "120px" }}
        />

        {/* 저장 상태 표시 */}
        <div className="flex items-center justify-end mt-2 h-5 flex-shrink-0">
          {saveStatus === "typing" && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
              입력 중…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
              자동 저장됨
            </span>
          )}
          {saveStatus === "idle" && savedTime && (
            <span className="text-xs text-gray-400">
              마지막 저장: {savedTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
