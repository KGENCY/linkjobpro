"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { CaseHeaderBar } from "@/components/wizard/CaseHeaderBar";
import { NavigationButtons } from "@/components/wizard/NavigationButtons";
import { DocumentRequirements } from "@/components/steps/DocumentRequirements";
import { DocumentReview } from "@/components/steps/DocumentReview";
import { Step3DocumentGeneration } from "@/components/steps/Step3DocumentGeneration";
import { Step4FinalExport } from "@/components/steps/Step4FinalExport";
import { AnalyzingOverlay } from "@/components/wizard/AnalyzingOverlay";
import { ArrowLeft } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

// Nguyen Van A 케이스 시나리오 데이터
const SCENARIO_CASE_ID = "case-001";

const SCENARIO_FOREIGNER_DOCS: Record<string, UploadedFile | null> = {
  passport: { name: "passport_nguyen.pdf", uploadedAt: "10:15" },
  arc: { name: "arc_nguyen.pdf", uploadedAt: "10:18" },
  photo: { name: "photo_nguyen.jpg", uploadedAt: "10:20" },
  diploma: { name: "diploma_hanoi_univ.pdf", uploadedAt: "10:22" },
  transcript: { name: "transcript_nguyen.pdf", uploadedAt: "10:25" },
  address: { name: "residence_contract.pdf", uploadedAt: "10:28" },
};

const SCENARIO_COMPANY_DOCS: Record<string, UploadedFile | null> = {
  business_license: { name: "사업자등록증_ABC제조.pdf", uploadedAt: "11:05" },
  corporate_register: { name: "법인등기부등본_ABC.pdf", uploadedAt: "11:08" },
  insurance_list: { name: "4대보험_가입자명부.pdf", uploadedAt: "11:12" },
  sales_proof: { name: "부가세과세표준증명.pdf", uploadedAt: "11:15" },
  office_photos: { name: "사업장사진_ABC제조.zip", uploadedAt: "11:20" },
  employment_contract: { name: "고용계약서_Nguyen.pdf", uploadedAt: "11:25" },
};

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  // 시나리오 모드 여부 (Nguyen Van A 케이스)
  const isScenarioMode = caseId === SCENARIO_CASE_ID;

  const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  // 분석 오버레이가 이미 표시되었는지 추적 (케이스당 최초 1회만 표시)
  const [hasShownAnalysis, setHasShownAnalysis] = useState(false);
  // 시나리오 모드면 Step 2에서 시작
  const [currentStep, setCurrentStep] = useState(isScenarioMode ? 2 : 1);

  // 외국인 서류 (시나리오 모드면 모두 제출된 상태)
  const [foreignerDocs, setForeignerDocs] = useState<
    Record<string, UploadedFile | null>
  >(isScenarioMode ? SCENARIO_FOREIGNER_DOCS : {
    passport: null,
    arc: null,
    photo: null,
    diploma: null,
    transcript: null,
    address: null,
  });

  // 사업체 서류 (시나리오 모드면 모두 제출된 상태)
  const [companyDocs, setCompanyDocs] = useState<
    Record<string, UploadedFile | null>
  >(isScenarioMode ? SCENARIO_COMPANY_DOCS : {
    business_license: null,
    corporate_register: null,
    insurance_list: null,
    sales_proof: null,
    office_photos: null,
    employment_contract: null,
  });

  // 생성 문서 폼 데이터 (시나리오 모드면 일부 채워진 상태)
  const [formData, setFormData] = useState({
    companyName: isScenarioMode ? "ABC 제조" : "",
    industry: isScenarioMode ? "제조업" : "",
    employeeCount: isScenarioMode ? "45명" : "",
    address: isScenarioMode ? "경기도 안산시 단원구" : "",
    jobTitle: isScenarioMode ? "생산관리 엔지니어" : "",
    jobSummary: isScenarioMode ? "제조 공정 관리 및 품질 개선" : "",
    hiringReason: isScenarioMode ? "해외 수출 확대에 따른 전문인력 필요" : "",
    salary: isScenarioMode ? "월 300만원" : "",
    workHours: isScenarioMode ? "주 40시간 (09:00-18:00)" : "",
    dormitory: isScenarioMode ? "제공 (사내 기숙사)" : "",
    foreignerName: isScenarioMode ? "Nguyen Van A" : "김철수",
    nationality: isScenarioMode ? "베트남" : "",
    major: isScenarioMode ? "산업공학" : "",
  });

  // 생성된 문서
  const [generatedDocs, setGeneratedDocs] = useState({
    employmentReason: "",
    jobDescription: "",
  });

  const [documentVersions, setDocumentVersions] = useState(1);

  // 케이스 특이사항 (메모장형 단일 메모)
  const [caseMemo, setCaseMemo] = useState("");
  const [lastMemoSavedAt, setLastMemoSavedAt] = useState<string | undefined>();

  // 메모 변경 핸들러
  const handleMemoChange = (memo: string) => {
    setCaseMemo(memo);
    setLastMemoSavedAt(
      new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\. /g, "-").replace(".", "")
    );
    // TODO: 실제 구현 시 localStorage 또는 API로 저장
  };

  // 파일 변경 핸들러
  const handleForeignerFileChange = (docId: string, file: File | null) => {
    if (file) {
      setForeignerDocs({
        ...foreignerDocs,
        [docId]: {
          name: file.name,
          uploadedAt: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      });
    } else {
      setForeignerDocs({
        ...foreignerDocs,
        [docId]: null,
      });
    }
  };

  const handleCompanyFileChange = (docId: string, file: File | null) => {
    if (file) {
      setCompanyDocs({
        ...companyDocs,
        [docId]: {
          name: file.name,
          uploadedAt: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      });
    } else {
      setCompanyDocs({
        ...companyDocs,
        [docId]: null,
      });
    }
  };

  // 제출 서류 목록 보내기
  const handleSendRequirements = () => {
    alert("제출 서류 목록 링크가 생성되었습니다.\n외국인과 사업체에게 전달하세요.");
  };

  // 서류 검토 상태 변경
  const handleReviewStatusChange = (
    docId: string,
    status: "not_submitted" | "submitted" | "confirmed" | "revision_requested" | "resubmitted",
    target: "foreigner" | "company",
    note?: string
  ) => {
    console.log(`Document ${docId} status changed to ${status}`, { target, note });
    // TODO: 실제 상태 관리 로직 구현
  };

  // 문서 생성
  const handleGenerateDocuments = () => {
    const employmentReason = `3. 고용사유 및 인력활용계획

1) 고용사유
당사 ${formData.companyName}은 ${formData.industry} 분야의 전문기업으로, 최근 ${formData.hiringReason}에 따라 전문 인력이 절실히 필요한 상황입니다.

${formData.jobTitle} 직무는 ${formData.jobSummary} 등의 고도의 전문 업무를 수행해야 하며, 이를 위해서는 관련 분야의 깊은 이해와 실무 경험이 필수적입니다.

국내 인력 채용을 위해 구인공고 게재 및 헤드헌팅 등 다각도로 노력하였으나, ${formData.industry} 분야의 전문 인력 부족으로 인해 적합한 인재를 확보하지 못하였습니다.

채용 예정인 ${formData.foreignerName}님은 ${formData.major} 전공자로서 관련 분야에 대한 전문 지식과 기술을 보유하고 있으며, 당사가 요구하는 ${formData.jobTitle} 직무를 수행하기에 적합한 인재입니다.

2) 기술도입 및 전문외국인력교류 효과
${formData.foreignerName}님의 채용을 통해 당사는 ${formData.industry} 분야의 최신 기술과 노하우를 습득할 수 있으며, 이는 당사의 기술 경쟁력 강화에 크게 기여할 것으로 기대됩니다.

3) 활용계획
${formData.foreignerName}님은 ${formData.jobTitle}로서 다음과 같은 업무를 담당할 예정입니다:
${formData.jobSummary}

4) 기타사항
근로 조건:
- 급여: ${formData.salary}
- 근무 시간: ${formData.workHours || '주 40시간 (09:00-18:00)'}
- 기숙사: ${formData.dormitory || '미제공'}

이상과 같은 사유로 ${formData.foreignerName}님을 ${formData.jobTitle}로 채용하고자 하오니 허가하여 주시기 바랍니다.`;

    const jobDescription = `직무기술서 (Job Description)

회사명: ${formData.companyName}
채용 직무: ${formData.jobTitle}

1. 직무 개요
${formData.jobSummary}

2. 주요 업무
- ${formData.industry} 관련 전문 업무 수행
- 프로젝트 기획 및 실행
- 팀 협업 및 기술 지원

3. 자격 요건
- 학력: ${formData.major} 관련 전공 학사 이상
- 경력: 관련 분야 경력 우대

4. 근로 조건
- 급여: ${formData.salary}
- 근무 시간: ${formData.workHours}`;

    setGeneratedDocs({
      employmentReason,
      jobDescription,
    });
  };

  const handleSaveVersion = () => {
    setDocumentVersions(documentVersions + 1);
  };

  // 다음 단계 진행 가능 여부
  const canProceed = () => {
    return true;
  };

  // 진행률 계산 (4단계 구조)
  const calculateProgress = () => {
    let progress = 0;

    // Step 1: 제출 서류 요건 (25%)
    const foreignerCount = Object.values(foreignerDocs).filter(Boolean).length;
    const companyCount = Object.values(companyDocs).filter(Boolean).length;
    const docProgress = ((foreignerCount + companyCount) / 12) * 25;
    progress += docProgress;

    // Step 2: 제출 서류 확인 (25%)
    if (currentStep > 2) {
      progress += 25;
    } else if (currentStep === 2) {
      progress += 12.5; // 진행 중
    }

    // Step 3: 서류 생성 (25%)
    if (generatedDocs.employmentReason && generatedDocs.jobDescription) {
      progress += 25;
    }

    // Step 4: 최종 출력 (25%)
    if (currentStep === 4) {
      progress += 25;
    }

    return progress;
  };

  // 외국인/사업체 서류 완료 여부
  const foreignerDocsCompleted = Object.values(foreignerDocs).filter(Boolean).length >= 4;
  const companyDocsCompleted = Object.values(companyDocs).filter(Boolean).length >= 5;

  // 4단계 구조
  const steps = [
    {
      number: 1,
      title: "제출 서류 요건",
      completed: currentStep > 1,
      subSteps: [
        { title: "외국인 서류", completed: foreignerDocsCompleted },
        { title: "사업체 서류", completed: companyDocsCompleted },
      ]
    },
    { number: 2, title: "제출 서류 확인", completed: currentStep > 2 },
    { number: 3, title: "서류 생성", completed: currentStep > 3 },
    { number: 4, title: "최종 출력", completed: false },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* 상단 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </button>
      </div>

      <CaseHeaderBar
        foreignerName={formData.foreignerName || "외국인"}
        companyName={formData.companyName || "회사명"}
        visaType={isScenarioMode ? "E-7 변경" : "E-7 (특정활동)"}
        progress={calculateProgress()}
      />

      <div className="flex-1 flex overflow-hidden">
        <StepSidebar
          steps={steps}
          currentStep={currentStep}
          caseMemo={caseMemo}
          onMemoChange={handleMemoChange}
          lastMemoSavedAt={lastMemoSavedAt}
        />

        {currentStep === 1 && (
          <DocumentRequirements
            caseId={caseId || "demo"}
            foreignerDocs={foreignerDocs}
            companyDocs={companyDocs}
            onForeignerFileChange={handleForeignerFileChange}
            onCompanyFileChange={handleCompanyFileChange}
            onSendRequirements={handleSendRequirements}
          />
        )}

        {currentStep === 2 && (
          <DocumentReview
            foreignerDocs={foreignerDocs}
            companyDocs={companyDocs}
            onStatusChange={handleReviewStatusChange}
            scenarioMode={isScenarioMode}
          />
        )}

        {currentStep === 3 && (
          <Step3DocumentGeneration
            formData={formData}
            onFormChange={setFormData}
            documents={generatedDocs}
            onGenerateDocuments={handleGenerateDocuments}
            onSaveVersion={handleSaveVersion}
            versions={documentVersions}
          />
        )}

        {currentStep === 4 && (
          <Step4FinalExport
            foreignerDocs={foreignerDocs}
            companyDocs={companyDocs}
            generatedDocs={generatedDocs}
            onExportAll={() => alert("전체 ZIP 다운로드 준비 중...")}
            onPrintAll={() => alert("서류 일괄 인쇄 준비 중...")}
            onPrintDocumentsOnly={() => alert("생성 문서 인쇄 준비 중...")}
          />
        )}
      </div>

      <NavigationButtons
        currentStep={currentStep}
        totalSteps={4}
        canProceed={canProceed()}
        onPrevious={() => setCurrentStep(Math.max(1, currentStep - 1))}
        onNext={() => {
          if (currentStep === 4) {
            alert("모든 단계가 완료되었습니다!");
          } else if (currentStep === 2) {
            // Step2 → Step3 전환 시 분석 오버레이 표시 (최초 1회만)
            if (!hasShownAnalysis) {
              setShowAnalyzingOverlay(true);
            } else {
              // 이미 분석을 완료한 경우 바로 Step 3으로 이동
              setCurrentStep(3);
            }
          } else {
            setCurrentStep(Math.min(4, currentStep + 1));
          }
        }}
      />

      {/* Step2→Step3 전환 분석 오버레이 (케이스당 최초 1회만 표시) */}
      <AnalyzingOverlay
        isVisible={showAnalyzingOverlay}
        onComplete={() => {
          setShowAnalyzingOverlay(false);
          setHasShownAnalysis(true); // 분석 완료 표시
          setCurrentStep(3);
        }}
      />
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}
