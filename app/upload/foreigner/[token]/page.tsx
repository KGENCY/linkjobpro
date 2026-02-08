"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { SubmitButton } from "@/components/upload/SubmitButton";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useCaseByToken } from "@/hooks/useCaseStorage";
import { ForeignerDocType } from "@/lib/types";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

const FOREIGNER_DOCUMENTS: {
  id: ForeignerDocType;
  title: string;
  description: string;
  required: boolean;
}[] = [
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
    id: "addressProof",
    title: "주소 증빙",
    description: "임대차계약서 또는 기숙사 확인서",
    required: false,
  },
];

export default function ForeignerUploadPage() {
  const params = useParams();
  const token = params.token as string;

  const { caseData, loading, error, uploadDocument, deleteDocument, submit } =
    useCaseByToken(token, "foreigner");

  const [localDocs, setLocalDocs] = useState<Record<string, UploadedFile | null>>({});

  // 케이스 데이터에서 문서 정보 로드
  useEffect(() => {
    if (caseData?.foreignerDocs) {
      const docs: Record<string, UploadedFile | null> = {};
      for (const doc of FOREIGNER_DOCUMENTS) {
        const savedDoc = caseData.foreignerDocs[doc.id];
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

  const handleFileUpload = async (docId: ForeignerDocType, file: File) => {
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

  const handleFileRemove = (docId: ForeignerDocType) => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
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

  const isSubmitted = caseData.foreignerSubmission?.isSubmitted;
  const uploadedCount = Object.values(localDocs).filter(Boolean).length;
  const totalCount = FOREIGNER_DOCUMENTS.length;
  const requiredCount = FOREIGNER_DOCUMENTS.filter((d) => d.required).length;
  const uploadedRequiredCount = FOREIGNER_DOCUMENTS.filter(
    (d) => d.required && localDocs[d.id]
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
              <p className="text-sm text-gray-600">
                {caseData.visaType} - {caseData.foreignerName}님
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
              {caseData.foreignerSubmission?.submittedAt &&
                new Date(caseData.foreignerSubmission.submittedAt).toLocaleString(
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
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              안내사항
            </h2>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• 아래 서류를 준비하여 업로드해 주세요</li>
              <li>• 필수 서류는 반드시 제출해야 합니다</li>
              <li>• 파일은 PDF, JPG, PNG 형식으로 올려주세요</li>
              <li>• 모든 서류 업로드 후 &quot;전송하기&quot; 버튼을 눌러주세요</li>
            </ul>
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
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* 서류 업로드 카드 */}
        <div className="space-y-4">
          {FOREIGNER_DOCUMENTS.map((doc) => (
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
              type="foreigner"
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
