import jsPDF from 'jspdf';

interface GeneratedDocuments {
  employmentReason: string;
  jobDescription: string;
}

// 고용사유서 PDF 생성 (텍스트 기반)
export async function generateEmploymentReasonPDF(
  content: string,
  filename: string = 'employment-reason.pdf'
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // PDF 메타데이터 설정
  pdf.setProperties({
    title: '고용사유서',
    subject: 'E-7 비자 고용사유서',
    author: 'LinkJob Pro',
    creator: 'LinkJob Pro',
  });

  // 기본 폰트 (한글 지원을 위해 별도 폰트 로드 필요)
  // 여기서는 기본 폰트를 사용하고 실제 환경에서는 한글 폰트를 embed 해야 함

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  // 제목
  pdf.setFontSize(16);
  pdf.text('Employment Reason Statement', pageWidth / 2, 30, { align: 'center' });
  pdf.text('(고용사유서)', pageWidth / 2, 38, { align: 'center' });

  // 본문
  pdf.setFontSize(10);

  // 텍스트를 줄 단위로 분할
  const lines = content.split('\n');
  let y = 50;
  const lineHeight = 5;

  for (const line of lines) {
    // 긴 줄은 자동 줄바꿈
    const splitLines = pdf.splitTextToSize(line || ' ', maxWidth);

    for (const splitLine of splitLines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(splitLine, margin, y);
      y += lineHeight;
    }
  }

  // 다운로드
  pdf.save(filename);
}

// 직무기술서 PDF 생성
export async function generateJobDescriptionPDF(
  content: string,
  filename: string = 'job-description.pdf'
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.setProperties({
    title: '직무기술서',
    subject: 'E-7 비자 직무기술서',
    author: 'LinkJob Pro',
    creator: 'LinkJob Pro',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  // 제목
  pdf.setFontSize(16);
  pdf.text('Job Description', pageWidth / 2, 30, { align: 'center' });
  pdf.text('(직무기술서)', pageWidth / 2, 38, { align: 'center' });

  // 본문
  pdf.setFontSize(10);

  const lines = content.split('\n');
  let y = 50;
  const lineHeight = 5;

  for (const line of lines) {
    const splitLines = pdf.splitTextToSize(line || ' ', maxWidth);

    for (const splitLine of splitLines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(splitLine, margin, y);
      y += lineHeight;
    }
  }

  pdf.save(filename);
}

// HTML 요소를 PDF로 변환 (한글 지원)
export async function generatePDFFromHTML(
  elementId: string,
  filename: string = 'document.pdf'
): Promise<void> {
  // html2canvas 동적 임포트
  const html2canvas = (await import('html2canvas')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // HTML을 캔버스로 변환
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  // PDF 생성
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  // 이미지로 PDF에 추가
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // 여러 페이지 처리
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

// 전체 문서 패키지 다운로드
export async function downloadAllDocuments(
  documents: GeneratedDocuments,
  caseName: string
): Promise<void> {
  // 고용사유서 PDF
  await generateEmploymentReasonPDF(
    documents.employmentReason,
    `${caseName}_고용사유서.pdf`
  );

  // 직무기술서 PDF
  await generateJobDescriptionPDF(
    documents.jobDescription,
    `${caseName}_직무기술서.pdf`
  );
}

// 텍스트 파일 다운로드
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
