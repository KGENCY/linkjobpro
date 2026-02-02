"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { Building2, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

export default function CompanyUploadPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [isCorporation, setIsCorporation] = useState(true);
  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    business_license: null,
    corporate_register: null,
    insurance_list: null,
    sales_proof: null,
    office_photos: null,
    employment_contract: null,
  });

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

  const handleFileUpload = (docId: string, file: File) => {
    setDocuments({
      ...documents,
      [docId]: {
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });

    // 실제로는 여기서 서버로 전송
    console.log("파일 업로드:", caseId, docId, file.name);
  };

  const handleFileRemove = (docId: string) => {
    setDocuments({
      ...documents,
      [docId]: null,
    });
  };

  const visibleDocuments = COMPANY_DOCUMENTS.filter(
    (doc) => !doc.conditional || isCorporation
  );

  const uploadedCount = visibleDocuments.filter((doc) => documents[doc.id]).length;
  const totalCount = visibleDocuments.length;
  const requiredCount = visibleDocuments.filter((d) => d.required).length;
  const uploadedRequiredCount = visibleDocuments.filter(
    (d) => d.required && documents[d.id]
  ).length;

  const isComplete = uploadedRequiredCount >= requiredCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                사업체 서류 제출
              </h1>
              <p className="text-sm text-gray-600">E-7 비자 신청용</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 안내 메시지 */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">
            안내사항
          </h2>
          <ul className="text-sm text-purple-800 space-y-1.5">
            <li>• 아래 사업체 관련 서류를 준비하여 업로드해 주세요</li>
            <li>• 필수 서류는 반드시 제출해야 합니다</li>
            <li>• 파일은 PDF, JPG, PNG 형식으로 올려주세요</li>
            <li>• 업로드 즉시 행정사에게 전달됩니다</li>
          </ul>
        </div>

        {/* 사업체 형태 선택 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            사업체 형태를 선택해주세요
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCorporation(true)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isCorporation
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              법인 사업자
            </button>
            <button
              onClick={() => setIsCorporation(false)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                !isCorporation
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              개인 사업자
            </button>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">제출 진행률</div>
              <div className="text-2xl font-bold text-gray-900">
                {uploadedCount} / {totalCount}
              </div>
            </div>
            {isComplete && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">필수 서류 완료</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* 서류 업로드 카드 */}
        <div className="space-y-4">
          {visibleDocuments.map((doc) => (
            <DocumentDropCard
              key={doc.id}
              title={doc.title}
              description={doc.description}
              required={doc.required}
              file={documents[doc.id]}
              onFileUpload={(file) => handleFileUpload(doc.id, file)}
              onFileRemove={() => handleFileRemove(doc.id)}
            />
          ))}
        </div>

        {/* 완료 메시지 */}
        {isComplete && (
          <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              서류 제출이 완료되었습니다!
            </h3>
            <p className="text-green-800">
              행정사가 서류를 확인하고 다음 절차를 진행할 예정입니다.
              <br />이 창은 닫으셔도 됩니다.
            </p>
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            문의사항이 있으신가요?
          </h3>
          <p className="text-sm text-gray-600">
            서류 업로드 중 문제가 발생하면 링크를 보내주신 행정사에게
            연락해주세요.
          </p>
        </div>
      </main>
    </div>
  );
}