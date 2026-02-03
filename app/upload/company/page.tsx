"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

const COMPANY_DOCUMENTS = [
  {
    id: "business_license",
    title: "사업자등록증",
    description: "사업자등록증 사본 (최신본)",
    required: true,
    category: "basic"
  },
  {
    id: "corporate_register",
    title: "법인등기부등본",
    description: "발급일 3개월 이내 (법인인 경우)",
    required: false,
    category: "basic",
    conditional: true,
    conditionalType: "corporation"
  },
  {
    id: "tax_payment",
    title: "납부내역증명/재무제표",
    description: "납세사실증명 또는 회사 재무제표",
    required: true,
    category: "finance"
  },
  {
    id: "national_tax",
    title: "국세 납세증명서",
    description: "국세완납증명서 (정상영업 및 세금체납 여부 확인)",
    required: true,
    category: "finance"
  },
  {
    id: "local_tax",
    title: "지방세 납세증명서",
    description: "지방세 납세증명서 (정상영업 및 세금체납 여부 확인)",
    required: true,
    category: "finance"
  },
  {
    id: "employment_contract",
    title: "고용계약서 원본 및 사본",
    description: "시간당 급여, 일일 근무시간, 계약기간(3개월 이상), 근무내용 포함",
    required: true,
    category: "employment"
  },
  {
    id: "employment_recommendation",
    title: "고용필요성 입증서류",
    description: "고용추천서 또는 고용사유서 (직종별)",
    required: false,
    category: "employment",
    conditional: true
  },
  {
    id: "insurance_acquisition",
    title: "고용보험피보험자격 취득내역",
    description: "사업장용, 국민고용 보호 심사기준 적용대상 필수",
    required: false,
    category: "insurance",
    conditional: true
  },
  {
    id: "workplace_info",
    title: "사업장고용정보현황",
    description: "직종별 심사기준에 따라 제출 (해당자)",
    required: false,
    category: "insurance",
    conditional: true
  },
  {
    id: "guarantee",
    title: "신원보증서",
    description: "별지 제129호 서식 (특정 직종만 해당)",
    required: false,
    category: "special",
    conditional: true
  },
];

export default function CompanyUploadPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [isCorporation, setIsCorporation] = useState(true);

  // 선택된 서류 ID 목록 관리
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    new Set(COMPANY_DOCUMENTS.filter(d => d.required).map(d => d.id))
  );

  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    business_license: null,
    corporate_register: null,
    tax_payment: null,
    national_tax: null,
    local_tax: null,
    employment_contract: null,
    employment_recommendation: null,
    insurance_acquisition: null,
    workplace_info: null,
    guarantee: null,
  });

  // 서류 선택/해제 토글
  const toggleDocSelection = (docId: string, required: boolean) => {
    if (required) return; // 필수 서류는 토글 불가

    setSelectedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
        // 선택 해제 시 업로드된 파일도 제거
        setDocuments(current => ({ ...current, [docId]: null }));
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

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

  // 선택된 서류만 표시
  const visibleDocuments = COMPANY_DOCUMENTS.filter(doc => selectedDocs.has(doc.id));

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

        {/* 서류 선택 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            제출할 서류 선택
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {COMPANY_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDocSelection(doc.id, doc.required)}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left
                  ${selectedDocs.has(doc.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${doc.required ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                `}
                disabled={doc.required}
              >
                <Checkbox
                  checked={selectedDocs.has(doc.id)}
                  disabled={doc.required}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">
                      {doc.title}
                    </span>
                    {doc.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        필수
                      </span>
                    )}
                    {doc.conditional && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        조건부
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {doc.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * 필수 서류는 선택 해제할 수 없습니다. 조건부 서류는 해당하는 경우에만 선택해주세요.
          </p>
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