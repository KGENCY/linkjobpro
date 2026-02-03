"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check, ExternalLink, Phone, CheckCircle2, XCircle } from "lucide-react";

interface DocumentItem {
  name: string;
  uploaded: boolean;
}

interface ShareLinkPanelProps {
  caseId: string;
  foreignerDocuments: DocumentItem[];
  companyDocuments: DocumentItem[];
  foreignerPhone?: string;
  companyPhone?: string;
}

export function ShareLinkPanel({
  caseId,
  foreignerDocuments,
  companyDocuments,
  foreignerPhone,
  companyPhone,
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

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const uploadedForeigner = foreignerDocuments.filter(doc => doc.uploaded).length;
  const totalForeigner = foreignerDocuments.length;
  const uploadedCompany = companyDocuments.filter(doc => doc.uploaded).length;
  const totalCompany = companyDocuments.length;

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
        {/* 외국인용 섹션 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-gray-900">
              외국인 서류 받기
            </div>
            {foreignerPhone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall(foreignerPhone)}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                {foreignerPhone}
              </Button>
            )}
          </div>

          {/* 서류 체크리스트 */}
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">
              전달 현황 ({uploadedForeigner}/{totalForeigner})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {foreignerDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs"
                >
                  {doc.uploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={doc.uploaded ? "text-gray-900" : "text-gray-400"}>
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 링크 복사 */}
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
        </div>

        {/* 사업체용 섹션 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-gray-900">
              사업체 서류 받기
            </div>
            {companyPhone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall(companyPhone)}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                {companyPhone}
              </Button>
            )}
          </div>

          {/* 서류 체크리스트 */}
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">
              전달 현황 ({uploadedCompany}/{totalCompany})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {companyDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs"
                >
                  {doc.uploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={doc.uploaded ? "text-gray-900" : "text-gray-400"}>
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 링크 복사 */}
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
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <div className="font-semibold mb-1">사용 방법</div>
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