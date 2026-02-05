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
    (doc) => !('conditional' in doc) || !(doc as any).conditional || isCorporation
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
    <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            사업체 서류 올리기
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            채용 사업체가 제출한 서류를 여기로 올려주세요.
          </p>
        </div>

        {/* 링크 공유 배너 - 상단으로 이동 */}
        <div className="mb-6">
          <ShareLinkBanner
            type="company"
            caseId={caseId}
            uploadedCount={uploadedCount}
            totalCount={totalCount}
          />
        </div>

        {/* 사업체 형태 선택 */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur border border-purple-200/60 px-5 py-2.5 rounded-xl shadow-sm">
            <span className="text-sm font-semibold text-gray-700">사업체 형태:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCorporation(true)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isCorporation
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                법인
              </button>
              <button
                onClick={() => setIsCorporation(false)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isCorporation
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                개인
              </button>
            </div>
          </div>
        </div>

        {/* 서류 업로드 현황 모니터링 */}
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur border-2 border-purple-300/40 rounded-2xl p-6 shadow-md">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <h3 className="text-lg font-bold text-gray-900">
                  사업체 서류 업로드 현황
                </h3>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                사업체가 링크를 통해 직접 업로드한 서류를 실시간으로 확인하세요
              </p>
            </div>
            <button
              onClick={() => window.location.href = 'tel:010-9876-5432'}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              010-9876-5432
            </button>
          </div>

          {/* 진행률 바 */}
          <div className="mb-4 bg-white rounded-xl p-3 shadow-sm border border-purple-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">업로드 진행률</span>
              <span className="text-sm font-bold text-purple-600">
                {uploadedCount}/{totalCount} 완료
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* 서류 체크리스트 */}
          <div className="grid grid-cols-3 gap-3">
            {visibleDocuments.map((doc) => {
              const isUploaded = documents[doc.id] !== null;
              return (
                <div
                  key={doc.id}
                  className={`flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg transition-all ${
                    isUploaded
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {isUploaded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                  )}
                  <span className={isUploaded ? "text-gray-900 font-semibold" : "text-gray-500"}>
                    {doc.title}
                  </span>
                </div>
              );
            })}
          </div>

          {uploadedCount === 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>아직 업로드된 서류가 없습니다. 사업체에게 링크를 전송했는지 확인하세요.</span>
            </div>
          )}
        </div>

        {/* 메인 컨텐츠 영역 - 왼쪽 넓게, 오른쪽 좁게 */}
        <div className="flex gap-6">
          {/* 왼쪽: 서류 업로드 카드 (넓음) */}
          <div className="flex-1">
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
          </div>

          {/* 오른쪽: E-7 추가 서류 선택 (좁음, 사이드바) */}
          {availableToAdd.length > 0 && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8 bg-white/80 backdrop-blur border-2 border-dashed border-purple-300/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    E-7 추가 서류
                  </h3>
                </div>
                <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                  클릭하여 왼쪽에 추가
                </p>
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {availableToAdd.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => addDocument(doc.id)}
                      className="w-full flex items-start gap-2.5 p-3.5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50/80 transition-all duration-200 text-left group hover:shadow-md"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-[13px] leading-tight">
                          {doc.title}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}