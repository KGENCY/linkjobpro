"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

const FOREIGNER_DOCUMENTS = [
  {
    id: "passport",
    title: "여권",
    description: "여권 사진면 포함, 모든 페이지 스캔",
    required: true,
    category: "basic"
  },
  {
    id: "arc",
    title: "외국인등록증",
    description: "앞뒤면 모두 스캔 (해당자에 한함)",
    required: false,
    category: "basic",
    conditional: true,
  },
  {
    id: "photo",
    title: "표준규격 사진",
    description: "3.5cm x 4.5cm, 최근 6개월 이내 촬영",
    required: true,
    category: "basic"
  },
  {
    id: "application_form",
    title: "통합신청서",
    description: "별지 제34호 서식",
    required: true,
    category: "basic"
  },
  {
    id: "tuberculosis",
    title: "결핵진단서",
    description: "보건소 또는 법무부지정병원, 3개월 이내 발급 (해당자)",
    required: false,
    category: "medical",
    conditional: true,
  },
  {
    id: "residence_proof",
    title: "체류지 입증서류",
    description: "부동산등기부등본 또는 전월세계약서",
    required: false,
    category: "residence"
  },
  {
    id: "job_application",
    title: "외국인 직업 신고서",
    description: "지정 서식 작성",
    required: false,
    category: "employment"
  },
  {
    id: "qualifications",
    title: "외국인 자격요건 입증서류",
    description: "학위증, 경력증명서, 자격증 등",
    required: true,
    category: "qualification"
  },
];

function ForeignerUploadContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  // 선택된 서류 ID 목록 관리
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    new Set(FOREIGNER_DOCUMENTS.filter(d => d.required).map(d => d.id))
  );

  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    passport: null,
    arc: null,
    photo: null,
    application_form: null,
    tuberculosis: null,
    residence_proof: null,
    job_application: null,
    qualifications: null,
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

  // 선택된 서류 목록 필터링
  const visibleDocuments = FOREIGNER_DOCUMENTS.filter(doc => selectedDocs.has(doc.id));

  const uploadedCount = visibleDocuments.filter(doc => documents[doc.id]).length;
  const totalCount = visibleDocuments.length;
  const requiredCount = visibleDocuments.filter((d) => d.required).length;
  const uploadedRequiredCount = visibleDocuments.filter(
    (d) => d.required && documents[d.id]
  ).length;

  const isComplete = uploadedRequiredCount >= requiredCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                외국인 서류 제출
              </h1>
              <p className="text-sm text-gray-600">E-7 비자 신청용</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            안내사항
          </h2>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li>• 아래 서류를 준비하여 업로드해 주세요</li>
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
            {FOREIGNER_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDocSelection(doc.id, doc.required)}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left
                  ${selectedDocs.has(doc.id)
                    ? 'border-blue-500 bg-blue-50'
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
                  <div className="flex items-center gap-2">
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
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
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

export default function ForeignerUploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ForeignerUploadContent />
    </Suspense>
  );
}