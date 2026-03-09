export interface DocDefinition {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
}

// 외국인 필수 서류
export const FOREIGNER_REQUIRED_DOCS: DocDefinition[] = [
  { id: "passport", title: "여권 사본", description: "여권 사진면 포함", isRequired: true },
  { id: "arc", title: "외국인등록증 사본", description: "앞뒤면 모두", isRequired: true },
  { id: "photo", title: "증명사진", description: "3.5x4.5cm, 6개월 이내", isRequired: true },
  { id: "diploma", title: "졸업증명서", description: "최종학력 (영문/한글)", isRequired: true },
];

// 외국인 추가 가능 서류
export const FOREIGNER_OPTIONAL_DOCS: DocDefinition[] = [
  { id: "transcript", title: "성적증명서", description: "최종학력 성적증명서", isRequired: false },
  { id: "address", title: "주소 증빙", description: "임대차계약서 또는 기숙사 확인서", isRequired: false },
  { id: "application_form", title: "통합신청서", description: "별지 제34호 서식", isRequired: false },
  { id: "tuberculosis", title: "결핵진단서", description: "3개월 이내 발급", isRequired: false },
  { id: "residence_proof", title: "체류지 입증서류", description: "부동산등기부등본 등", isRequired: false },
  { id: "qualifications", title: "자격요건 입증서류", description: "학위증, 경력증명서 등", isRequired: false },
];

// 외국인 전체 서류 (필수 + 선택 중 기본 포함분)
const FOREIGNER_DEFAULT_OPTIONAL_IDS = ["transcript", "address"] as const;
export const FOREIGNER_DOCS: DocDefinition[] = [
  ...FOREIGNER_REQUIRED_DOCS,
  ...FOREIGNER_OPTIONAL_DOCS.filter(doc => (FOREIGNER_DEFAULT_OPTIONAL_IDS as readonly string[]).includes(doc.id)),
];

// 사업체 필수 서류
export const COMPANY_REQUIRED_DOCS: DocDefinition[] = [
  { id: "business_license", title: "사업자등록증", description: "최신본 사본", isRequired: true },
  { id: "insurance_list", title: "4대보험 가입자 명부", description: "1개월 이내 발급", isRequired: true },
  { id: "sales_proof", title: "매출 증빙", description: "부가세 과세표준증명 등", isRequired: true },
  { id: "office_photos", title: "사업장 사진", description: "근무 공간 전경", isRequired: true },
  { id: "employment_contract", title: "고용계약서", description: "서명 완료본", isRequired: true },
];

// 사업체 추가 가능 서류
export const COMPANY_OPTIONAL_DOCS: DocDefinition[] = [
  { id: "corporate_register", title: "법인등기부등본", description: "법인인 경우, 3개월 이내", isRequired: false },
  { id: "tax_payment", title: "납부내역증명", description: "납세사실증명 또는 재무제표", isRequired: false },
  { id: "national_tax", title: "국세 납세증명서", description: "세금체납 여부 확인", isRequired: false },
  { id: "local_tax", title: "지방세 납세증명서", description: "지방세 납세증명", isRequired: false },
  { id: "employment_recommendation", title: "고용필요성 입증서류", description: "고용추천서 등", isRequired: false },
  { id: "insurance_acquisition", title: "고용보험 취득내역", description: "사업장용", isRequired: false },
];

// 사업체 전체 서류 (필수 + 선택 중 기본 포함분)
const COMPANY_DEFAULT_OPTIONAL_IDS = ["corporate_register"] as const;
export const COMPANY_DOCS: DocDefinition[] = [
  ...COMPANY_REQUIRED_DOCS,
  ...COMPANY_OPTIONAL_DOCS.filter(doc => (COMPANY_DEFAULT_OPTIONAL_IDS as readonly string[]).includes(doc.id)),
];
