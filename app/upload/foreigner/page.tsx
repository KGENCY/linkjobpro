"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { FileText, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

const FOREIGNER_DOCUMENTS = [
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

export default function ForeignerUploadPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    passport: null,
    arc: null,
    photo: null,
    diploma: null,
    transcript: null,
    address: null,
  });

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

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = FOREIGNER_DOCUMENTS.length;
  const requiredCount = FOREIGNER_DOCUMENTS.filter((d) => d.required).length;
  const uploadedRequiredCount = FOREIGNER_DOCUMENTS.filter(
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
          {FOREIGNER_DOCUMENTS.map((doc) => (
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