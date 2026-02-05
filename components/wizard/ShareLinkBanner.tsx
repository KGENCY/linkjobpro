"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check, ExternalLink, Phone, CheckCircle2, XCircle } from "lucide-react";

interface ShareLinkBannerProps {
  type: "foreigner" | "company";
  caseId: string;
  uploadedCount: number;
  totalCount: number;
}

export function ShareLinkBanner({
  type,
  caseId,
  uploadedCount,
  totalCount,
}: ShareLinkBannerProps) {
  const [copied, setCopied] = useState(false);

  const isForeigner = type === "foreigner";
  const link = `${window.location.origin}/upload/${type}?caseId=${caseId}`;
  const title = isForeigner ? "외국인" : "사업체";
  const bgColor = isForeigner ? "bg-blue-50" : "bg-purple-50";
  const borderColor = isForeigner ? "border-blue-200" : "border-purple-200";
  const iconColor = isForeigner ? "text-blue-600" : "text-purple-600";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const isComplete = uploadedCount >= (isForeigner ? 4 : 5);

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-4">
        {/* 아이콘 & 제목 */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-white border-2 ${borderColor} flex items-center justify-center`}>
            <Link2 className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900">
              {title}에게 링크 보내기
            </h3>
            <div
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isComplete
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {uploadedCount}/{totalCount} {isComplete ? "완료" : "대기"}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            아래 링크를 카톡으로 보내면 {title}이 직접 서류를 올릴 수 있습니다
          </p>

          {/* 링크 & 버튼 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md font-mono text-gray-700 min-w-0"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              size="sm"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  복사
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(link, "_blank")}
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}