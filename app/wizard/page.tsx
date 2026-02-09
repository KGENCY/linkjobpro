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

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 외국인 서류
  const [foreignerDocs, setForeignerDocs] = useState<
    Record<string, UploadedFile | null>
  >({
    passport: null,
    arc: null,
    photo: null,
    diploma: null,
    transcript: null,
    address: null,
  });

  // 사업체 서류
  const [companyDocs, setCompanyDocs] = useState<
    Record<string, UploadedFile | null>
  >({
    business_license: null,
    corporate_register: null,
    insurance_list: null,
    sales_proof: null,
    office_photos: null,
    employment_contract: null,
  });

  // 생성 문서 폼 데이터
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    address: "",
    jobTitle: "",
    jobSummary: "",
    hiringReason: "",
    salary: "",
    workHours: "",
    dormitory: "",
    foreignerName: "김철수",
    nationality: "",
    major: "",
  });

  // 생성된 문서
  const [generatedDocs, setGeneratedDocs] = useState({
    employmentReason: "",
    jobDescription: "",
  });

  const [documentVersions, setDocumentVersions] = useState(1);

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
    status: "submitted" | "confirmed" | "revision_requested",
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
        visaType="E-7 (특정활동)"
        progress={calculateProgress()}
      />

      <div className="flex-1 flex overflow-hidden">
        <StepSidebar steps={steps} currentStep={currentStep} />

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
            // Step2 → Step3 전환 시 분석 오버레이 표시
            setShowAnalyzingOverlay(true);
          } else {
            setCurrentStep(Math.min(4, currentStep + 1));
          }
        }}
      />

      {/* Step2→Step3 전환 분석 오버레이 */}
      <AnalyzingOverlay
        isVisible={showAnalyzingOverlay}
        onComplete={() => {
          setShowAnalyzingOverlay(false);
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
