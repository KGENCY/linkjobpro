"use client";

import { useState } from "react";
import {
  Plus, Check, Circle, Send, User, Building2, ChevronDown, ChevronUp,
  Copy, X, Eye, Clock, CheckCircle2, AlertCircle, Link as LinkIcon, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

// 서류 상태 타입
type DocStatus = "not_submitted" | "submitted" | "confirmed";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCustom?: boolean;
  status: DocStatus;
  submittedAt?: string;
  fileName?: string;
}

interface DocumentRequirementsProps {
  caseId: string;
  foreignerDocs: Record<string, { name: string; uploadedAt: string } | null>;
  companyDocs: Record<string, { name: string; uploadedAt: string } | null>;
  onForeignerFileChange: (docId: string, file: File | null) => void;
  onCompanyFileChange: (docId: string, file: File | null) => void;
  onSendRequirements: () => void;
}

// 외국인 필수 서류
const FOREIGNER_REQUIRED_DOCS: Omit<DocumentItem, "status">[] = [
  { id: "passport", title: "여권 사본", description: "여권 사진면 포함", isRequired: true },
  { id: "arc", title: "외국인등록증 사본", description: "앞뒤면 모두", isRequired: true },
  { id: "photo", title: "증명사진", description: "3.5x4.5cm, 6개월 이내", isRequired: true },
  { id: "diploma", title: "졸업증명서", description: "최종학력 (영문/한글)", isRequired: true },
];

// 외국인 추가 가능 서류
const FOREIGNER_OPTIONAL_DOCS: Omit<DocumentItem, "status">[] = [
  { id: "transcript", title: "성적증명서", description: "최종학력 성적증명서", isRequired: false },
  { id: "address", title: "주소 증빙", description: "임대차계약서 또는 기숙사 확인서", isRequired: false },
  { id: "application_form", title: "통합신청서", description: "별지 제34호 서식", isRequired: false },
  { id: "tuberculosis", title: "결핵진단서", description: "3개월 이내 발급", isRequired: false },
  { id: "residence_proof", title: "체류지 입증서류", description: "부동산등기부등본 등", isRequired: false },
  { id: "qualifications", title: "자격요건 입증서류", description: "학위증, 경력증명서 등", isRequired: false },
];

// 사업체 필수 서류
const COMPANY_REQUIRED_DOCS: Omit<DocumentItem, "status">[] = [
  { id: "business_license", title: "사업자등록증", description: "최신본 사본", isRequired: true },
  { id: "insurance_list", title: "4대보험 가입자 명부", description: "1개월 이내 발급", isRequired: true },
  { id: "sales_proof", title: "매출 증빙", description: "부가세 과세표준증명 등", isRequired: true },
  { id: "office_photos", title: "사업장 사진", description: "근무 공간 전경", isRequired: true },
  { id: "employment_contract", title: "고용계약서", description: "서명 완료본", isRequired: true },
];

// 사업체 추가 가능 서류
const COMPANY_OPTIONAL_DOCS: Omit<DocumentItem, "status">[] = [
  { id: "corporate_register", title: "법인등기부등본", description: "법인인 경우, 3개월 이내", isRequired: false },
  { id: "tax_payment", title: "납부내역증명", description: "납세사실증명 또는 재무제표", isRequired: false },
  { id: "national_tax", title: "국세 납세증명서", description: "세금체납 여부 확인", isRequired: false },
  { id: "local_tax", title: "지방세 납세증명서", description: "지방세 납세증명", isRequired: false },
  { id: "employment_recommendation", title: "고용필요성 입증서류", description: "고용추천서 등", isRequired: false },
  { id: "insurance_acquisition", title: "고용보험 취득내역", description: "사업장용", isRequired: false },
];

// 상태 뱃지 컴포넌트
function StatusBadge({ status }: { status: DocStatus }) {
  const config = {
    not_submitted: { label: "미제출", color: "bg-gray-100 text-gray-600", icon: Circle },
    submitted: { label: "제출 완료", color: "bg-blue-100 text-blue-700", icon: Clock },
    confirmed: { label: "확인 완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  };
  const { label, color, icon: Icon } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", color)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function DocumentRequirements({
  caseId,
  foreignerDocs,
  companyDocs,
  onForeignerFileChange,
  onCompanyFileChange,
  onSendRequirements,
}: DocumentRequirementsProps) {
  // 추가된 서류 ID 관리
  const [addedForeignerDocs, setAddedForeignerDocs] = useState<Set<string>>(new Set());
  const [addedCompanyDocs, setAddedCompanyDocs] = useState<Set<string>>(new Set());

  // 사용자 정의 서류
  const [customForeignerDocs, setCustomForeignerDocs] = useState<DocumentItem[]>([]);
  const [customCompanyDocs, setCustomCompanyDocs] = useState<DocumentItem[]>([]);

  // 추가 서류 패널 열림 상태
  const [foreignerPanelOpen, setForeignerPanelOpen] = useState(false);
  const [companyPanelOpen, setCompanyPanelOpen] = useState(false);

  // 직접 서류 추가 인라인 입력 상태
  const [foreignerCustomInput, setForeignerCustomInput] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false, title: "", description: ""
  });
  const [companyCustomInput, setCompanyCustomInput] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false, title: "", description: ""
  });

  // 링크 생성 모달 상태
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<{ foreigner?: string; company?: string }>({});
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // 서류 상태 (실제로는 서버에서 관리)
  const getDocStatus = (docId: string, docs: Record<string, { name: string; uploadedAt: string } | null>): DocStatus => {
    if (docs[docId]) return "submitted";
    return "not_submitted";
  };

  // 활성화된 서류 목록
  const activeForeignerDocs: DocumentItem[] = [
    ...FOREIGNER_REQUIRED_DOCS.map(doc => ({ ...doc, status: getDocStatus(doc.id, foreignerDocs) })),
    ...FOREIGNER_OPTIONAL_DOCS.filter(doc => addedForeignerDocs.has(doc.id)).map(doc => ({ ...doc, status: getDocStatus(doc.id, foreignerDocs) })),
    ...customForeignerDocs,
  ];
  const activeCompanyDocs: DocumentItem[] = [
    ...COMPANY_REQUIRED_DOCS.map(doc => ({ ...doc, status: getDocStatus(doc.id, companyDocs) })),
    ...COMPANY_OPTIONAL_DOCS.filter(doc => addedCompanyDocs.has(doc.id)).map(doc => ({ ...doc, status: getDocStatus(doc.id, companyDocs) })),
    ...customCompanyDocs,
  ];

  // 완료 카운트
  const foreignerSubmitted = activeForeignerDocs.filter(doc => doc.status !== "not_submitted").length;
  const companySubmitted = activeCompanyDocs.filter(doc => doc.status !== "not_submitted").length;
  const totalRequired = activeForeignerDocs.length + activeCompanyDocs.length;
  const totalSubmitted = foreignerSubmitted + companySubmitted;

  // 서류 추가/제거
  const toggleForeignerDoc = (docId: string) => {
    setAddedForeignerDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const toggleCompanyDoc = (docId: string) => {
    setAddedCompanyDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // 직접 서류 추가 - 외국인
  const addCustomForeignerDoc = () => {
    if (!foreignerCustomInput.title.trim()) return;

    const newDoc: DocumentItem = {
      id: `custom_foreigner_${Date.now()}`,
      title: foreignerCustomInput.title,
      description: foreignerCustomInput.description || "추가 서류",
      isRequired: false,
      isCustom: true,
      status: "not_submitted",
    };

    setCustomForeignerDocs(prev => [...prev, newDoc]);
    setForeignerCustomInput({ isOpen: false, title: "", description: "" });
  };

  // 직접 서류 추가 - 사업체
  const addCustomCompanyDoc = () => {
    if (!companyCustomInput.title.trim()) return;

    const newDoc: DocumentItem = {
      id: `custom_company_${Date.now()}`,
      title: companyCustomInput.title,
      description: companyCustomInput.description || "추가 서류",
      isRequired: false,
      isCustom: true,
      status: "not_submitted",
    };

    setCustomCompanyDocs(prev => [...prev, newDoc]);
    setCompanyCustomInput({ isOpen: false, title: "", description: "" });
  };

  // 직접 추가 서류 제거
  const removeCustomDoc = (docId: string, target: "foreigner" | "company") => {
    if (target === "foreigner") {
      setCustomForeignerDocs(prev => prev.filter(d => d.id !== docId));
    } else {
      setCustomCompanyDocs(prev => prev.filter(d => d.id !== docId));
    }
  };

  // 링크 생성
  const generateLink = (type: "foreigner" | "company") => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${baseUrl}/submit/${type}/${caseId}?token=${token}`;

    setGeneratedLinks(prev => ({ ...prev, [type]: link }));
  };

  // 링크 복사
  const copyToClipboard = async (link: string, type: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // 서류 항목 컴포넌트
  const DocumentItemRow = ({
    doc,
    onRemove,
    target,
  }: {
    doc: DocumentItem;
    onRemove?: () => void;
    target: "foreigner" | "company";
  }) => (
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
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded">
                필수
              </span>
            )}
            {doc.isCustom && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-600 rounded">
                직접 추가
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <StatusBadge status={doc.status} />
        {doc.status === "submitted" && (
          <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="서류 확인">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {!doc.isRequired && onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="제거"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  // 인라인 서류 추가 입력 컴포넌트
  const InlineCustomDocInput = ({
    input,
    setInput,
    onAdd,
    accentColor,
  }: {
    input: { isOpen: boolean; title: string; description: string };
    setInput: (val: { isOpen: boolean; title: string; description: string }) => void;
    onAdd: () => void;
    accentColor: "blue" | "purple";
  }) => {
    if (!input.isOpen) return null;

    const colorClasses = accentColor === "blue"
      ? { bg: "bg-blue-50", border: "border-blue-200", focusRing: "focus:ring-blue-500", btn: "bg-blue-600 hover:bg-blue-700" }
      : { bg: "bg-purple-50", border: "border-purple-200", focusRing: "focus:ring-purple-500", btn: "bg-purple-600 hover:bg-purple-700" };

    return (
      <div className={cn("mt-3 p-4 rounded-xl border-2", colorClasses.bg, colorClasses.border)}>
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className={cn("w-4 h-4", accentColor === "blue" ? "text-blue-600" : "text-purple-600")} />
          <span className="text-sm font-semibold text-gray-900">직접 서류 추가</span>
        </div>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
              placeholder="서류 이름을 입력하세요"
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2",
                colorClasses.focusRing
              )}
              autoFocus
            />
          </div>
          <div>
            <input
              type="text"
              value={input.description}
              onChange={(e) => setInput({ ...input, description: e.target.value })}
              placeholder="제출 기준 설명 (선택)"
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2",
                colorClasses.focusRing
              )}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInput({ isOpen: false, title: "", description: "" })}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onAdd}
              disabled={!input.title.trim()}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                input.title.trim() ? colorClasses.btn : "bg-gray-300 cursor-not-allowed"
              )}
            >
              추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            제출 서류 요건
          </h1>
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
            <span className="text-lg font-bold text-blue-600">
              {totalSubmitted}/{totalRequired}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${totalRequired > 0 ? (totalSubmitted / totalRequired) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-blue-600 font-medium">외국인 {foreignerSubmitted}/{activeForeignerDocs.length}</span>
            <span className="text-purple-600 font-medium">사업체 {companySubmitted}/{activeCompanyDocs.length}</span>
          </div>
        </div>

        {/* 서류 목록 - 2컬럼 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 외국인 서류 */}
          <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <h3 className="font-bold">외국인 제출 서류</h3>
                <span className="ml-auto text-sm opacity-90">
                  {foreignerSubmitted}/{activeForeignerDocs.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: "450px" }}>
              {activeForeignerDocs.map((doc) => (
                <DocumentItemRow
                  key={doc.id}
                  doc={doc}
                  target="foreigner"
                  onRemove={
                    doc.isCustom
                      ? () => removeCustomDoc(doc.id, "foreigner")
                      : !doc.isRequired
                      ? () => toggleForeignerDoc(doc.id)
                      : undefined
                  }
                />
              ))}
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="p-4 border-t border-blue-100 bg-blue-50/30">
              {/* 사전 정의 서류 추가 */}
              <button
                onClick={() => setForeignerPanelOpen(!foreignerPanelOpen)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {foreignerPanelOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span className="text-sm font-medium">사전 정의 서류에서 추가</span>
              </button>

              {/* 사전 정의 서류 목록 */}
              {foreignerPanelOpen && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl space-y-2 max-h-[200px] overflow-y-auto">
                  {FOREIGNER_OPTIONAL_DOCS.filter(doc => !addedForeignerDocs.has(doc.id)).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleForeignerDoc(doc.id)}
                      className="w-full flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-xs text-gray-500 truncate">{doc.description}</div>
                      </div>
                    </button>
                  ))}
                  {FOREIGNER_OPTIONAL_DOCS.filter(doc => !addedForeignerDocs.has(doc.id)).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">모든 서류가 추가되었습니다</p>
                  )}
                </div>
              )}

              {/* 직접 서류 추가 버튼 */}
              {!foreignerCustomInput.isOpen && (
                <button
                  onClick={() => setForeignerCustomInput({ isOpen: true, title: "", description: "" })}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">직접 서류 추가</span>
                </button>
              )}

              {/* 직접 서류 추가 인라인 입력 */}
              <InlineCustomDocInput
                input={foreignerCustomInput}
                setInput={setForeignerCustomInput}
                onAdd={addCustomForeignerDoc}
                accentColor="blue"
              />
            </div>
          </div>

          {/* 사업체 서류 */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold">사업체 제출 서류</h3>
                <span className="ml-auto text-sm opacity-90">
                  {companySubmitted}/{activeCompanyDocs.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: "450px" }}>
              {activeCompanyDocs.map((doc) => (
                <DocumentItemRow
                  key={doc.id}
                  doc={doc}
                  target="company"
                  onRemove={
                    doc.isCustom
                      ? () => removeCustomDoc(doc.id, "company")
                      : !doc.isRequired
                      ? () => toggleCompanyDoc(doc.id)
                      : undefined
                  }
                />
              ))}
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="p-4 border-t border-purple-100 bg-purple-50/30">
              {/* 사전 정의 서류 추가 */}
              <button
                onClick={() => setCompanyPanelOpen(!companyPanelOpen)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
              >
                {companyPanelOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span className="text-sm font-medium">사전 정의 서류에서 추가</span>
              </button>

              {/* 사전 정의 서류 목록 */}
              {companyPanelOpen && (
                <div className="mt-3 p-3 bg-purple-50 rounded-xl space-y-2 max-h-[200px] overflow-y-auto">
                  {COMPANY_OPTIONAL_DOCS.filter(doc => !addedCompanyDocs.has(doc.id)).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleCompanyDoc(doc.id)}
                      className="w-full flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-xs text-gray-500 truncate">{doc.description}</div>
                      </div>
                    </button>
                  ))}
                  {COMPANY_OPTIONAL_DOCS.filter(doc => !addedCompanyDocs.has(doc.id)).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">모든 서류가 추가되었습니다</p>
                  )}
                </div>
              )}

              {/* 직접 서류 추가 버튼 */}
              {!companyCustomInput.isOpen && (
                <button
                  onClick={() => setCompanyCustomInput({ isOpen: true, title: "", description: "" })}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">직접 서류 추가</span>
                </button>
              )}

              {/* 직접 서류 추가 인라인 입력 */}
              <InlineCustomDocInput
                input={companyCustomInput}
                setInput={setCompanyCustomInput}
                onAdd={addCustomCompanyDoc}
                accentColor="purple"
              />
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg">
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

      {/* 링크 생성 모달 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">제출 링크 생성</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              외국인과 사업체에게 각각 전달할 제출 링크를 생성하세요.<br />
              각 링크에는 해당 대상에게 필요한 서류 목록만 표시됩니다.
            </p>

            {/* 외국인 링크 */}
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">외국인 제출용 링크</span>
                <span className="text-xs text-blue-600 ml-auto">{activeForeignerDocs.length}건의 서류</span>
              </div>
              {generatedLinks.foreigner ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLinks.foreigner}
                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLinks.foreigner!, "foreigner")}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1",
                      copiedLink === "foreigner"
                        ? "bg-green-500 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {copiedLink === "foreigner" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink === "foreigner" ? "복사됨" : "복사"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => generateLink("foreigner")}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  링크 생성
                </button>
              )}
            </div>

            {/* 사업체 링크 */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">사업체 제출용 링크</span>
                <span className="text-xs text-purple-600 ml-auto">{activeCompanyDocs.length}건의 서류</span>
              </div>
              {generatedLinks.company ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLinks.company}
                    className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLinks.company!, "company")}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1",
                      copiedLink === "company"
                        ? "bg-green-500 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    )}
                  >
                    {copiedLink === "company" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink === "company" ? "복사됨" : "복사"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => generateLink("company")}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  링크 생성
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                생성된 링크는 외국인/사업체가 서류를 제출하면 이 화면에 자동 반영됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
