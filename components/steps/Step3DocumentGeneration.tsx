"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
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

interface Step3Props {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  documents: { employmentReason: string; jobDescription: string };
  onGenerateDocuments: () => void;
  onSaveVersion: () => void;
  versions: number;
}

// 생성 중 로딩 문구
const generatingMessages = [
  "고용 필요성 논리를 정리 중이에요...",
  "문장 구조를 심사 기준에 맞게 다듬는 중이에요...",
  "마지막 문장 점검 중... 거의 완료!",
];

export function Step3DocumentGeneration({
  formData,
  onFormChange,
  documents,
  onGenerateDocuments,
  onSaveVersion,
  versions,
}: Step3Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessageIndex, setGeneratingMessageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  // 필수 필드 체크
  const requiredFields = {
    companyName: "회사명",
    industry: "업종",
    jobTitle: "직무명",
    jobSummary: "주요 업무",
    hiringReason: "채용이 필요한 이유",
    salary: "급여",
    foreignerName: "외국인 이름",
    nationality: "국적",
    major: "전공",
  };

  const emptyRequiredFields = Object.entries(requiredFields)
    .filter(([key]) => !formData[key as keyof FormData])
    .map(([, label]) => label);

  const isFormComplete = emptyRequiredFields.length === 0;

  const hasGeneratedDocs = !!(documents.employmentReason && documents.jobDescription);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowPreview(false);
    setGeneratingMessageIndex(0);

    // 문구 순차 변경
    const messageInterval = setInterval(() => {
      setGeneratingMessageIndex((prev) => {
        if (prev < generatingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // 4.5초 후 완료
    await new Promise((resolve) => setTimeout(resolve, 4500));

    clearInterval(messageInterval);
    onGenerateDocuments();
    setIsGenerating(false);
    setShowPreview(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI 고용사유서 자동 생성
          </h1>
          {/* 새로운 서브 문구 (직접 입력 유도) */}
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              전문가 수준의 고용 사유서를 생성하기 위해
              <br />
              <span className="font-semibold text-blue-600">아래 정보를 직접 입력해주세요.</span>
            </p>
            <p className="mt-2 text-gray-600">
              입력하신 내용을 바탕으로 <span className="font-semibold">'고용 사유서 자동 생성하기'</span> 버튼을 누르면 초안이 생성됩니다.
            </p>
            {/* 보조 문구 */}
            <p className="mt-3 text-sm text-gray-500 bg-gray-100 inline-block px-4 py-2 rounded-lg">
              서류는 이미 업로드 완료되었습니다. 이 단계에서는 핵심 정보만 정확히 입력해주시면 됩니다.
            </p>
          </div>
        </div>

        {!hasGeneratedDocs ? (
          // 입력 폼 (생성 전)
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 mb-6">
              <div className="space-y-6">
                {/* 회사 정보 */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">1</span>
                    회사 정보
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-base">회사명 *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        placeholder="예: (주)테크놀로지"
                        className={cn(
                          "mt-2 h-12 text-base",
                          !formData.companyName && "border-gray-300"
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-base">업종 *</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                        placeholder="예: AI 소프트웨어 개발"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* 채용 직무 */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">2</span>
                    채용 직무
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jobTitle" className="text-base">직무명 *</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange("jobTitle", e.target.value)}
                        placeholder="예: AI 백엔드 개발자"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobSummary" className="text-base">주요 업무 (2~3줄) *</Label>
                      <Textarea
                        id="jobSummary"
                        value={formData.jobSummary}
                        onChange={(e) => handleChange("jobSummary", e.target.value)}
                        placeholder="예: AI 기반 플랫폼의 백엔드 API 설계 및 개발, 데이터베이스 최적화, 서버 인프라 구축 등"
                        className="mt-2 text-base"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hiringReason" className="text-base">채용이 필요한 이유 *</Label>
                      <Textarea
                        id="hiringReason"
                        value={formData.hiringReason}
                        onChange={(e) => handleChange("hiringReason", e.target.value)}
                        placeholder="예: 신규 AI 프로젝트 확대로 인한 전문 개발 인력 필요"
                        className="mt-2 text-base"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* 외국인 정보 */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">3</span>
                    외국인 정보
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="foreignerName" className="text-base">이름 *</Label>
                      <Input
                        id="foreignerName"
                        value={formData.foreignerName}
                        onChange={(e) => handleChange("foreignerName", e.target.value)}
                        placeholder="예: John Doe"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality" className="text-base">국적 *</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleChange("nationality", e.target.value)}
                        placeholder="예: 미국"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="major" className="text-base">전공 *</Label>
                      <Input
                        id="major"
                        value={formData.major}
                        onChange={(e) => handleChange("major", e.target.value)}
                        placeholder="예: 컴퓨터공학"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* 근로 조건 */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">4</span>
                    근로 조건
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="salary" className="text-base">급여 *</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleChange("salary", e.target.value)}
                        placeholder="예: 연봉 4,000만원"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workHours" className="text-base">근무시간</Label>
                      <Input
                        id="workHours"
                        value={formData.workHours}
                        onChange={(e) => handleChange("workHours", e.target.value)}
                        placeholder="예: 주 40시간"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dormitory" className="text-base">기숙사 제공 여부</Label>
                      <Input
                        id="dormitory"
                        value={formData.dormitory}
                        onChange={(e) => handleChange("dormitory", e.target.value)}
                        placeholder="예: 미제공"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 미입력 필수 항목 안내 */}
            {!isFormComplete && emptyRequiredFields.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      다음 필수 항목을 입력해주세요:
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {emptyRequiredFields.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 버튼 위 경고 문구 */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 bg-gray-100 inline-block px-4 py-2 rounded-lg">
                <span className="text-orange-600 font-medium">링크 비자가 실수할 수 있으니</span>, 다시 한 번만 더 정확히 확인해주세요.
              </p>
            </div>

            {/* 생성 버튼 */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!isFormComplete || isGenerating}
                className={cn(
                  "h-16 px-12 text-lg font-bold rounded-xl shadow-xl transition-all",
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                  "disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    {generatingMessages[generatingMessageIndex]}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    고용 사유서 자동 생성하기
                  </>
                )}
              </Button>
              {!isFormComplete && (
                <p className="mt-3 text-sm text-red-600">
                  * 필수 항목을 모두 입력해주세요
                </p>
              )}
            </div>
          </div>
        ) : (
          // 생성된 문서 미리보기 (생성 후)
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      고용사유서 초안 생성 완료!
                    </h2>
                    <p className="text-gray-600">
                      아래 내용을 확인하고 필요시 수정하세요
                    </p>
                  </div>
                </div>
                <Button onClick={onSaveVersion} variant="outline">
                  버전 {versions} 저장
                </Button>
              </div>

              {/* 탭 */}
              <div className="flex gap-2 mb-6">
                <button className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold">
                  고용사유서
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200">
                  직무기술서
                </button>
              </div>

              {/* 문서 내용 */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <Textarea
                  value={documents.employmentReason}
                  onChange={(e) => {
                    onFormChange({ ...formData });
                  }}
                  className="min-h-[600px] font-mono text-sm bg-white"
                />
              </div>
            </div>

            {/* 다음 단계 안내 */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                문서 확인이 완료되었다면 <span className="font-semibold">다음 단계로</span> 버튼을 클릭해주세요.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setShowPreview(false);
                }}
                variant="outline"
                className="h-12 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                다시 생성하기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
