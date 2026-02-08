"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { CaseHeaderBar } from "@/components/wizard/CaseHeaderBar";
import { NavigationButtons } from "@/components/wizard/NavigationButtons";
import { Step1ForeignerDocuments } from "@/components/steps/Step1ForeignerDocuments";
import { Step2CompanyDocuments } from "@/components/steps/Step2CompanyDocuments";
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

  // 파일 업로드 핸들러
  const handleForeignerFileUpload = (docId: string, file: File) => {
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
  };

  const handleForeignerFileRemove = (docId: string) => {
    setForeignerDocs({
      ...foreignerDocs,
      [docId]: null,
    });
  };

  const handleCompanyFileUpload = (docId: string, file: File) => {
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
  };

  const handleCompanyFileRemove = (docId: string) => {
    setCompanyDocs({
      ...companyDocs,
      [docId]: null,
    });
  };

  // 문서 생성
  const handleGenerateDocuments = () => {
    const employmentReason = `3. 고용사유 및 인력활용계획

1) 고용사유
(※ 외국인력 도입 업무와 관련한 전문인력부족 현황, 국내인력 채용노력 및 인력을 충당하지 못한 사유, 전문외국인력의 기술과 담당할 업무의 연관성 등을 중심으로)

당사 ${formData.companyName}은 ${formData.industry} 분야의 전문기업으로, 최근 ${formData.hiringReason}에 따라 전문 인력이 절실히 필요한 상황입니다.

${formData.jobTitle} 직무는 ${formData.jobSummary} 등의 고도의 전문 업무를 수행해야 하며, 이를 위해서는 관련 분야의 깊은 이해와 실무 경험이 필수적입니다.

국내 인력 채용을 위해 구인공고 게재 및 헤드헌팅 등 다각도로 노력하였으나, ${formData.industry} 분야의 전문 인력 부족으로 인해 적합한 인재를 확보하지 못하였습니다. 특히 ${formData.jobTitle} 직무는 전문성과 실무 경험을 동시에 요구하는 업무로, 국내 인력만으로는 인력 수급이 어려운 실정입니다.

채용 예정인 ${formData.foreignerName}님은 ${formData.major} 전공자로서 관련 분야에 대한 전문 지식과 기술을 보유하고 있으며, 당사가 요구하는 ${formData.jobTitle} 직무를 수행하기에 적합한 인재입니다. 특히 ${formData.major} 전공 배경은 ${formData.jobSummary}를 수행하는 데 필수적인 역량이며, 이는 국내 인력으로는 대체가 어려운 전문 기술과 경험입니다.


2) 기술도입 및 전문외국인력교류 효과
(※ 도입기술 분야, 기술 내용, 최소성, 전문성, 필요성, 원천기술 효과 등 포함)

${formData.foreignerName}님의 채용을 통해 당사는 ${formData.industry} 분야의 최신 기술과 노하우를 습득할 수 있으며, 이는 당사의 기술 경쟁력 강화에 크게 기여할 것으로 기대됩니다.

특히 ${formData.major} 분야의 전문 지식을 바탕으로 한 ${formData.jobSummary} 업무 수행은 당사 직원들에게 선진 기술과 업무 방식을 전수하는 계기가 될 것이며, 이를 통해 조직 전체의 역량 향상을 도모할 수 있습니다.

또한 국제적인 업무 경험과 다양한 관점을 가진 전문 인력의 유입은 당사의 글로벌 경쟁력을 높이고, 향후 해외 시장 진출 및 국제 협업에도 긍정적인 영향을 미칠 것으로 예상됩니다.


3) 활용계획

${formData.foreignerName}님은 ${formData.jobTitle}로서 다음과 같은 업무를 담당할 예정입니다:

${formData.jobSummary}

이를 통해 당사의 ${formData.industry} 사업 부문을 강화하고, 중장기적으로는 관련 분야의 기술 자립도를 높여 경쟁력 있는 제품과 서비스를 개발할 계획입니다.

또한 사내 직원들과의 협업을 통해 전문 기술과 노하우를 공유하고, 정기적인 기술 세미나 및 워크샵을 통해 조직 전체의 역량을 향상시킬 예정입니다.


4) 기타사항

근로 조건:
- 급여: ${formData.salary}
- 근무 시간: ${formData.workHours || '주 40시간 (09:00-18:00)'}
- 기숙사: ${formData.dormitory || '미제공'}

당사는 외국인 전문 인력이 안정적으로 근무할 수 있도록 적정 수준의 처우를 제공하며, 관련 법규를 준수하여 고용 관계를 유지할 것을 약속드립니다.

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
- 품질 관리 및 개선

3. 자격 요건
- 학력: ${formData.major} 관련 전공 학사 이상
- 경력: 관련 분야 경력 우대
- 전문성: 해당 분야 전문 지식 및 기술 보유

4. 우대 사항
- ${formData.major} 전공자
- 관련 자격증 보유자
- 프로젝트 경험 보유자

5. 근로 조건
- 급여: ${formData.salary}
- 근무 시간: ${formData.workHours}
- 복리후생: ${formData.dormitory}

6. 기타 사항
본 직무는 전문 지식과 기술을 요하는 업무로, 단순 노무 업무가 아닌 전문 인력이 필요한 직무입니다.`;

    setGeneratedDocs({
      employmentReason,
      jobDescription,
    });
  };

  const handleSaveVersion = () => {
    setDocumentVersions(documentVersions + 1);
  };

  // 다음 단계 진행 가능 여부 - 검증 제거, 항상 진행 가능
  const canProceed = () => {
    return true;
  };

  // 진행률 계산
  const calculateProgress = () => {
    let progress = 0;

    // Step 1: 25%
    const foreignerProgress = (Object.values(foreignerDocs).filter(Boolean).length / 6) * 25;
    progress += foreignerProgress;

    // Step 2: 25%
    const companyProgress = (Object.values(companyDocs).filter(Boolean).length / 6) * 25;
    progress += companyProgress;

    // Step 3: 25%
    if (generatedDocs.employmentReason && generatedDocs.jobDescription) {
      progress += 25;
    }

    // Step 4: 25%
    if (currentStep === 4) {
      progress += 25;
    }

    return progress;
  };

  const steps = [
    { number: 1, title: "외국인 서류 받기", completed: currentStep > 1 },
    { number: 2, title: "사업체 서류 받기", completed: currentStep > 2 },
    { number: 3, title: "서류 생성", completed: currentStep > 3 },
    { number: 4, title: "최종 출력", completed: currentStep > 4 },
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
          <Step1ForeignerDocuments
            caseId={caseId || "demo"}
            documents={foreignerDocs}
            onFileUpload={handleForeignerFileUpload}
            onFileRemove={handleForeignerFileRemove}
          />
        )}

        {currentStep === 2 && (
          <Step2CompanyDocuments
            caseId={caseId || "demo"}
            documents={companyDocs}
            onFileUpload={handleCompanyFileUpload}
            onFileRemove={handleCompanyFileRemove}
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