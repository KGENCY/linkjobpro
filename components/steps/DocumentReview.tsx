"use client";

import { useState } from "react";
import {
  User, Building2, Check, X, Eye, AlertTriangle,
  CheckCircle2, Clock, FileText, Send, FileX, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// 서류 상태 정의
// ─────────────────────────────────────────────────────────────
type ReviewStatus =
  | "not_submitted"      // 미제출
  | "submitted"          // 제출 완료
  | "confirmed"          // 확인 완료
  | "revision_requested" // 보완 요청
  | "resubmitted";       // 재제출 완료

// 보완 요청 정보
interface RevisionInfo {
  note: string;
  requestedAt: string;
  sentAt?: string;
}

interface DocumentReviewProps {
  foreignerDocs: Record<string, { name: string; uploadedAt: string } | null>;
  companyDocs: Record<string, { name: string; uploadedAt: string } | null>;
  onStatusChange: (docId: string, status: ReviewStatus, target: "foreigner" | "company", note?: string) => void;
  scenarioMode?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 서류 목록 (제출 서류 요건 단계에서 정의된 항목)
// ─────────────────────────────────────────────────────────────
const FOREIGNER_DOCS = [
  { id: "passport", title: "여권 사본", description: "여권 사진면 포함", isRequired: true },
  { id: "arc", title: "외국인등록증 사본", description: "앞뒤면 모두", isRequired: true },
  { id: "photo", title: "증명사진", description: "3.5x4.5cm, 6개월 이내", isRequired: true },
  { id: "diploma", title: "졸업증명서", description: "최종학력 (영문/한글)", isRequired: true },
  { id: "transcript", title: "성적증명서", description: "최종학력 성적증명서", isRequired: false },
  { id: "address", title: "주소 증빙", description: "임대차계약서 또는 기숙사 확인서", isRequired: false },
];

const COMPANY_DOCS = [
  { id: "business_license", title: "사업자등록증", description: "최신본 사본", isRequired: true },
  { id: "insurance_list", title: "4대보험 가입자 명부", description: "1개월 이내 발급", isRequired: true },
  { id: "sales_proof", title: "매출 증빙", description: "부가세 과세표준증명 등", isRequired: true },
  { id: "office_photos", title: "사업장 사진", description: "근무 공간 전경", isRequired: true },
  { id: "employment_contract", title: "고용계약서", description: "서명 완료본", isRequired: true },
  { id: "corporate_register", title: "법인등기부등본", description: "법인인 경우, 3개월 이내", isRequired: false },
];

// ─────────────────────────────────────────────────────────────
// 상태 배지 컴포넌트
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReviewStatus }) {
  const config = {
    not_submitted: { label: "미제출", color: "bg-gray-100 text-gray-500", icon: FileX },
    submitted: { label: "제출 완료", color: "bg-blue-100 text-blue-700", icon: FileText },
    confirmed: { label: "확인 완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    revision_requested: { label: "보완 요청", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
    resubmitted: { label: "재제출 완료", color: "bg-indigo-100 text-indigo-700", icon: RotateCcw },
  };
  const { label, color, icon: Icon } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", color)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────
export function DocumentReview({
  foreignerDocs,
  companyDocs,
  onStatusChange,
  scenarioMode = false,
}: DocumentReviewProps) {

  // ─────────────────────────────────────────────────────────────
  // 초기 상태: 모든 서류는 '미판단' 상태로 시작
  // - 행정사가 직접 버튼을 눌러 판단을 진행해야 함
  // - 시스템이 임의로 '확인 완료' 또는 '보완 요청'을 미리 설정하지 않음
  // ─────────────────────────────────────────────────────────────
  const getInitialStatus = (): Record<string, ReviewStatus> => {
    // 화면 진입 시 모든 제출된 서류는 "submitted" (미판단) 상태
    return {};
  };

  const getInitialRevisionInfo = (): Record<string, RevisionInfo> => {
    // 화면 진입 시 보완 사유 없음
    return {};
  };

  // ─────────────────────────────────────────────────────────────
  // 상태 관리
  // ─────────────────────────────────────────────────────────────
  const [reviewStatus, setReviewStatus] = useState<Record<string, ReviewStatus>>(getInitialStatus);
  const [revisionInfo, setRevisionInfo] = useState<Record<string, RevisionInfo>>(getInitialRevisionInfo);

  // 현재 보완 사유 입력 중인 카드 (인라인 입력)
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  // ─────────────────────────────────────────────────────────────
  // 헬퍼 함수
  // ─────────────────────────────────────────────────────────────
  const getStatus = (docId: string): ReviewStatus => reviewStatus[docId] || "submitted";

  const isDocSubmitted = (docId: string, target: "foreigner" | "company") => {
    return target === "foreigner" ? !!foreignerDocs[docId] : !!companyDocs[docId];
  };

  const getActualStatus = (docId: string, target: "foreigner" | "company"): ReviewStatus => {
    if (!isDocSubmitted(docId, target)) return "not_submitted";
    return reviewStatus[docId] || "submitted";
  };

  const formatDateTime = () => {
    return new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\. /g, "-").replace(".", "");
  };

  // ─────────────────────────────────────────────────────────────
  // 액션 핸들러
  // ─────────────────────────────────────────────────────────────

  // 미리보기
  const handlePreview = (fileName: string) => {
    alert(`파일 미리보기: ${fileName}\n\n(실제 구현 시 PDF/이미지 뷰어 표시)`);
  };

  // 확인 완료
  const handleConfirm = (docId: string, target: "foreigner" | "company") => {
    setReviewStatus(prev => ({ ...prev, [docId]: "confirmed" }));
    onStatusChange(docId, "confirmed", target);
  };

  // 보완하기 클릭 → 인라인 입력 UI 열기
  const handleStartRevision = (docId: string) => {
    setEditingDocId(docId);
    setRevisionNote("");
  };

  // 보완 사유 입력 취소
  const handleCancelRevision = () => {
    setEditingDocId(null);
    setRevisionNote("");
  };

  // 보완 사유 저장
  const handleSaveRevision = (docId: string, target: "foreigner" | "company") => {
    if (!revisionNote.trim()) return;

    const now = formatDateTime();

    setReviewStatus(prev => ({ ...prev, [docId]: "revision_requested" }));
    setRevisionInfo(prev => ({
      ...prev,
      [docId]: {
        note: revisionNote.trim(),
        requestedAt: now,
      },
    }));
    onStatusChange(docId, "revision_requested", target, revisionNote.trim());

    setEditingDocId(null);
    setRevisionNote("");
  };

  // 재제출 요청 전송
  const handleSendResubmitRequest = (docId: string, docTitle: string, target: "foreigner" | "company") => {
    const targetLabel = target === "foreigner" ? "외국인" : "사업체";
    const info = revisionInfo[docId];
    const now = formatDateTime();

    setRevisionInfo(prev => ({
      ...prev,
      [docId]: { ...prev[docId], sentAt: now },
    }));

    alert(
      `${targetLabel}에게 재제출 요청이 전송되었습니다.\n\n` +
      `────────────────────────\n` +
      `보완 요청된 서류가 있습니다.\n\n` +
      `서류: ${docTitle}\n` +
      `보완 사유:\n${info?.note}\n\n` +
      `아래 링크에서 해당 서류만 다시 제출해 주세요.\n` +
      `────────────────────────\n\n` +
      `※ 기존 제출 링크를 재사용하며, 해당 서류 1개만 업로드 가능합니다.`
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 통계 계산
  // ─────────────────────────────────────────────────────────────
  const foreignerSubmittedCount = FOREIGNER_DOCS.filter(doc => foreignerDocs[doc.id]).length;
  const companySubmittedCount = COMPANY_DOCS.filter(doc => companyDocs[doc.id]).length;
  const foreignerConfirmed = FOREIGNER_DOCS.filter(doc => foreignerDocs[doc.id] && getStatus(doc.id) === "confirmed").length;
  const companyConfirmed = COMPANY_DOCS.filter(doc => companyDocs[doc.id] && getStatus(doc.id) === "confirmed").length;
  const foreignerRevisionCount = FOREIGNER_DOCS.filter(doc => getStatus(doc.id) === "revision_requested").length;
  const companyRevisionCount = COMPANY_DOCS.filter(doc => getStatus(doc.id) === "revision_requested").length;

  const totalDocs = FOREIGNER_DOCS.length + COMPANY_DOCS.length;
  const totalSubmitted = foreignerSubmittedCount + companySubmittedCount;
  const totalConfirmed = foreignerConfirmed + companyConfirmed;
  const totalRevisionCount = foreignerRevisionCount + companyRevisionCount;

  const requiredForeignerDocs = FOREIGNER_DOCS.filter(doc => doc.isRequired);
  const requiredCompanyDocs = COMPANY_DOCS.filter(doc => doc.isRequired);
  const allRequiredSubmitted =
    requiredForeignerDocs.every(doc => foreignerDocs[doc.id]) &&
    requiredCompanyDocs.every(doc => companyDocs[doc.id]);
  const allRequiredConfirmed =
    allRequiredSubmitted &&
    requiredForeignerDocs.every(doc => getStatus(doc.id) === "confirmed") &&
    requiredCompanyDocs.every(doc => getStatus(doc.id) === "confirmed");

  const hasRevisionRequests = totalRevisionCount > 0;

  // ─────────────────────────────────────────────────────────────
  // 서류 카드 컴포넌트
  // ─────────────────────────────────────────────────────────────
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
    const isSubmitted = !!fileInfo;
    const docRevisionInfo = revisionInfo[doc.id];
    const isEditing = editingDocId === doc.id;

    // 카드 배경색 결정
    const getCardStyle = () => {
      switch (status) {
        case "not_submitted":
          return "bg-gray-50 border-gray-200 border-dashed";
        case "confirmed":
          return "bg-green-50 border-green-200";
        case "revision_requested":
          return "bg-amber-50 border-amber-300";
        case "resubmitted":
          return "bg-indigo-50 border-indigo-200";
        default:
          return "bg-white border-gray-200";
      }
    };

    return (
      <div className={cn("p-4 rounded-xl border-2 transition-all", getCardStyle())}>

        {/* ────────────────────────────────────────────────────────
            카드 상단: 서류명 + 필수 배지 + 상태 배지
            ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn("font-semibold", status === "not_submitted" ? "text-gray-400" : "text-gray-900")}>
                {doc.title}
              </h4>
              {doc.isRequired && (
                <span className={cn(
                  "px-1.5 py-0.5 text-[10px] font-bold rounded",
                  status === "not_submitted" ? "bg-red-50 text-red-400" : "bg-red-100 text-red-600"
                )}>
                  필수
                </span>
              )}
            </div>
          </div>
          {/* 미판단(submitted) 상태에서는 상태 배지 표시하지 않음 */}
          {status !== "submitted" && <StatusBadge status={status} />}
        </div>

        {/* ────────────────────────────────────────────────────────
            카드 본문: 파일 정보
            ──────────────────────────────────────────────────────── */}
        {isSubmitted ? (
          <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg mb-3 border border-gray-100">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 flex-1 truncate">{fileInfo.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{fileInfo.uploadedAt}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 bg-gray-100/50 rounded-lg mb-3 border border-dashed border-gray-200">
            <FileX className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-400 flex-1">아직 제출되지 않은 서류입니다</span>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            보완 사유 입력 UI (인라인) - 보완하기 클릭 시 노출
            ──────────────────────────────────────────────────────── */}
        {isEditing && (
          <div className="mb-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              보완 사유
            </label>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="예: 여권 번호가 흐릿합니다. 선명한 사본으로 다시 제출해 주세요."
              rows={3}
              autoFocus
              className="w-full px-3 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm bg-white"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={handleCancelRevision}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleSaveRevision(doc.id, target)}
                disabled={!revisionNote.trim()}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  revisionNote.trim()
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                보완 사유 저장
              </button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            보완 사유 읽기 전용 박스 (보완 요청 상태)
            ──────────────────────────────────────────────────────── */}
        {status === "revision_requested" && docRevisionInfo && !isEditing && (
          <div className="mb-3 p-3 bg-amber-100/70 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">보완 사유</p>
                <p className="text-sm text-amber-700 leading-relaxed">{docRevisionInfo.note}</p>
                <p className="text-xs text-amber-600 mt-2">
                  요청일시: {docRevisionInfo.requestedAt}
                  {docRevisionInfo.sentAt && (
                    <span className="ml-3 text-green-600 font-medium">✓ 전송됨: {docRevisionInfo.sentAt}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            카드 하단: 액션 버튼 영역
            ──────────────────────────────────────────────────────── */}
        {!isEditing && (
          <div className="flex items-center gap-2">

            {/* 미제출 상태 */}
            {status === "not_submitted" && (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                제출 대기 중
              </div>
            )}

            {/* 제출 완료 상태: [미리보기] [확인 완료] [보완하기] */}
            {status === "submitted" && isSubmitted && (
              <>
                <button
                  onClick={() => handlePreview(fileInfo.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: target === "foreigner" ? "#eff6ff" : "#faf5ff",
                    color: target === "foreigner" ? "#2563eb" : "#9333ea"
                  }}
                >
                  <Eye className="w-4 h-4" />
                  미리보기
                </button>
                <button
                  onClick={() => handleConfirm(doc.id, target)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  확인 완료
                </button>
                <button
                  onClick={() => handleStartRevision(doc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  보완하기
                </button>
              </>
            )}

            {/* 확인 완료 상태: [미리보기] ✔ 확인 완료됨 */}
            {status === "confirmed" && isSubmitted && (
              <>
                <button
                  onClick={() => handlePreview(fileInfo.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: target === "foreigner" ? "#eff6ff" : "#faf5ff",
                    color: target === "foreigner" ? "#2563eb" : "#9333ea"
                  }}
                >
                  <Eye className="w-4 h-4" />
                  미리보기
                </button>
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  확인 완료됨
                </div>
              </>
            )}

            {/* 보완 요청 상태: [미리보기] [재제출 요청] */}
            {status === "revision_requested" && isSubmitted && (
              <>
                <button
                  onClick={() => handlePreview(fileInfo.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: target === "foreigner" ? "#eff6ff" : "#faf5ff",
                    color: target === "foreigner" ? "#2563eb" : "#9333ea"
                  }}
                >
                  <Eye className="w-4 h-4" />
                  미리보기
                </button>
                <button
                  onClick={() => handleSendResubmitRequest(doc.id, doc.title, target)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    docRevisionInfo?.sentAt
                      ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  )}
                >
                  <Send className="w-4 h-4" />
                  {docRevisionInfo?.sentAt ? "재전송" : "재제출 요청"}
                </button>
              </>
            )}

            {/* 재제출 완료 상태: [미리보기] [확인 완료] [보완하기] */}
            {status === "resubmitted" && isSubmitted && (
              <>
                <button
                  onClick={() => handlePreview(fileInfo.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: target === "foreigner" ? "#eff6ff" : "#faf5ff",
                    color: target === "foreigner" ? "#2563eb" : "#9333ea"
                  }}
                >
                  <Eye className="w-4 h-4" />
                  미리보기
                </button>
                <button
                  onClick={() => handleConfirm(doc.id, target)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  확인 완료
                </button>
                <button
                  onClick={() => handleStartRevision(doc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  보완하기
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            제출 서류 확인
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            제출된 서류를 미리보기로 확인한 후 '확인 완료' 또는 '보완하기'를 선택해주세요.
          </p>
        </div>

        {/* 검토 진행 현황 */}
        <div className={cn(
          "mb-8 bg-white border-2 rounded-2xl p-6 shadow-sm",
          hasRevisionRequests ? "border-amber-300" : "border-gray-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">검토 진행 현황</h3>
              <p className="text-xs text-gray-500 mt-1">
                {allRequiredConfirmed
                  ? "모든 필수 서류 확인이 완료되었습니다. 다음 단계로 진행할 수 있습니다."
                  : hasRevisionRequests
                  ? `보완 요청 ${totalRevisionCount}건이 있습니다. 재제출 후 확인을 진행해주세요.`
                  : !allRequiredSubmitted
                  ? "필수 서류가 아직 모두 제출되지 않았습니다."
                  : "서류를 확인하고 검토를 진행해주세요."}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">{totalConfirmed}</span>
                <span className="text-lg text-gray-400">/{totalSubmitted}</span>
                <span className="text-sm text-gray-400">확인</span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <p className="text-xs text-gray-400">
                  전체 {totalDocs}건 중 {totalSubmitted}건 제출
                </p>
                {hasRevisionRequests && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    보완 {totalRevisionCount}건
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${totalSubmitted > 0 ? (totalConfirmed / totalSubmitted) * 100 : 0}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                외국인 {foreignerConfirmed}/{foreignerSubmittedCount} 확인
              </span>
              {foreignerRevisionCount > 0 && (
                <span className="text-amber-600 text-xs">· 보완 {foreignerRevisionCount}건</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600 font-medium">
                사업체 {companyConfirmed}/{companySubmittedCount} 확인
              </span>
              {companyRevisionCount > 0 && (
                <span className="text-amber-600 text-xs">· 보완 {companyRevisionCount}건</span>
              )}
            </div>
          </div>
        </div>

        {/* 서류 검토 영역 - 2컬럼 레이아웃 */}
        <div className="grid grid-cols-2 gap-6">

          {/* 외국인 서류 */}
          <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <h3 className="font-bold">외국인 제출 서류</h3>
                <span className="ml-auto text-sm opacity-90">
                  {foreignerConfirmed}/{foreignerSubmittedCount} 확인
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
                  {companyConfirmed}/{companySubmittedCount} 확인
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

        {/* 하단 상태 안내 */}
        {!allRequiredSubmitted && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-700">필수 서류 제출 대기 중</h4>
                <p className="text-sm text-gray-600 mt-1">
                  아직 모든 필수 서류가 제출되지 않았습니다.
                  외국인과 사업체가 서류를 모두 제출한 후 검토를 진행해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {allRequiredSubmitted && !allRequiredConfirmed && hasRevisionRequests && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">보완 요청 {totalRevisionCount}건 처리 대기 중</h4>
                <p className="text-sm text-amber-700 mt-1">
                  문제가 있는 서류에 대해 보완 요청이 등록되었습니다.
                  '재제출 요청' 버튼을 눌러 외국인/사업체에게 알림을 전송하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {allRequiredSubmitted && !allRequiredConfirmed && !hasRevisionRequests && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">서류 검토를 진행해주세요</h4>
                <p className="text-sm text-blue-700 mt-1">
                  각 서류를 미리보기로 확인한 후 '확인 완료' 또는 '보완하기'를 선택해주세요.
                  모든 필수 서류가 '확인 완료' 상태가 되어야 다음 단계로 진행할 수 있습니다.
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
                <h4 className="font-semibold text-green-800">모든 필수 서류 검토 완료</h4>
                <p className="text-sm text-green-700 mt-1">
                  모든 필수 서류 확인이 완료되었습니다.
                  하단의 '다음' 버튼을 눌러 서류 생성 단계로 진행하세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
