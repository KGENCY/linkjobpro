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
  1: "외국인 서류",
  2: "사업체 서류",
  3: "문서 작성",
  4: "출력",
};

// 외국인 서류 타입
export type ForeignerDocType =
  | "passport"
  | "arc"
  | "photo"
  | "diploma"
  | "transcript"
  | "addressProof";

// 사업체 서류 타입
export type CompanyDocType =
  | "bizRegistration"
  | "employmentContract"
  | "taxPayment"
  | "companyIntro"
  | "orgChart"
  | "financialStatement";

// 문서 파일 데이터
export interface DocumentFile {
  name: string;
  size: number;
  type: string;
  data: string; // Base64 encoded
  uploadedAt: string;
}

// 제출 상태
export interface SubmissionState {
  isSubmitted: boolean;
  submittedAt?: string;
}

// 확장된 케이스 (localStorage에서 사용)
export interface ExtendedCase extends Case {
  tokens?: {
    foreignerToken: string;
    companyToken: string;
  };
  foreignerSubmission?: SubmissionState;
  companySubmission?: SubmissionState;
  foreignerDocs: Partial<Record<ForeignerDocType, DocumentFile>>;
  companyDocs: Partial<Record<CompanyDocType, DocumentFile>>;
  formData?: DocumentFormData;
  generatedDocs?: GeneratedDocuments;
}

// 문서 폼 데이터
export interface DocumentFormData {
  companyName: string;
  industry: string;
  employeeCount: string;
  address: string;
  jobTitle: string;
  jobSummary: string;
  hiringReason: string;
  salary: string;
  workHours: string;
  dormitory: string;
  foreignerName: string;
  nationality: string;
  major: string;
}

// 생성된 문서
export interface GeneratedDocuments {
  employmentReason: string;
  jobDescription: string;
}

// 단계 활성화 상태
export interface StepActivationState {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  recommendedStep: CaseStep | null;
}