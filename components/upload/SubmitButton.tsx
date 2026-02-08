"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface SubmitButtonProps {
  isComplete: boolean;
  onSubmit: () => void;
  type: "foreigner" | "company";
}

export function SubmitButton({ isComplete, onSubmit, type }: SubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (!isComplete) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      onSubmit();
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const label = type === "foreigner" ? "외국인" : "사업체";
  const color = type === "foreigner" ? "blue" : "purple";

  if (showConfirm) {
    return (
      <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-lg p-6`}>
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className={`w-6 h-6 text-${color}-600 flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className={`text-lg font-semibold text-${color}-900 mb-1`}>
              서류를 전송하시겠습니까?
            </h3>
            <p className={`text-sm text-${color}-800`}>
              전송 후에는 서류를 추가하거나 수정할 수 없습니다.
              <br />
              모든 서류가 올바르게 업로드되었는지 확인해주세요.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 bg-${color}-600 hover:bg-${color}-700`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                전송하기
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!isComplete}
      className={`w-full py-6 text-lg ${
        isComplete
          ? type === "foreigner"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-purple-600 hover:bg-purple-700"
          : "bg-gray-300 cursor-not-allowed"
      }`}
    >
      <Send className="w-5 h-5 mr-2" />
      {isComplete ? `${label} 서류 전송하기` : "필수 서류를 모두 업로드해주세요"}
    </Button>
  );
}
