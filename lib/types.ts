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
  createdAt: string;
  lastUpdated: string;
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  collecting: "수집중",
  writing: "작성중",
  revision: "보완요청",
  ready: "출력대기",
  completed: "완료",
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  collecting: "bg-blue-100 text-blue-700 border-blue-200",
  writing: "bg-purple-100 text-purple-700 border-purple-200",
  revision: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

export const STEP_LABELS: Record<CaseStep, string> = {
  1: "외국인 서류",
  2: "사업체 서류",
  3: "문서 작성",
  4: "출력",
};