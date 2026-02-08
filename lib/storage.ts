import { ExtendedCase, ForeignerDocType, CompanyDocType, DocumentFile } from './types';
import { generateToken, getTokenMappingKey, TokenType } from './token';

const CASES_KEY = 'linkjob_cases';
const TOKEN_PREFIX = 'linkjob_token_';

// 모든 케이스 로드
export function loadAllCases(): ExtendedCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CASES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load cases:', e);
    return [];
  }
}

// 모든 케이스 저장
export function saveAllCases(cases: ExtendedCase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save cases:', e);
  }
}

// 케이스 ID로 조회
export function getCaseById(caseId: string): ExtendedCase | null {
  const cases = loadAllCases();
  return cases.find(c => c.id === caseId) || null;
}

// 토큰으로 케이스 ID 조회
export function getCaseIdByToken(token: string, type: TokenType): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `${TOKEN_PREFIX}${type}_${token}`;
    return localStorage.getItem(key);
  } catch (e) {
    console.error('Failed to get case by token:', e);
    return null;
  }
}

// 토큰-케이스 매핑 저장
export function saveTokenMapping(token: string, type: TokenType, caseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${TOKEN_PREFIX}${type}_${token}`;
    localStorage.setItem(key, caseId);
  } catch (e) {
    console.error('Failed to save token mapping:', e);
  }
}

// 새 케이스 생성
export function createCase(
  foreignerName: string,
  companyName: string,
  visaType: string
): ExtendedCase {
  const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const foreignerToken = generateToken();
  const companyToken = generateToken();
  const now = new Date().toISOString();

  const newCase: ExtendedCase = {
    id,
    foreignerName,
    companyName,
    visaType,
    status: 'collecting',
    currentStep: 1,
    stepProgress: '외국인 서류 0/6',
    createdAt: now,
    lastUpdated: now,
    tokens: {
      foreignerToken,
      companyToken,
    },
    foreignerSubmission: {
      isSubmitted: false,
      submittedAt: undefined,
    },
    companySubmission: {
      isSubmitted: false,
      submittedAt: undefined,
    },
    foreignerDocs: {},
    companyDocs: {},
  };

  // 케이스 저장
  const cases = loadAllCases();
  cases.push(newCase);
  saveAllCases(cases);

  // 토큰 매핑 저장
  saveTokenMapping(foreignerToken, 'foreigner', id);
  saveTokenMapping(companyToken, 'company', id);

  return newCase;
}

// 케이스 업데이트
export function updateCase(caseId: string, updates: Partial<ExtendedCase>): ExtendedCase | null {
  const cases = loadAllCases();
  const index = cases.findIndex(c => c.id === caseId);

  if (index === -1) return null;

  const updatedCase = {
    ...cases[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  cases[index] = updatedCase;
  saveAllCases(cases);

  return updatedCase;
}

// 케이스 삭제
export function deleteCase(caseId: string): boolean {
  if (typeof window === 'undefined') return false;

  const cases = loadAllCases();
  const caseToDelete = cases.find(c => c.id === caseId);

  if (!caseToDelete) return false;

  // 토큰 매핑 삭제
  if (caseToDelete.tokens) {
    try {
      localStorage.removeItem(`${TOKEN_PREFIX}foreigner_${caseToDelete.tokens.foreignerToken}`);
      localStorage.removeItem(`${TOKEN_PREFIX}company_${caseToDelete.tokens.companyToken}`);
    } catch (e) {
      console.error('Failed to remove token mappings:', e);
    }
  }

  const filteredCases = cases.filter(c => c.id !== caseId);
  saveAllCases(filteredCases);

  return true;
}

// 문서 저장 (Base64)
export function saveDocument(
  caseId: string,
  docType: ForeignerDocType | CompanyDocType,
  file: File,
  isForeigner: boolean
): Promise<ExtendedCase | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64Data = reader.result as string;
      const documentFile: DocumentFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64Data,
        uploadedAt: new Date().toISOString(),
      };

      const caseData = getCaseById(caseId);
      if (!caseData) {
        resolve(null);
        return;
      }

      const updates: Partial<ExtendedCase> = {};

      if (isForeigner) {
        updates.foreignerDocs = {
          ...caseData.foreignerDocs,
          [docType]: documentFile,
        };
        // 진행 상황 업데이트
        const docCount = Object.keys(updates.foreignerDocs).length;
        updates.stepProgress = `외국인 서류 ${docCount}/6`;
      } else {
        updates.companyDocs = {
          ...caseData.companyDocs,
          [docType]: documentFile,
        };
      }

      const updatedCase = updateCase(caseId, updates);
      resolve(updatedCase);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// 문서 삭제
export function removeDocument(
  caseId: string,
  docType: ForeignerDocType | CompanyDocType,
  isForeigner: boolean
): ExtendedCase | null {
  const caseData = getCaseById(caseId);
  if (!caseData) return null;

  const updates: Partial<ExtendedCase> = {};

  if (isForeigner) {
    const newDocs = { ...caseData.foreignerDocs };
    delete newDocs[docType as ForeignerDocType];
    updates.foreignerDocs = newDocs;
    // 진행 상황 업데이트
    const docCount = Object.keys(newDocs).length;
    updates.stepProgress = `외국인 서류 ${docCount}/6`;
  } else {
    const newDocs = { ...caseData.companyDocs };
    delete newDocs[docType as CompanyDocType];
    updates.companyDocs = newDocs;
  }

  return updateCase(caseId, updates);
}

// 제출 상태 업데이트
export function submitDocuments(
  caseId: string,
  isForeigner: boolean
): ExtendedCase | null {
  const updates: Partial<ExtendedCase> = {};
  const now = new Date().toISOString();

  if (isForeigner) {
    updates.foreignerSubmission = {
      isSubmitted: true,
      submittedAt: now,
    };
  } else {
    updates.companySubmission = {
      isSubmitted: true,
      submittedAt: now,
    };
  }

  return updateCase(caseId, updates);
}

// 토큰으로 케이스 조회
export function getCaseByToken(token: string, type: TokenType): ExtendedCase | null {
  const caseId = getCaseIdByToken(token, type);
  if (!caseId) return null;
  return getCaseById(caseId);
}
