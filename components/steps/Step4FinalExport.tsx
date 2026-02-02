"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileArchive, Printer, CheckCircle2, Circle } from "lucide-react";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface Step4Props {
  foreignerDocs: Record<string, UploadedFile | null>;
  companyDocs: Record<string, UploadedFile | null>;
  generatedDocs: { employmentReason: string; jobDescription: string };
  onExportAll: () => void;
  onPrintAll: () => void;
  onPrintDocumentsOnly: () => void;
}

export function Step4FinalExport({
  foreignerDocs,
  companyDocs,
  generatedDocs,
  onExportAll,
  onPrintAll,
  onPrintDocumentsOnly,
}: Step4Props) {
  const [isExporting, setIsExporting] = useState(false);

  const foreignerDocsCount = Object.values(foreignerDocs).filter(Boolean).length;
  const companyDocsCount = Object.values(companyDocs).filter(Boolean).length;
  const hasGeneratedDocs = !!(generatedDocs.employmentReason && generatedDocs.jobDescription);

  const isAllComplete = foreignerDocsCount >= 4 && companyDocsCount >= 5 && hasGeneratedDocs;

  const handleExport = async (action: () => void) => {
    setIsExporting(true);
    // 더미 로딩
    await new Promise((resolve) => setTimeout(resolve, 1500));
    action();
    setIsExporting(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            최종 출력 및 제출
          </h1>
          <p className="text-gray-600">
            모든 서류가 준비되었습니다. 이제 출력만 하면 끝입니다.
          </p>
        </div>

        {isAllComplete && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-lg font-semibold text-green-900">
                  업무 준비 완료
                </div>
                <div className="text-sm text-green-700 mt-1">
                  이 케이스는 출력만 남았습니다. 아래 버튼을 눌러 파일을 다운로드하거나
                  인쇄하세요.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 완료 체크 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                외국인 서류
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {foreignerDocsCount >= 4 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {foreignerDocsCount}/6
                  </div>
                  <div className="text-xs text-gray-500">완료</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                사업체 서류
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {companyDocsCount >= 5 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {companyDocsCount}/6
                  </div>
                  <div className="text-xs text-gray-500">완료</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                생성 문서
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {hasGeneratedDocs ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {hasGeneratedDocs ? "2/2" : "0/2"}
                  </div>
                  <div className="text-xs text-gray-500">완료</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 출력 버튼 */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            출력 옵션
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileArchive className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">
                        전체 ZIP 다운로드
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      모든 서류와 생성된 문서를 하나의 ZIP 파일로 다운로드합니다.
                      파일명은 자동으로 정리됩니다.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => handleExport(onExportAll)}
                    disabled={!isAllComplete || isExporting}
                    className="ml-4"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    다운로드
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Printer className="w-5 h-5 text-gray-700" />
                      <h3 className="text-base font-semibold text-gray-900">
                        서류 일괄 PDF로 인쇄
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      업로드한 모든 서류를 하나의 PDF로 병합하여 인쇄합니다.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleExport(onPrintAll)}
                    disabled={!isAllComplete || isExporting}
                    className="ml-4"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    인쇄
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Printer className="w-5 h-5 text-gray-700" />
                      <h3 className="text-base font-semibold text-gray-900">
                        생성 문서만 인쇄
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      고용사유서와 직무기술서만 인쇄합니다.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleExport(onPrintDocumentsOnly)}
                    disabled={!hasGeneratedDocs || isExporting}
                    className="ml-4"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    인쇄
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                안내사항
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 출입국 제출용 파일명은 자동으로 정리됩니다</li>
                <li>• ZIP 파일에는 모든 서류가 카테고리별로 정리되어 있습니다</li>
                <li>• 인쇄 시 고화질 PDF로 변환됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {isExporting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-lg font-semibold text-gray-900">
                  준비 중입니다...
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  파일을 정리하고 있습니다
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}