"use client";

import { useState } from "react";
import {
  Plus, Check, Circle, Send, User, Building2, ChevronUp,
  X, Eye, Clock, CheckCircle2, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FOREIGNER_REQUIRED_DOCS,
  FOREIGNER_OPTIONAL_DOCS,
  COMPANY_REQUIRED_DOCS,
  COMPANY_OPTIONAL_DOCS,
  type DocDefinition,
} from "@/lib/doc-constants";
import { StatusBadge } from "@/components/steps/shared/StatusBadge";
import { LinkModal } from "@/components/steps/shared/LinkModal";
import type { DocStatus, DocTarget, UploadedFile } from "@/lib/types";

interface DocumentItem extends DocDefinition {
  isCustom?: boolean;
  status: DocStatus;
}

interface CustomInput {
  isOpen: boolean;
  title: string;
  description: string;
}

interface DocumentRequirementsProps {
  caseId: string;
  foreignerDocs: Record<string, UploadedFile | null>;
  companyDocs: Record<string, UploadedFile | null>;
}

const DEFAULT_CUSTOM_INPUT: CustomInput = { isOpen: false, title: "", description: "" };

function DocumentItemRow({ doc, onRemove }: { doc: DocumentItem; onRemove?: () => void }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
      doc.status === "confirmed" ? "bg-green-50 border-green-200" :
      doc.status === "submitted" ? "bg-blue-50 border-blue-200" :
      "bg-white border-gray-200"
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
          doc.status === "confirmed" ? "bg-green-500" :
          doc.status === "submitted" ? "bg-blue-500" :
          "bg-gray-200"
        )}>
          {doc.status === "confirmed" ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : doc.status === "submitted" ? (
            <Clock className="w-4 h-4 text-white" />
          ) : (
            <Circle className="w-3 h-3 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-medium text-sm",
              doc.status !== "not_submitted" ? "text-gray-900" : "text-gray-700"
            )}>
              {doc.title}
            </span>
            {doc.isRequired && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded">필수</span>
            )}
            {doc.isCustom && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-600 rounded">직접 추가</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <StatusBadge status={doc.status} variant="simple" />
        {doc.status === "submitted" && (
          <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="서류 확인">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {!doc.isRequired && onRemove && (
          <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="제거">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function InlineCustomDocInput({
  input, setInput, onAdd,
}: {
  input: CustomInput;
  setInput: (val: CustomInput) => void;
  onAdd: () => void;
}) {
  if (!input.isOpen) return null;

  return (
    <div className="mt-3 p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Edit3 className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">직접 서류 추가</span>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={input.title}
          onChange={(e) => setInput({ ...input, title: e.target.value })}
          placeholder="서류 이름을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <input
          type="text"
          value={input.description}
          onChange={(e) => setInput({ ...input, description: e.target.value })}
          placeholder="제출 기준 설명 (선택)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setInput(DEFAULT_CUSTOM_INPUT)}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onAdd}
            disabled={!input.title.trim()}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors",
              input.title.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            )}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

function DocColumn({
  icon: Icon, title, activeDocs, submittedCount,
  optionalDocs, addedDocIds, onToggleDoc, onRemoveCustomDoc,
  panelOpen, setPanelOpen, customInput, setCustomInput, onAddCustomDoc,
}: {
  icon: React.ElementType;
  title: string;
  activeDocs: DocumentItem[];
  submittedCount: number;
  optionalDocs: DocDefinition[];
  addedDocIds: Set<string>;
  onToggleDoc: (docId: string) => void;
  onRemoveCustomDoc: (docId: string) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  customInput: CustomInput;
  setCustomInput: (val: CustomInput) => void;
  onAddCustomDoc: () => void;
}) {
  const availableDocs = optionalDocs.filter(doc => !addedDocIds.has(doc.id));

  return (
    <div className="bg-white border-2 border-blue-100 rounded-2xl overflow-hidden flex flex-col">
      <div className="bg-blue-50 px-5 py-4 border-b border-blue-100">
        <div className="flex items-center gap-2 text-blue-700">
          <Icon className="w-5 h-5" />
          <h3 className="font-bold">{title}</h3>
          <span className="ml-auto text-sm">{submittedCount}/{activeDocs.length}</span>
        </div>
      </div>

      <div className="p-4 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: "450px" }}>
        {activeDocs.map((doc) => (
          <DocumentItemRow
            key={doc.id}
            doc={doc}
            onRemove={
              doc.isCustom
                ? () => onRemoveCustomDoc(doc.id)
                : !doc.isRequired
                ? () => onToggleDoc(doc.id)
                : undefined
            }
          />
        ))}
      </div>

      <div className="p-4 border-t border-blue-100 bg-blue-50/30">
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {panelOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="text-sm font-medium">사전 정의 서류에서 추가</span>
        </button>

        {panelOpen && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl space-y-2 max-h-[200px] overflow-y-auto">
            {availableDocs.length > 0 ? (
              availableDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onToggleDoc(doc.id)}
                  className="w-full flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-left"
                >
                  <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-500 truncate">{doc.description}</div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">모든 서류가 추가되었습니다</p>
            )}
          </div>
        )}

        {!customInput.isOpen && (
          <button
            onClick={() => setCustomInput({ isOpen: true, title: "", description: "" })}
            className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">직접 서류 추가</span>
          </button>
        )}

        <InlineCustomDocInput input={customInput} setInput={setCustomInput} onAdd={onAddCustomDoc} />
      </div>
    </div>
  );
}

export function DocumentRequirements({
  caseId,
  foreignerDocs,
  companyDocs,
}: DocumentRequirementsProps) {
  const [addedForeignerDocs, setAddedForeignerDocs] = useState<Set<string>>(new Set());
  const [addedCompanyDocs, setAddedCompanyDocs] = useState<Set<string>>(new Set());
  const [customForeignerDocs, setCustomForeignerDocs] = useState<DocumentItem[]>([]);
  const [customCompanyDocs, setCustomCompanyDocs] = useState<DocumentItem[]>([]);
  const [foreignerPanelOpen, setForeignerPanelOpen] = useState(false);
  const [companyPanelOpen, setCompanyPanelOpen] = useState(false);
  const [foreignerCustomInput, setForeignerCustomInput] = useState<CustomInput>(DEFAULT_CUSTOM_INPUT);
  const [companyCustomInput, setCompanyCustomInput] = useState<CustomInput>(DEFAULT_CUSTOM_INPUT);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<{ foreigner?: string; company?: string }>({});
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const getDocStatus = (docId: string, docs: Record<string, UploadedFile | null>): DocStatus => {
    return docs[docId] ? "submitted" : "not_submitted";
  };

  const buildActiveDocs = (
    requiredDocs: DocDefinition[],
    optionalDocs: DocDefinition[],
    addedIds: Set<string>,
    customDocs: DocumentItem[],
    uploadedDocs: Record<string, UploadedFile | null>,
  ): DocumentItem[] => [
    ...requiredDocs.map(doc => ({ ...doc, status: getDocStatus(doc.id, uploadedDocs) })),
    ...optionalDocs.filter(doc => addedIds.has(doc.id)).map(doc => ({ ...doc, status: getDocStatus(doc.id, uploadedDocs) })),
    ...customDocs,
  ];

  const activeForeignerDocs = buildActiveDocs(
    FOREIGNER_REQUIRED_DOCS, FOREIGNER_OPTIONAL_DOCS, addedForeignerDocs, customForeignerDocs, foreignerDocs
  );
  const activeCompanyDocs = buildActiveDocs(
    COMPANY_REQUIRED_DOCS, COMPANY_OPTIONAL_DOCS, addedCompanyDocs, customCompanyDocs, companyDocs
  );

  const foreignerSubmitted = activeForeignerDocs.filter(doc => doc.status !== "not_submitted").length;
  const companySubmitted = activeCompanyDocs.filter(doc => doc.status !== "not_submitted").length;
  const totalRequired = activeForeignerDocs.length + activeCompanyDocs.length;
  const totalSubmitted = foreignerSubmitted + companySubmitted;

  const toggleDoc = (target: DocTarget, docId: string) => {
    const setter = target === "foreigner" ? setAddedForeignerDocs : setAddedCompanyDocs;
    setter(prev => {
      const newSet = new Set(prev);
      newSet.has(docId) ? newSet.delete(docId) : newSet.add(docId);
      return newSet;
    });
  };

  const addCustomDoc = (target: DocTarget) => {
    const input = target === "foreigner" ? foreignerCustomInput : companyCustomInput;
    const setDocs = target === "foreigner" ? setCustomForeignerDocs : setCustomCompanyDocs;
    const setInput = target === "foreigner" ? setForeignerCustomInput : setCompanyCustomInput;

    if (!input.title.trim()) return;

    setDocs(prev => [...prev, {
      id: `custom_${target}_${Date.now()}`,
      title: input.title,
      description: input.description || "추가 서류",
      isRequired: false,
      isCustom: true,
      status: "not_submitted" as DocStatus,
    }]);
    setInput(DEFAULT_CUSTOM_INPUT);
  };

  const removeCustomDoc = (target: DocTarget, docId: string) => {
    const setter = target === "foreigner" ? setCustomForeignerDocs : setCustomCompanyDocs;
    setter(prev => prev.filter(d => d.id !== docId));
  };

  const generateLink = (type: DocTarget) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const token = Math.random().toString(36).substring(2, 15);
    setGeneratedLinks(prev => ({ ...prev, [type]: `${baseUrl}/submit/${type}/${caseId}?token=${token}` }));
  };

  const copyToClipboard = async (link: string, type: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">제출 서류 요건</h1>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            이 케이스에 필요한 서류 목록을 정의하고, 외국인과 사업체에게 각각 전달하세요.
          </p>
        </div>

        {/* 전체 진행 상황 */}
        <div className="mb-8 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">서류 제출 현황</h3>
              <p className="text-xs text-gray-500 mt-1">외국인과 사업체가 제출한 서류가 실시간으로 반영됩니다</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{totalSubmitted}/{totalRequired}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${totalRequired > 0 ? (totalSubmitted / totalRequired) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-blue-600 font-medium">외국인 {foreignerSubmitted}/{activeForeignerDocs.length}</span>
            <span className="text-blue-600 font-medium">사업체 {companySubmitted}/{activeCompanyDocs.length}</span>
          </div>
        </div>

        {/* 서류 목록 - 2컬럼 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <DocColumn
            icon={User}
            title="외국인 제출 서류"
            activeDocs={activeForeignerDocs}
            submittedCount={foreignerSubmitted}
            optionalDocs={FOREIGNER_OPTIONAL_DOCS}
            addedDocIds={addedForeignerDocs}
            onToggleDoc={(docId) => toggleDoc("foreigner", docId)}
            onRemoveCustomDoc={(docId) => removeCustomDoc("foreigner", docId)}
            panelOpen={foreignerPanelOpen}
            setPanelOpen={setForeignerPanelOpen}
            customInput={foreignerCustomInput}
            setCustomInput={setForeignerCustomInput}
            onAddCustomDoc={() => addCustomDoc("foreigner")}
          />
          <DocColumn
            icon={Building2}
            title="사업체 제출 서류"
            activeDocs={activeCompanyDocs}
            submittedCount={companySubmitted}
            optionalDocs={COMPANY_OPTIONAL_DOCS}
            addedDocIds={addedCompanyDocs}
            onToggleDoc={(docId) => toggleDoc("company", docId)}
            onRemoveCustomDoc={(docId) => removeCustomDoc("company", docId)}
            panelOpen={companyPanelOpen}
            setPanelOpen={setCompanyPanelOpen}
            customInput={companyCustomInput}
            setCustomInput={setCompanyCustomInput}
            onAddCustomDoc={() => addCustomDoc("company")}
          />
        </div>

        {/* 하단 CTA */}
        <div className="bg-blue-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-bold text-lg mb-1">제출 서류 목록 전달</h3>
              <p className="text-sm opacity-90">
                외국인 {activeForeignerDocs.length}건, 사업체 {activeCompanyDocs.length}건의 서류 요건을 각각 전달합니다.
              </p>
            </div>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
              이대로 제출 서류 목록 보내기
            </button>
          </div>
        </div>
      </div>

      {showLinkModal && (
        <LinkModal
          foreignerDocCount={activeForeignerDocs.length}
          companyDocCount={activeCompanyDocs.length}
          generatedLinks={generatedLinks}
          copiedLink={copiedLink}
          onClose={() => setShowLinkModal(false)}
          onGenerateLink={generateLink}
          onCopyLink={copyToClipboard}
        />
      )}
    </div>
  );
}
