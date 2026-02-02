"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";

interface ShareLinkPanelProps {
  caseId: string;
  foreignerUploaded: number;
  foreignerTotal: number;
  companyUploaded: number;
  companyTotal: number;
}

export function ShareLinkPanel({
  caseId,
  foreignerUploaded,
  foreignerTotal,
  companyUploaded,
  companyTotal,
}: ShareLinkPanelProps) {
  const [copiedForeigner, setCopiedForeigner] = useState(false);
  const [copiedCompany, setCopiedCompany] = useState(false);

  const foreignerLink = `${window.location.origin}/upload/foreigner?caseId=${caseId}`;
  const companyLink = `${window.location.origin}/upload/company?caseId=${caseId}`;

  const copyToClipboard = async (text: string, type: "foreigner" | "company") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "foreigner") {
        setCopiedForeigner(true);
        setTimeout(() => setCopiedForeigner(false), 2000);
      } else {
        setCopiedCompany(true);
        setTimeout(() => setCopiedCompany(false), 2000);
      }
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          서류 수집 링크
        </CardTitle>
        <p className="text-sm text-gray-600 font-normal mt-1">
          외국인과 사업체에게 아래 링크를 보내세요. 카톡으로 전송하면 직접 서류를
          올릴 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 외국인용 링크 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                외국인용 링크
              </div>
              <div className="text-xs text-gray-600">
                업로드 현황: {foreignerUploaded}/{foreignerTotal} 완료
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                foreignerUploaded >= 4
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {foreignerUploaded >= 4 ? "✓ 충분" : "대기 중"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={foreignerLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md font-mono text-gray-700"
            />
            <Button
              size="sm"
              onClick={() => copyToClipboard(foreignerLink, "foreigner")}
              className="flex-shrink-0"
            >
              {copiedForeigner ? (
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
              onClick={() => window.open(foreignerLink, "_blank")}
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            💡 이 링크를 외국인 본인에게 카톡으로 보내세요
          </div>
        </div>

        {/* 사업체용 링크 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                사업체용 링크
              </div>
              <div className="text-xs text-gray-600">
                업로드 현황: {companyUploaded}/{companyTotal} 완료
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                companyUploaded >= 5
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {companyUploaded >= 5 ? "✓ 충분" : "대기 중"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={companyLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md font-mono text-gray-700"
            />
            <Button
              size="sm"
              onClick={() => copyToClipboard(companyLink, "company")}
              className="flex-shrink-0"
            >
              {copiedCompany ? (
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
              onClick={() => window.open(companyLink, "_blank")}
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            💡 이 링크를 채용 사업체 담당자에게 카톡으로 보내세요
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <div className="font-semibold mb-1">✓ 사용 방법</div>
          <ol className="text-xs space-y-1 ml-4 list-decimal">
            <li>위 링크를 복사 버튼으로 복사합니다</li>
            <li>카톡으로 외국인/사업체에게 전송합니다</li>
            <li>상대방이 링크를 열어 직접 서류를 올립니다</li>
            <li>여기서 실시간으로 업로드 현황을 확인합니다</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}