'use client';

import { useMemo } from 'react';
import { ExtendedCase, StepActivationState, CaseStep } from '@/lib/types';

interface UploadStatus {
  foreignerCount: number;
  foreignerTotal: number;
  foreignerSubmitted: boolean;
  companyCount: number;
  companyTotal: number;
  companySubmitted: boolean;
  bothSubmitted: boolean;
  canProceedToStep3: boolean;
  stepActivation: StepActivationState;
}

export function useUploadStatus(caseData: ExtendedCase | null): UploadStatus {
  return useMemo(() => {
    if (!caseData) {
      return {
        foreignerCount: 0,
        foreignerTotal: 6,
        foreignerSubmitted: false,
        companyCount: 0,
        companyTotal: 6,
        companySubmitted: false,
        bothSubmitted: false,
        canProceedToStep3: false,
        stepActivation: {
          step1: true,
          step2: true,
          step3: false,
          step4: false,
          recommendedStep: 1,
        },
      };
    }

    const foreignerCount = Object.keys(caseData.foreignerDocs || {}).length;
    const companyCount = Object.keys(caseData.companyDocs || {}).length;
    const foreignerSubmitted = caseData.foreignerSubmission?.isSubmitted || false;
    const companySubmitted = caseData.companySubmission?.isSubmitted || false;
    const bothSubmitted = foreignerSubmitted && companySubmitted;

    // 최소 4개 외국인 서류 + 5개 기업 서류가 있으면 3단계 진행 가능
    const hasSufficientDocs = foreignerCount >= 4 && companyCount >= 5;
    const canProceedToStep3 = bothSubmitted || hasSufficientDocs;

    // 문서 생성 완료 여부
    const hasGeneratedDocs = !!caseData.generatedDocs?.employmentReason;

    // 단계 활성화 상태 계산
    let recommendedStep: CaseStep | null = null;

    // 아직 서류 수집 중이면 1단계 또는 2단계 권장
    if (!foreignerSubmitted && foreignerCount < 4) {
      recommendedStep = 1;
    } else if (!companySubmitted && companyCount < 5) {
      recommendedStep = 2;
    } else if (canProceedToStep3 && !hasGeneratedDocs) {
      recommendedStep = 3;
    } else if (hasGeneratedDocs) {
      recommendedStep = 4;
    }

    const stepActivation: StepActivationState = {
      step1: true, // 항상 활성화
      step2: true, // 항상 활성화
      step3: canProceedToStep3,
      step4: hasGeneratedDocs,
      recommendedStep,
    };

    return {
      foreignerCount,
      foreignerTotal: 6,
      foreignerSubmitted,
      companyCount,
      companyTotal: 6,
      companySubmitted,
      bothSubmitted,
      canProceedToStep3,
      stepActivation,
    };
  }, [caseData]);
}
