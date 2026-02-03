"use client";

import { useState } from "react";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { ShareLinkBanner } from "@/components/wizard/ShareLinkBanner";
import { Plus } from "lucide-react";

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

// 기본 서류 목록
const DEFAULT_COMPANY_DOCUMENTS = [
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
    required: false,
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

// E-7 추가 서류 목록
const ADDITIONAL_E7_COMPANY_DOCUMENTS = [
  {
    id: "tax_payment",
    title: "납부내역증명/재무제표",
    description: "납세사실증명 또는 회사 재무제표",
    required: false,
    category: "E-7"
  },
  {
    id: "national_tax",
    title: "국세 납세증명서",
    description: "국세완납증명서 (정상영업 및 세금체납 여부 확인)",
    required: false,
    category: "E-7"
  },
  {
    id: "local_tax",
    title: "지방세 납세증명서",
    description: "지방세 납세증명서 (정상영업 및 세금체납 여부 확인)",
    required: false,
    category: "E-7"
  },
  {
    id: "employment_recommendation",
    title: "고용필요성 입증서류",
    description: "고용추천서 또는 고용사유서 (직종별)",
    required: false,
    category: "E-7"
  },
  {
    id: "insurance_acquisition",
    title: "고용보험피보험자격 취득내역",
    description: "사업장용, 국민고용 보호 심사기준 적용대상 필수",
    required: false,
    category: "E-7"
  },
  {
    id: "workplace_info",
    title: "사업장고용정보현황",
    description: "직종별 심사기준에 따라 제출 (해당자)",
    required: false,
    category: "E-7"
  },
  {
    id: "guarantee",
    title: "신원보증서",
    description: "별지 제129호 서식 (특정 직종만 해당)",
    required: false,
    category: "E-7"
  },
];

export function Step2CompanyDocuments({
  caseId,
  documents,
  onFileUpload,
  onFileRemove,
}: Step2Props) {
  const [isCorporation, setIsCorporation] = useState(true);

  // 활성화된 서류 ID 목록
  const [activeDocIds, setActiveDocIds] = useState<Set<string>>(
    new Set(DEFAULT_COMPANY_DOCUMENTS.map(d => d.id))
  );

  // 모든 서류 목록 (기본 + 추가)
  const ALL_DOCUMENTS = [...DEFAULT_COMPANY_DOCUMENTS, ...ADDITIONAL_E7_COMPANY_DOCUMENTS];

  // 활성화된 서류만 필터링
  const activeDocuments = ALL_DOCUMENTS.filter(doc => activeDocIds.has(doc.id));

  // 추가 가능한 서류 (아직 선택되지 않은 것들)
  const availableToAdd = ADDITIONAL_E7_COMPANY_DOCUMENTS.filter(doc => !activeDocIds.has(doc.id));

  const visibleDocuments = activeDocuments.filter(
    (doc) => !doc.conditional || isCorporation
  );
  const uploadedCount = visibleDocuments.filter((doc) => documents[doc.id])
    .length;
  const totalCount = visibleDocuments.length;

  // 서류 추가
  const addDocument = (docId: string) => {
    setActiveDocIds(prev => new Set([...prev, docId]));
  };

  // 서류 제거 (기본 서류는 제거 불가)
  const removeDocument = (docId: string) => {
    const isDefault = DEFAULT_COMPANY_DOCUMENTS.some(d => d.id === docId);
    if (isDefault) return;

    setActiveDocIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(docId);
      return newSet;
    });
    // 파일도 제거
    onFileRemove(docId);
  };

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

        {/* E-7 추가 서류 선택 섹션 */}
        {availableToAdd.length > 0 && (
          <div className="mb-6 bg-white border-2 border-dashed border-purple-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-900">
                E-7 추가 서류 선택
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              필요한 추가 서류를 선택하면 아래 업로드 카드에 추가됩니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {availableToAdd.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => addDocument(doc.id)}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="mt-1">
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {doc.title}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 서류 업로드 카드 */}
        <div className="grid grid-cols-2 gap-4">
          {visibleDocuments.map((doc) => {
            const isDefault = DEFAULT_COMPANY_DOCUMENTS.some(d => d.id === doc.id);
            return (
              <div key={doc.id} className="relative">
                <DocumentDropCard
                  title={doc.title}
                  description={doc.description}
                  required={doc.required}
                  file={documents[doc.id]}
                  onFileUpload={(file) => onFileUpload(doc.id, file)}
                  onFileRemove={() => onFileRemove(doc.id)}
                />
                {!isDefault && (
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                    title="서류 제거"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
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