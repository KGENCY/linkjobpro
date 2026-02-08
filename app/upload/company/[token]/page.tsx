"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { SubmitButton } from "@/components/upload/SubmitButton";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCaseByToken } from "@/hooks/useCaseStorage";
import { CompanyDocType } from "@/lib/types";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface CompanyDocument {
  id: CompanyDocType;
  title: string;
  description: string;
  required: boolean;
  conditional?: boolean;
}

export default function CompanyUploadPage() {
  const params = useParams();
  const token = params.token as string;

  const { caseData, loading, error, uploadDocument, deleteDocument, submit } =
    useCaseByToken(token, "company");

  const [isCorporation, setIsCorporation] = useState(true);
  const [localDocs, setLocalDocs] = useState<Record<string, UploadedFile | null>>({});

  const COMPANY_DOCUMENTS: CompanyDocument[] = [
    {
      id: "bizRegistration",
      title: "사업자등록증",
      description: "사업자등록증 사본 (최신본)",
      required: true,
    },
    {
      id: "employmentContract",
      title: "고용계약서",
      description: "외국인과 체결한 고용계약서 (서명본)",
      required: true,
    },
    {
      id: "taxPayment",
      title: "4대보험 가입자 명부",
      description: "국민연금공단 발급 (최근 1개월 이내)",
      required: true,
    },
    {
      id: "companyIntro",
      title: "회사소개서",
      description: "회사 소개 자료 (선택)",
      required: false,
    },
    {
      id: "orgChart",
      title: "조직도",
      description: "회사 조직도 (법인인 경우)",
      required: isCorporation,
      conditional: true,
    },
    {
      id: "financialStatement",
      title: "재무제표",
      description: "최근 재무제표 또는 부가세 과표증명",
      required: true,
    },
  ];

  // 케이스 데이터에서 문서 정보 로드
  useEffect(() => {
    if (caseData?.companyDocs) {
      const docs: Record<string, UploadedFile | null> = {};
      for (const doc of COMPANY_DOCUMENTS) {
        const savedDoc = caseData.companyDocs[doc.id];
        if (savedDoc) {
          docs[doc.id] = {
            name: savedDoc.name,
            uploadedAt: new Date(savedDoc.uploadedAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        } else {
          docs[doc.id] = null;
        }
      }
      setLocalDocs(docs);
    }
  }, [caseData]);

  const handleFileUpload = async (docId: CompanyDocType, file: File) => {
    // 즉시 UI 업데이트
    setLocalDocs((prev) => ({
      ...prev,
      [docId]: {
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    }));

    // LocalStorage에 저장
    await uploadDocument(docId, file);
  };

  const handleFileRemove = (docId: CompanyDocType) => {
    setLocalDocs((prev) => ({
      ...prev,
      [docId]: null,
    }));

    deleteDocument(docId);
  };

  const handleSubmit = () => {
    submit();
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 (잘못된 토큰)
  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            유효하지 않은 링크
          </h1>
          <p className="text-gray-600 mb-4">
            이 링크는 만료되었거나 잘못된 링크입니다.
            <br />
            행정사에게 새로운 링크를 요청해주세요.
          </p>
        </div>
      </div>
    );
  }

  const isSubmitted = caseData.companySubmission?.isSubmitted;
  const visibleDocuments = COMPANY_DOCUMENTS.filter(
    (doc) => !doc.conditional || isCorporation
  );
  const uploadedCount = visibleDocuments.filter((doc) => localDocs[doc.id]).length;
  const totalCount = visibleDocuments.length;
  const requiredCount = visibleDocuments.filter((d) => d.required).length;
  const uploadedRequiredCount = visibleDocuments.filter(
    (d) => d.required && localDocs[d.id]
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
              <p className="text-sm text-gray-600">
                {caseData.visaType} - {caseData.companyName}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 이미 제출된 경우 */}
        {isSubmitted && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              서류 전송이 완료되었습니다!
            </h3>
            <p className="text-green-800">
              {caseData.companySubmission?.submittedAt &&
                new Date(caseData.companySubmission.submittedAt).toLocaleString(
                  "ko-KR"
                )}
              에 제출됨
              <br />
              행정사가 서류를 확인하고 연락드릴 예정입니다.
            </p>
          </div>
        )}

        {/* 안내 메시지 */}
        {!isSubmitted && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">
              안내사항
            </h2>
            <ul className="text-sm text-purple-800 space-y-1.5">
              <li>• 아래 사업체 관련 서류를 준비하여 업로드해 주세요</li>
              <li>• 필수 서류는 반드시 제출해야 합니다</li>
              <li>• 파일은 PDF, JPG, PNG 형식으로 올려주세요</li>
              <li>• 모든 서류 업로드 후 &quot;전송하기&quot; 버튼을 눌러주세요</li>
            </ul>
          </div>
        )}

        {/* 사업체 형태 선택 */}
        {!isSubmitted && (
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
        )}

        {/* 진행률 표시 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">제출 진행률</div>
              <div className="text-2xl font-bold text-gray-900">
                {uploadedCount} / {totalCount}
              </div>
            </div>
            {isComplete && !isSubmitted && (
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
              file={localDocs[doc.id]}
              onFileUpload={(file) => handleFileUpload(doc.id, file)}
              onFileRemove={() => handleFileRemove(doc.id)}
              disabled={isSubmitted}
            />
          ))}
        </div>

        {/* 전송하기 버튼 */}
        {!isSubmitted && (
          <div className="mt-8">
            <SubmitButton
              isComplete={isComplete}
              onSubmit={handleSubmit}
              type="company"
            />
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
