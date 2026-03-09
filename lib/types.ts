export interface UploadedFile {
  name: string;
  uploadedAt: string;
}

export type DocTarget = "foreigner" | "company";

export type DocStatus =
  | "not_submitted"
  | "submitted"
  | "confirmed"
  | "revision_requested"
  | "resubmitted";

export type CaseStatus =
  | "collecting"    // 수집중
  | "writing"       // 작성중
  | "revision"      // 보완요청
  | "ready"         // 출력대기
  | "completed";    // 완료

export type CaseStep = 1 | 2 | 3 | 4;

export interface Case {
  id: string;
  foreignerName: string;
  companyName: string;
  visaType: string;
  status: CaseStatus;
  currentStep: CaseStep;
  stepProgress: string; // "외국인 서류 4/6"
  revisionCount?: number; // 보완 요청 건수
  createdAt: string;
  lastUpdated: string;
  foreignerPhone?: string;
  companyPhone?: string;
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  collecting: "수집중",
  writing: "작성중",
  revision: "보완요청",
  ready: "출력대기",
  completed: "완료",
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  collecting: "bg-blue-50 text-blue-700",
  writing: "bg-purple-50 text-purple-700",
  revision: "bg-amber-100 text-amber-800 border border-amber-300",
  ready: "bg-green-50 text-green-700",
  completed: "bg-gray-100 text-gray-600",
};

export const STEP_LABELS: Record<CaseStep, string> = {
  1: "제출 서류 요건",
  2: "제출 서류 확인",
  3: "서류 생성",
  4: "최종 출력",
};
