"use client";

import { useState } from "react";
import { Upload, X, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface DocumentDropCardProps {
  title: string;
  description: string;
  required?: boolean;
  file: UploadedFile | null;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
}

export function DocumentDropCard({
  title,
  description,
  required = true,
  file,
  onFileUpload,
  onFileRemove,
}: DocumentDropCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileUpload(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {!required && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                선택 제출
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {!file ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="cursor-pointer block text-center">
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <div className="text-sm text-gray-600">
                여기로 파일을 끌어놓으세요
              </div>
              <div className="text-xs text-gray-500 mt-1">
                또는 클릭하여 파일 선택
              </div>
            </label>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {file.uploadedAt}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFileRemove}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}