"use client";

import { DocumentDropCard } from "@/components/wizard/DocumentDropCard";
import { ShareLinkBanner } from "@/components/wizard/ShareLinkBanner";

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

export function Step1ForeignerDocuments({
  caseId,
  documents,
  onFileUpload,
  onFileRemove,
}: Step1Props) {
  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = FOREIGNER_DOCUMENTS.length;

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
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
            진행률: {uploadedCount}/{totalCount} 완료
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {FOREIGNER_DOCUMENTS.map((doc) => (
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

        {uploadedCount >= 4 && uploadedCount < totalCount && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              필수 서류가 준비되었습니다. 다음 단계로 이동하실 수 있습니다.
            </p>
          </div>
        )}

        {uploadedCount < 4 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              필수 서류 {4 - uploadedCount}개를 더 올려주세요.
            </p>
          </div>
        )}

        {/* 링크 공유 배너 */}
        <div className="mt-6">
          <ShareLinkBanner
            type="foreigner"
            caseId={caseId}
            uploadedCount={uploadedCount}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
}