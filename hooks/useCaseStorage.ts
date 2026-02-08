'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExtendedCase, ForeignerDocType, CompanyDocType, DocumentFormData, GeneratedDocuments } from '@/lib/types';
import {
  loadAllCases,
  getCaseById,
  createCase as createCaseStorage,
  updateCase as updateCaseStorage,
  deleteCase as deleteCaseStorage,
  saveDocument,
  removeDocument,
  submitDocuments,
  getCaseByToken,
} from '@/lib/storage';
import { TokenType } from '@/lib/token';

export function useCaseStorage() {
  const [cases, setCases] = useState<ExtendedCase[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    setCases(loadAllCases());
    setLoading(false);
  }, []);

  // 케이스 생성
  const createCase = useCallback((
    foreignerName: string,
    companyName: string,
    visaType: string
  ): ExtendedCase => {
    const newCase = createCaseStorage(foreignerName, companyName, visaType);
    setCases(prev => [...prev, newCase]);
    return newCase;
  }, []);

  // 케이스 업데이트
  const updateCase = useCallback((caseId: string, updates: Partial<ExtendedCase>) => {
    const updatedCase = updateCaseStorage(caseId, updates);
    if (updatedCase) {
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    }
    return updatedCase;
  }, []);

  // 케이스 삭제
  const deleteCase = useCallback((caseId: string) => {
    const success = deleteCaseStorage(caseId);
    if (success) {
      setCases(prev => prev.filter(c => c.id !== caseId));
    }
    return success;
  }, []);

  // 케이스 새로고침
  const refreshCases = useCallback(() => {
    setCases(loadAllCases());
  }, []);

  return {
    cases,
    loading,
    createCase,
    updateCase,
    deleteCase,
    refreshCases,
    getCaseById,
    getCaseByToken,
  };
}

// 개별 케이스용 훅
export function useSingleCase(caseId: string | null) {
  const [caseData, setCaseData] = useState<ExtendedCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      const data = getCaseById(caseId);
      setCaseData(data);
    }
    setLoading(false);
  }, [caseId]);

  // 케이스 업데이트
  const updateCase = useCallback((updates: Partial<ExtendedCase>) => {
    if (!caseId) return null;
    const updatedCase = updateCaseStorage(caseId, updates);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseId]);

  // 문서 업로드
  const uploadDocument = useCallback(async (
    docType: ForeignerDocType | CompanyDocType,
    file: File,
    isForeigner: boolean
  ) => {
    if (!caseId) return null;
    const updatedCase = await saveDocument(caseId, docType, file, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseId]);

  // 문서 삭제
  const deleteDocument = useCallback((
    docType: ForeignerDocType | CompanyDocType,
    isForeigner: boolean
  ) => {
    if (!caseId) return null;
    const updatedCase = removeDocument(caseId, docType, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseId]);

  // 서류 제출
  const submit = useCallback((isForeigner: boolean) => {
    if (!caseId) return null;
    const updatedCase = submitDocuments(caseId, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseId]);

  // 폼 데이터 저장
  const saveFormData = useCallback((formData: DocumentFormData) => {
    return updateCase({ formData });
  }, [updateCase]);

  // 생성된 문서 저장
  const saveGeneratedDocs = useCallback((docs: GeneratedDocuments) => {
    return updateCase({ generatedDocs: docs });
  }, [updateCase]);

  // 새로고침
  const refresh = useCallback(() => {
    if (caseId) {
      const data = getCaseById(caseId);
      setCaseData(data);
    }
  }, [caseId]);

  return {
    caseData,
    loading,
    updateCase,
    uploadDocument,
    deleteDocument,
    submit,
    saveFormData,
    saveGeneratedDocs,
    refresh,
  };
}

// 토큰 기반 케이스 훅
export function useCaseByToken(token: string | null, type: TokenType) {
  const [caseData, setCaseData] = useState<ExtendedCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const data = getCaseByToken(token, type);
      if (data) {
        setCaseData(data);
        setError(null);
      } else {
        setError('유효하지 않은 링크입니다.');
      }
    }
    setLoading(false);
  }, [token, type]);

  // 문서 업로드
  const uploadDocument = useCallback(async (
    docType: ForeignerDocType | CompanyDocType,
    file: File
  ) => {
    if (!caseData) return null;
    const isForeigner = type === 'foreigner';
    const updatedCase = await saveDocument(caseData.id, docType, file, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseData, type]);

  // 문서 삭제
  const deleteDocument = useCallback((docType: ForeignerDocType | CompanyDocType) => {
    if (!caseData) return null;
    const isForeigner = type === 'foreigner';
    const updatedCase = removeDocument(caseData.id, docType, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseData, type]);

  // 서류 제출
  const submit = useCallback(() => {
    if (!caseData) return null;
    const isForeigner = type === 'foreigner';
    const updatedCase = submitDocuments(caseData.id, isForeigner);
    if (updatedCase) {
      setCaseData(updatedCase);
    }
    return updatedCase;
  }, [caseData, type]);

  // 새로고침
  const refresh = useCallback(() => {
    if (token) {
      const data = getCaseByToken(token, type);
      if (data) {
        setCaseData(data);
      }
    }
  }, [token, type]);

  return {
    caseData,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    submit,
    refresh,
  };
}
