"use client";

import { useState } from "react";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { ShareLinkBanner } from "@/components/wizard/ShareLinkBanner";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface Step2Props {
  caseId: string;
  documents: Record<string, UploadedFile | null>;
  onFileUpload: (docId: string, file: File) => void;
  onFileRemove: (docId: string) => void;
}

export function Step2CompanyDocuments({
  caseId,
  documents,
  onFileUpload,
  onFileRemove,
}: Step2Props) {
  const [isCorporation, setIsCorporation] = useState(true);

  const COMPANY_DOCUMENTS = [
    {
      id: "business_license",
      title: "사업자등록증",
      description: "사업자등록증 사본 (최신본)",
      required: true,
    },
    {
      id: "corporate_register",
      title: "법인등기부등본",
      description: "발급일 3개월 이내 (법인인 경우)",
      required: isCorporation,
      conditional: true,
    },
    {
      id: "insurance_list",
      title: "4대보험 가입자 명부",
      description: "국민연금공단 발급 (최근 1개월 이내)",
      required: true,
    },
    {
      id: "sales_proof",
      title: "매출 증빙",
      description: "부가가치세 과세표준증명 또는 재무제표",
      required: true,
    },
    {
      id: "office_photos",
      title: "사업장 사진",
      description: "근무 공간 전경 및 업무 환경",
      required: true,
    },
    {
      id: "employment_contract",
      title: "고용계약서",
      description: "외국인과 체결한 고용계약서 (서명본)",
      required: true,
    },
  ];

  const visibleDocuments = COMPANY_DOCUMENTS.filter(
    (doc) => !doc.conditional || isCorporation
  );
  const uploadedCount = visibleDocuments.filter((doc) => documents[doc.id])
    .length;
  const totalCount = visibleDocuments.length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            사업체 서류 올리기
          </h1>
          <p className="text-gray-600">
            채용 사업체가 제출한 서류를 여기로 올려주세요.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              진행률: {uploadedCount}/{totalCount} 완료
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-700">사업체 형태:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCorporation(true)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isCorporation
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  법인
                </button>
                <button
                  onClick={() => setIsCorporation(false)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    !isCorporation
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  개인
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {visibleDocuments.map((doc) => (
            <DocumentDropCard
              key={doc.id}
              title={doc.title}
              description={doc.description}
              required={doc.required}
              file={documents[doc.id]}
              onFileUpload={(file) => onFileUpload(doc.id, file)}
              onFileRemove={() => onFileRemove(doc.id)}
            />
          ))}
        </div>

        {uploadedCount >= visibleDocuments.filter((d) => d.required).length &&
          uploadedCount < totalCount && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                필수 서류가 준비되었습니다. 다음 단계로 이동하실 수 있습니다.
              </p>
            </div>
          )}

        {uploadedCount < visibleDocuments.filter((d) => d.required).length && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              필수 서류{" "}
              {visibleDocuments.filter((d) => d.required).length - uploadedCount}
              개를 더 올려주세요.
            </p>
          </div>
        )}

        {/* 링크 공유 배너 */}
        <div className="mt-6">
          <ShareLinkBanner
            type="company"
            caseId={caseId}
            uploadedCount={uploadedCount}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
}