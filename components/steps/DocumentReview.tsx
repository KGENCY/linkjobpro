"use client";

import { useState } from "react";
import {
  User, Building2, Check, Eye, AlertTriangle,
  CheckCircle2, Clock, FileText, Send, FileX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { FOREIGNER_DOCS, COMPANY_DOCS, type DocDefinition } from "@/lib/doc-constants";
import { StatusBadge } from "@/components/steps/shared/StatusBadge";
import type { DocStatus, DocTarget, UploadedFile } from "@/lib/types";

interface RevisionInfo {
  note: string;
  requestedAt: string;
  sentAt?: string;
}

interface DocumentReviewProps {
  foreignerDocs: Record<string, UploadedFile | null>;
  companyDocs: Record<string, UploadedFile | null>;
  onStatusChange: (docId: string, status: DocStatus, target: DocTarget, note?: string) => void;
}

interface DocumentCardProps {
  doc: DocDefinition;
  fileInfo: UploadedFile | null;
  target: DocTarget;
  status: DocStatus;
  revisionInfo?: RevisionInfo;
  isEditing: boolean;
  revisionNote: string;
  onRevisionNoteChange: (note: string) => void;
  onPreview: (fileName: string) => void;
  onConfirm: (docId: string, target: DocTarget) => void;
  onStartRevision: (docId: string) => void;
  onCancelRevision: () => void;
  onSaveRevision: (docId: string, target: DocTarget) => void;
  onSendResubmitRequest: (docId: string, docTitle: string, target: DocTarget) => void;
}

function DocumentCard({
  doc, fileInfo, target, status, revisionInfo: docRevisionInfo,
  isEditing, revisionNote,
  onRevisionNoteChange, onPreview, onConfirm,
  onStartRevision, onCancelRevision, onSaveRevision, onSendResubmitRequest,
}: DocumentCardProps) {
  const isSubmitted = !!fileInfo;

  const cardStyle = {
    not_submitted: "bg-gray-50 border-gray-200 border-dashed",
    confirmed: "bg-green-50 border-green-200",
    revision_requested: "bg-amber-50 border-amber-300",
    resubmitted: "bg-indigo-50 border-indigo-200",
    submitted: "bg-white border-gray-200",
  }[status];

  return (
    <div className={cn("p-4 rounded-xl border-2 transition-all", cardStyle)}>
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
        {status !== "submitted" && <StatusBadge status={status} />}
      </div>

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

      {isEditing && (
        <div className="mb-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <label className="block text-sm font-semibold text-amber-800 mb-2">보완 사유</label>
          <textarea
            value={revisionNote}
            onChange={(e) => onRevisionNoteChange(e.target.value)}
            placeholder="예: 여권 번호가 흐릿합니다. 선명한 사본으로 다시 제출해 주세요."
            rows={3}
            autoFocus
            className="w-full px-3 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm bg-white"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={onCancelRevision}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onSaveRevision(doc.id, target)}
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

      {!isEditing && (
        <div className="flex items-center gap-2">
          {status === "not_submitted" && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              제출 대기 중
            </div>
          )}

          {(status === "submitted" || status === "resubmitted") && isSubmitted && (
            <>
              <button
                onClick={() => onPreview(fileInfo.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>
              <button
                onClick={() => onConfirm(doc.id, target)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                확인 완료
              </button>
              <button
                onClick={() => onStartRevision(doc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                보완하기
              </button>
            </>
          )}

          {status === "confirmed" && isSubmitted && (
            <>
              <button
                onClick={() => onPreview(fileInfo.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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

          {status === "revision_requested" && isSubmitted && (
            <>
              <button
                onClick={() => onPreview(fileInfo.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>
              <button
                onClick={() => onSendResubmitRequest(doc.id, doc.title, target)}
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
        </div>
      )}
    </div>
  );
}

export function DocumentReview({
  foreignerDocs,
  companyDocs,
  onStatusChange,
}: DocumentReviewProps) {
  const [reviewStatus, setReviewStatus] = useState<Record<string, DocStatus>>({});
  const [revisionInfo, setRevisionInfo] = useState<Record<string, RevisionInfo>>({});
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const getStatus = (docId: string, target: DocTarget): DocStatus => {
    const docs = target === "foreigner" ? foreignerDocs : companyDocs;
    if (!docs[docId]) return "not_submitted";
    return reviewStatus[docId] || "submitted";
  };

  const handlePreview = (fileName: string) => {
    alert(`파일 미리보기: ${fileName}\n\n(실제 구현 시 PDF/이미지 뷰어 표시)`);
  };

  const handleConfirm = (docId: string, target: DocTarget) => {
    setReviewStatus(prev => ({ ...prev, [docId]: "confirmed" }));
    onStatusChange(docId, "confirmed", target);
  };

  const handleStartRevision = (docId: string) => {
    setEditingDocId(docId);
    setRevisionNote("");
  };

  const handleCancelRevision = () => {
    setEditingDocId(null);
    setRevisionNote("");
  };

  const handleSaveRevision = (docId: string, target: DocTarget) => {
    if (!revisionNote.trim()) return;

    const now = formatDateTime();
    setReviewStatus(prev => ({ ...prev, [docId]: "revision_requested" }));
    setRevisionInfo(prev => ({
      ...prev,
      [docId]: { note: revisionNote.trim(), requestedAt: now },
    }));
    onStatusChange(docId, "revision_requested", target, revisionNote.trim());
    setEditingDocId(null);
    setRevisionNote("");
  };

  const handleSendResubmitRequest = (docId: string, docTitle: string, target: DocTarget) => {
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

  const calcStats = (docs: DocDefinition[], target: DocTarget) => {
    const uploaded = target === "foreigner" ? foreignerDocs : companyDocs;
    const submittedCount = docs.filter(doc => uploaded[doc.id]).length;
    const confirmedCount = docs.filter(doc => getStatus(doc.id, target) === "confirmed").length;
    const revisionCount = docs.filter(doc => getStatus(doc.id, target) === "revision_requested").length;
    return { submittedCount, confirmedCount, revisionCount };
  };

  const foreignerStats = calcStats(FOREIGNER_DOCS, "foreigner");
  const companyStats = calcStats(COMPANY_DOCS, "company");

  const totalDocs = FOREIGNER_DOCS.length + COMPANY_DOCS.length;
  const totalSubmitted = foreignerStats.submittedCount + companyStats.submittedCount;
  const totalConfirmed = foreignerStats.confirmedCount + companyStats.confirmedCount;
  const totalRevisionCount = foreignerStats.revisionCount + companyStats.revisionCount;
  const hasRevisionRequests = totalRevisionCount > 0;

  const requiredForeignerDocs = FOREIGNER_DOCS.filter(doc => doc.isRequired);
  const requiredCompanyDocs = COMPANY_DOCS.filter(doc => doc.isRequired);
  const allRequiredSubmitted =
    requiredForeignerDocs.every(doc => foreignerDocs[doc.id]) &&
    requiredCompanyDocs.every(doc => companyDocs[doc.id]);
  const allRequiredConfirmed =
    allRequiredSubmitted &&
    requiredForeignerDocs.every(doc => getStatus(doc.id, "foreigner") === "confirmed") &&
    requiredCompanyDocs.every(doc => getStatus(doc.id, "company") === "confirmed");

  const getStatusMessage = () => {
    if (allRequiredConfirmed) {
      return {
        bg: "bg-green-50 border-green-200",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />,
        title: "모든 필수 서류 검토 완료",
        desc: "모든 필수 서류 확인이 완료되었습니다. 하단의 '다음' 버튼을 눌러 서류 생성 단계로 진행하세요.",
        titleColor: "text-green-800",
        descColor: "text-green-700",
      };
    }
    if (!allRequiredSubmitted) {
      return {
        bg: "bg-gray-50 border-gray-200",
        icon: <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />,
        title: "필수 서류 제출 대기 중",
        desc: "아직 모든 필수 서류가 제출되지 않았습니다. 외국인과 사업체가 서류를 모두 제출한 후 검토를 진행해주세요.",
        titleColor: "text-gray-700",
        descColor: "text-gray-600",
      };
    }
    if (hasRevisionRequests) {
      return {
        bg: "bg-amber-50 border-amber-300",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
        title: `보완 요청 ${totalRevisionCount}건 처리 대기 중`,
        desc: "문제가 있는 서류에 대해 보완 요청이 등록되었습니다. '재제출 요청' 버튼을 눌러 외국인/사업체에게 알림을 전송하세요.",
        titleColor: "text-amber-800",
        descColor: "text-amber-700",
      };
    }
    return {
      bg: "bg-blue-50 border-blue-200",
      icon: <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
      title: "서류 검토를 진행해주세요",
      desc: "각 서류를 미리보기로 확인한 후 '확인 완료' 또는 '보완하기'를 선택해주세요. 모든 필수 서류가 '확인 완료' 상태가 되어야 다음 단계로 진행할 수 있습니다.",
      titleColor: "text-blue-800",
      descColor: "text-blue-700",
    };
  };

  const statusMsg = getStatusMessage();

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">제출 서류 확인</h1>
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
                <p className="text-xs text-gray-400">전체 {totalDocs}건 중 {totalSubmitted}건 제출</p>
                {hasRevisionRequests && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    보완 {totalRevisionCount}건
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${totalSubmitted > 0 ? (totalConfirmed / totalSubmitted) * 100 : 0}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                외국인 {foreignerStats.confirmedCount}/{foreignerStats.submittedCount} 확인
              </span>
              {foreignerStats.revisionCount > 0 && (
                <span className="text-amber-600 text-xs">· 보완 {foreignerStats.revisionCount}건</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                사업체 {companyStats.confirmedCount}/{companyStats.submittedCount} 확인
              </span>
              {companyStats.revisionCount > 0 && (
                <span className="text-amber-600 text-xs">· 보완 {companyStats.revisionCount}건</span>
              )}
            </div>
          </div>
        </div>

        {/* 서류 검토 영역 - 2컬럼 */}
        <div className="grid grid-cols-2 gap-6">
          {([
            { docs: FOREIGNER_DOCS, uploaded: foreignerDocs, icon: User, title: "외국인 제출 서류", stats: foreignerStats, target: "foreigner" as const },
            { docs: COMPANY_DOCS, uploaded: companyDocs, icon: Building2, title: "사업체 제출 서류", stats: companyStats, target: "company" as const },
          ]).map(({ docs, uploaded, icon: Icon, title, stats, target }) => (
            <div key={target} className="bg-white border-2 border-blue-100 rounded-2xl overflow-hidden">
              <div className="bg-blue-50 px-5 py-4 border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-700">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-bold">{title}</h3>
                  <span className="ml-auto text-sm">{stats.confirmedCount}/{stats.submittedCount} 확인</span>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    fileInfo={uploaded[doc.id] || null}
                    target={target}
                    status={getStatus(doc.id, target)}
                    revisionInfo={revisionInfo[doc.id]}
                    isEditing={editingDocId === doc.id}
                    revisionNote={revisionNote}
                    onRevisionNoteChange={setRevisionNote}
                    onPreview={handlePreview}
                    onConfirm={handleConfirm}
                    onStartRevision={handleStartRevision}
                    onCancelRevision={handleCancelRevision}
                    onSaveRevision={handleSaveRevision}
                    onSendResubmitRequest={handleSendResubmitRequest}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 상태 안내 */}
        <div className={cn("mt-6 p-4 border rounded-xl", statusMsg.bg)}>
          <div className="flex items-start gap-3">
            {statusMsg.icon}
            <div>
              <h4 className={cn("font-semibold", statusMsg.titleColor)}>{statusMsg.title}</h4>
              <p className={cn("text-sm mt-1", statusMsg.descColor)}>{statusMsg.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
