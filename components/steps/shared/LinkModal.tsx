import { Check, Copy, X, User, Building2, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocTarget } from "@/lib/types";

interface LinkModalProps {
  foreignerDocCount: number;
  companyDocCount: number;
  generatedLinks: { foreigner?: string; company?: string };
  copiedLink: string | null;
  onClose: () => void;
  onGenerateLink: (type: DocTarget) => void;
  onCopyLink: (link: string, type: string) => void;
}

const SECTIONS: {
  type: DocTarget;
  icon: typeof User;
  label: string;
  styles: { bg: string; border: string; text: string; btn: string; btnHover: string; inputBorder: string };
}[] = [
  {
    type: "foreigner", icon: User, label: "외국인 제출용 링크",
    styles: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", btn: "bg-blue-600", btnHover: "hover:bg-blue-700", inputBorder: "border-blue-300" },
  },
  {
    type: "company", icon: Building2, label: "사업체 제출용 링크",
    styles: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", btn: "bg-purple-600", btnHover: "hover:bg-purple-700", inputBorder: "border-purple-300" },
  },
];

export function LinkModal({
  foreignerDocCount, companyDocCount,
  generatedLinks, copiedLink,
  onClose, onGenerateLink, onCopyLink,
}: LinkModalProps) {
  const countByType: Record<DocTarget, number> = {
    foreigner: foreignerDocCount,
    company: companyDocCount,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">제출 링크 생성</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          외국인과 사업체에게 각각 전달할 제출 링크를 생성하세요.<br />
          각 링크에는 해당 대상에게 필요한 서류 목록만 표시됩니다.
        </p>

        {SECTIONS.map(({ type, icon: SectionIcon, label, styles }) => {
          const link = generatedLinks[type];
          const isCopied = copiedLink === type;

          return (
            <div key={type} className={cn("p-4 rounded-xl border mb-4", styles.bg, styles.border)}>
              <div className="flex items-center gap-2 mb-3">
                <SectionIcon className={cn("w-5 h-5", styles.text)} />
                <span className="font-semibold text-gray-900">{label}</span>
                <span className={cn("text-xs ml-auto", styles.text)}>{countByType[type]}건의 서류</span>
              </div>
              {link ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={link}
                    className={cn("flex-1 px-3 py-2 bg-white border rounded-lg text-sm text-gray-700", styles.inputBorder)}
                  />
                  <button
                    onClick={() => onCopyLink(link, type)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1",
                      isCopied
                        ? "bg-green-500 text-white"
                        : cn("text-white", styles.btn, styles.btnHover)
                    )}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "복사됨" : "복사"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onGenerateLink(type)}
                  className={cn(
                    "w-full py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                    styles.btn, styles.btnHover
                  )}
                >
                  <LinkIcon className="w-4 h-4" />
                  링크 생성
                </button>
              )}
            </div>
          );
        })}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            생성된 링크는 외국인/사업체가 서류를 제출하면 이 화면에 자동 반영됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
