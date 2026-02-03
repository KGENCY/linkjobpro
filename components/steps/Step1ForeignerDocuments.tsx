"use client";

import { useState } from "react";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { ShareLinkBanner } from "@/components/wizard/ShareLinkBanner";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface Step1Props {
  caseId: string;
  documents: Record<string, UploadedFile | null>;
  onFileUpload: (docId: string, file: File) => void;
  onFileRemove: (docId: string) => void;
}

// 기본 서류 목록
const DEFAULT_DOCUMENTS = [
  {
    id: "passport",
    title: "여권 사본",
    description: "여권 사진면 포함, 모든 페이지 스캔",
    required: true,
  },
  {
    id: "arc",
    title: "외국인등록증(ARC) 사본",
    description: "앞뒤면 모두 스캔",
    required: true,
  },
  {
    id: "photo",
    title: "증명사진",
    description: "3.5cm x 4.5cm 규격, 최근 6개월 이내 촬영",
    required: true,
  },
  {
    id: "diploma",
    title: "졸업증명서",
    description: "최종학력 졸업증명서 (영문 또는 한글)",
    required: true,
  },
  {
    id: "transcript",
    title: "성적증명서",
    description: "최종학력 성적증명서 (영문 또는 한글)",
    required: false,
  },
  {
    id: "address",
    title: "주소 증빙",
    description: "임대차계약서 또는 기숙사 확인서",
    required: false,
  },
];

// E-7 추가 서류 목록
const ADDITIONAL_E7_DOCUMENTS = [
  {
    id: "application_form",
    title: "통합신청서",
    description: "별지 제34호 서식",
    required: false,
    category: "E-7"
  },
  {
    id: "tuberculosis",
    title: "결핵진단서",
    description: "보건소 또는 법무부지정병원, 3개월 이내 발급 (해당자)",
    required: false,
    category: "E-7"
  },
  {
    id: "residence_proof",
    title: "체류지 입증서류",
    description: "부동산등기부등본 또는 전월세계약서",
    required: false,
    category: "E-7"
  },
  {
    id: "job_application",
    title: "외국인 직업 신고서",
    description: "지정 서식 작성",
    required: false,
    category: "E-7"
  },
  {
    id: "qualifications",
    title: "외국인 자격요건 입증서류",
    description: "학위증, 경력증명서, 자격증 등",
    required: false,
    category: "E-7"
  },
];

export function Step1ForeignerDocuments({
  caseId,
  documents,
  onFileUpload,
  onFileRemove,
}: Step1Props) {
  // 활성화된 서류 ID 목록
  const [activeDocIds, setActiveDocIds] = useState<Set<string>>(
    new Set(DEFAULT_DOCUMENTS.map(d => d.id))
  );

  // 모든 서류 목록 (기본 + 추가)
  const ALL_DOCUMENTS = [...DEFAULT_DOCUMENTS, ...ADDITIONAL_E7_DOCUMENTS];

  // 활성화된 서류만 필터링
  const activeDocuments = ALL_DOCUMENTS.filter(doc => activeDocIds.has(doc.id));

  // 추가 가능한 서류 (아직 선택되지 않은 것들)
  const availableToAdd = ADDITIONAL_E7_DOCUMENTS.filter(doc => !activeDocIds.has(doc.id));

  const uploadedCount = activeDocuments.filter(doc => documents[doc.id]).length;
  const totalCount = activeDocuments.length;

  // 서류 추가
  const addDocument = (docId: string) => {
    setActiveDocIds(prev => new Set([...prev, docId]));
  };

  // 서류 제거 (기본 서류는 제거 불가)
  const removeDocument = (docId: string) => {
    const isDefault = DEFAULT_DOCUMENTS.some(d => d.id === docId);
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
            외국인 서류 올리기
          </h1>
          <p className="text-gray-600">
            외국인이 제출한 서류를 여기로 올려주세요. 최소 4개 이상 필요합니다.
          </p>
        </div>

        {/* 링크 공유 배너 - 상단으로 이동 */}
        <div className="mb-6">
          <ShareLinkBanner
            type="foreigner"
            caseId={caseId}
            uploadedCount={uploadedCount}
            totalCount={totalCount}
          />
        </div>

        {/* 서류 전달 상태 박스 */}
        <div className="mb-6 bg-white border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              외국인 서류 전달 현황
            </h3>
            <button
              onClick={() => window.location.href = 'tel:010-1234-5678'}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              010-1234-5678
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {activeDocuments.map((doc) => {
              const isUploaded = documents[doc.id] !== null;
              return (
                <div key={doc.id} className="flex items-center gap-2 text-xs">
                  {isUploaded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  )}
                  <span className={isUploaded ? "text-gray-900" : "text-gray-400"}>
                    {doc.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 메인 컨텐츠 영역 - 왼쪽 넓게, 오른쪽 좁게 */}
        <div className="flex gap-6">
          {/* 왼쪽: 서류 업로드 카드 (넓음) */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              {activeDocuments.map((doc) => {
                const isDefault = DEFAULT_DOCUMENTS.some(d => d.id === doc.id);
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
              <div className="sticky top-8 bg-white border-2 border-dashed border-blue-300 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    E-7 추가 서류
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  클릭하여 왼쪽에 추가
                </p>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {availableToAdd.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => addDocument(doc.id)}
                      className="w-full flex items-start gap-2 p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs leading-tight">
                          {doc.title}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
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