"use client";

import { useState } from "react";
import {
  User, Building2, Check, X, Eye, AlertTriangle,
  CheckCircle2, Clock, FileText, MessageSquare, FileX
} from "lucide-react";
import { cn } from "@/lib/utils";

// 서류 상태 타입 (미제출 상태 추가)
type ReviewStatus = "not_submitted" | "submitted" | "confirmed" | "revision_requested";

interface ReviewDocument {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  status: ReviewStatus;
  submittedAt?: string;
  fileName?: string;
  revisionNote?: string;
}

interface DocumentReviewProps {
  foreignerDocs: Record<string, { name: string; uploadedAt: string } | null>;
  companyDocs: Record<string, { name: string; uploadedAt: string } | null>;
  onStatusChange: (docId: string, status: ReviewStatus, target: "foreigner" | "company", note?: string) => void;
}

// 외국인 서류 목록
const FOREIGNER_DOCS = [
  { id: "passport", title: "여권 사본", description: "여권 사진면 포함", isRequired: true },
  { id: "arc", title: "외국인등록증 사본", description: "앞뒤면 모두", isRequired: true },
  { id: "photo", title: "증명사진", description: "3.5x4.5cm, 6개월 이내", isRequired: true },
  { id: "diploma", title: "졸업증명서", description: "최종학력 (영문/한글)", isRequired: true },
  { id: "transcript", title: "성적증명서", description: "최종학력 성적증명서", isRequired: false },
  { id: "address", title: "주소 증빙", description: "임대차계약서 또는 기숙사 확인서", isRequired: false },
];

// 사업체 서류 목록
const COMPANY_DOCS = [
  { id: "business_license", title: "사업자등록증", description: "최신본 사본", isRequired: true },
  { id: "insurance_list", title: "4대보험 가입자 명부", description: "1개월 이내 발급", isRequired: true },
  { id: "sales_proof", title: "매출 증빙", description: "부가세 과세표준증명 등", isRequired: true },
  { id: "office_photos", title: "사업장 사진", description: "근무 공간 전경", isRequired: true },
  { id: "employment_contract", title: "고용계약서", description: "서명 완료본", isRequired: true },
  { id: "corporate_register", title: "법인등기부등본", description: "법인인 경우, 3개월 이내", isRequired: false },
];

// 상태 뱃지 컴포넌트
function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const config = {
    not_submitted: { label: "미제출", color: "bg-gray-100 text-gray-500", icon: FileX },
    submitted: { label: "제출 완료", color: "bg-blue-100 text-blue-700", icon: Clock },
    confirmed: { label: "확인 완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    revision_requested: { label: "보완 요청", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  };
  const { label, color, icon: Icon } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", color)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export function DocumentReview({
  foreignerDocs,
  companyDocs,
  onStatusChange,
}: DocumentReviewProps) {
  // 각 서류의 검토 상태
  const [reviewStatus, setReviewStatus] = useState<Record<string, ReviewStatus>>({});

  // 보완 요청 모달 상태
  const [revisionModal, setRevisionModal] = useState<{
    isOpen: boolean;
    docId: string;
    docTitle: string;
    target: "foreigner" | "company";
  } | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  // 서류 상태 가져오기
  const getStatus = (docId: string): ReviewStatus => {
    return reviewStatus[docId] || "submitted";
  };

  // 확인 완료 처리
  const handleConfirm = (docId: string, target: "foreigner" | "company") => {
    setReviewStatus(prev => ({ ...prev, [docId]: "confirmed" }));
    onStatusChange(docId, "confirmed", target);
  };

  // 보완 요청 모달 열기
  const openRevisionModal = (docId: string, docTitle: string, target: "foreigner" | "company") => {
    setRevisionModal({ isOpen: true, docId, docTitle, target });
    setRevisionNote("");
  };

  // 보완 요청 처리
  const handleRevisionRequest = () => {
    if (!revisionModal) return;

    setReviewStatus(prev => ({ ...prev, [revisionModal.docId]: "revision_requested" }));
    onStatusChange(revisionModal.docId, "revision_requested", revisionModal.target, revisionNote);
    setRevisionModal(null);
    setRevisionNote("");
  };

  // 서류 제출 여부 확인
  const isDocSubmitted = (docId: string, target: "foreigner" | "company") => {
    return target === "foreigner" ? !!foreignerDocs[docId] : !!companyDocs[docId];
  };

  // 실제 상태 가져오기 (제출 여부 반영)
  const getActualStatus = (docId: string, target: "foreigner" | "company"): ReviewStatus => {
    if (!isDocSubmitted(docId, target)) {
      return "not_submitted";
    }
    return reviewStatus[docId] || "submitted";
  };

  // 통계 - 제출된 서류 수
  const foreignerSubmittedCount = FOREIGNER_DOCS.filter(doc => foreignerDocs[doc.id]).length;
  const companySubmittedCount = COMPANY_DOCS.filter(doc => companyDocs[doc.id]).length;

  // 통계 - 확인 완료 서류 수
  const foreignerConfirmed = FOREIGNER_DOCS.filter(doc =>
    foreignerDocs[doc.id] && getStatus(doc.id) === "confirmed"
  ).length;
  const companyConfirmed = COMPANY_DOCS.filter(doc =>
    companyDocs[doc.id] && getStatus(doc.id) === "confirmed"
  ).length;

  const totalDocs = FOREIGNER_DOCS.length + COMPANY_DOCS.length;
  const totalSubmitted = foreignerSubmittedCount + companySubmittedCount;
  const totalConfirmed = foreignerConfirmed + companyConfirmed;

  // 필수 서류 확인 완료 여부
  const requiredForeignerDocs = FOREIGNER_DOCS.filter(doc => doc.isRequired);
  const requiredCompanyDocs = COMPANY_DOCS.filter(doc => doc.isRequired);
  const allRequiredSubmitted =
    requiredForeignerDocs.every(doc => foreignerDocs[doc.id]) &&
    requiredCompanyDocs.every(doc => companyDocs[doc.id]);
  const allRequiredConfirmed =
    allRequiredSubmitted &&
    requiredForeignerDocs.every(doc => getStatus(doc.id) === "confirmed") &&
    requiredCompanyDocs.every(doc => getStatus(doc.id) === "confirmed");

  // 서류 카드 컴포넌트
  const DocumentCard = ({
    doc,
    fileInfo,
    target,
  }: {
    doc: typeof FOREIGNER_DOCS[0];
    fileInfo: { name: string; uploadedAt: string } | null;
    target: "foreigner" | "company";
  }) => {
    const status = getActualStatus(doc.id, target);
    const accentColor = target === "foreigner" ? "blue" : "purple";
    const isSubmitted = !!fileInfo;

    return (
      <div className={cn(
        "p-4 rounded-xl border-2 transition-all",
        status === "not_submitted" ? "bg-gray-50 border-gray-200 border-dashed" :
        status === "confirmed" ? "bg-green-50 border-green-200" :
        status === "revision_requested" ? "bg-amber-50 border-amber-200" :
        "bg-white border-gray-200"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "font-semibold",
                status === "not_submitted" ? "text-gray-400" : "text-gray-900"
              )}>
                {doc.title}
              </h4>
              {doc.isRequired && (
                <span className={cn(
                  "px-1.5 py-0.5 text-[10px] font-bold rounded",
                  status === "not_submitted"
                    ? "bg-red-50 text-red-400"
                    : "bg-red-100 text-red-600"
                )}>
                  필수
                </span>
              )}
            </div>
            <p className={cn(
              "text-xs",
              status === "not_submitted" ? "text-gray-400" : "text-gray-500"
            )}>{doc.description}</p>
          </div>
          <ReviewStatusBadge status={status} />
        </div>

        {/* 제출 파일 정보 or 미제출 안내 */}
        {isSubmitted ? (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 flex-1 truncate">{fileInfo.name}</span>
            <span className="text-xs text-gray-400">{fileInfo.uploadedAt}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-100/50 rounded-lg mb-3 border border-dashed border-gray-200">
            <FileX className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-400 flex-1">아직 제출되지 않은 서류입니다</span>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <>
              <button
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  `bg-${accentColor}-50 text-${accentColor}-600 hover:bg-${accentColor}-100`
                )}
                style={{
                  backgroundColor: target === "foreigner" ? "#eff6ff" : "#faf5ff",
                  color: target === "foreigner" ? "#2563eb" : "#9333ea"
                }}
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>

              {status === "submitted" && (
                <>
                  <button
                    onClick={() => handleConfirm(doc.id, target)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    확인 완료
                  </button>
                  <button
                    onClick={() => openRevisionModal(doc.id, doc.title, target)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    보완 요청
                  </button>
                </>
              )}

              {status === "confirmed" && (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  검토 완료됨
                </div>
              )}

              {status === "revision_requested" && (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-amber-600 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  보완 대기 중
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              제출 대기 중
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            제출 서류 확인
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            외국인과 사업체가 제출한 서류를 검토하고 확인 완료 또는 보완 요청 처리를 해주세요.
          </p>
        </div>

        {/* 검토 현황 */}
        <div className="mb-8 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">검토 진행 현황</h3>
              <p className="text-xs text-gray-500 mt-1">
                {allRequiredConfirmed
                  ? "모든 필수 서류 확인이 완료되었습니다. 다음 단계로 진행할 수 있습니다."
                  : !allRequiredSubmitted
                  ? "필수 서류가 아직 모두 제출되지 않았습니다. 제출 완료 후 확인을 진행해주세요."
                  : "필수 서류를 모두 확인 완료해야 다음 단계로 진행할 수 있습니다."}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">{totalConfirmed}</span>
                <span className="text-lg text-gray-400">/{totalSubmitted}</span>
                <span className="text-sm text-gray-400">확인</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                전체 {totalDocs}건 중 {totalSubmitted}건 제출됨
              </p>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${totalDocs > 0 ? (totalConfirmed / totalDocs) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-blue-600 font-medium">
              외국인 {foreignerSubmittedCount}/{FOREIGNER_DOCS.length} 제출 · {foreignerConfirmed}건 확인
            </span>
            <span className="text-purple-600 font-medium">
              사업체 {companySubmittedCount}/{COMPANY_DOCS.length} 제출 · {companyConfirmed}건 확인
            </span>
          </div>
        </div>

        {/* 서류 검토 영역 - 2컬럼 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 외국인 서류 */}
          <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <h3 className="font-bold">외국인 제출 서류</h3>
                <span className="ml-auto text-sm opacity-90">
                  {foreignerSubmittedCount}/{FOREIGNER_DOCS.length} 제출
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {FOREIGNER_DOCS.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  fileInfo={foreignerDocs[doc.id] || null}
                  target="foreigner"
                />
              ))}
            </div>
          </div>

          {/* 사업체 서류 */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold">사업체 제출 서류</h3>
                <span className="ml-auto text-sm opacity-90">
                  {companySubmittedCount}/{COMPANY_DOCS.length} 제출
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {COMPANY_DOCS.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  fileInfo={companyDocs[doc.id] || null}
                  target="company"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        {!allRequiredSubmitted && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-700">필수 서류 제출 대기 중</h4>
                <p className="text-sm text-gray-600 mt-1">
                  아직 모든 필수 서류가 제출되지 않았습니다. 외국인과 사업체가 서류를 모두 제출한 후 검토를 진행해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {allRequiredSubmitted && !allRequiredConfirmed && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">필수 서류 확인 필요</h4>
                <p className="text-sm text-amber-700 mt-1">
                  모든 필수 서류의 확인을 완료해야 '서류 생성' 단계로 진행할 수 있습니다.
                  각 서류를 검토한 후 '확인 완료' 버튼을 눌러주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {allRequiredConfirmed && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">검토 완료</h4>
                <p className="text-sm text-green-700 mt-1">
                  모든 필수 서류 확인이 완료되었습니다. 하단의 '다음' 버튼을 눌러 서류 생성 단계로 진행하세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 보완 요청 모달 */}
      {revisionModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">보완 요청</h3>
              <button
                onClick={() => setRevisionModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-gray-900">{revisionModal.docTitle}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                보완 요청 사유 (선택)
              </label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="예: 여권 사진면이 불선명합니다. 다시 스캔하여 제출해주세요."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              />
            </div>

            <p className="text-xs text-gray-500 mb-4">
              보완 요청 시 해당 서류는 외국인/사업체 제출 화면에 다시 표시됩니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRevisionModal(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRevisionRequest}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                보완 요청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
