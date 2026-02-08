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
  disabled?: boolean;
}

export function DocumentDropCard({
  title,
  description,
  required = true,
  file,
  onFileUpload,
  onFileRemove,
  disabled = false,
}: DocumentDropCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileUpload(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
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
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : isDragging
                  ? "border-blue-500 bg-blue-50 cursor-pointer"
                  : "border-gray-300 hover:border-gray-400 cursor-pointer"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className={cn("block text-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={disabled}
              />
              <Upload className={cn("w-10 h-10 mx-auto mb-3", disabled ? "text-gray-300" : "text-gray-400")} />
              <div className={cn("text-sm", disabled ? "text-gray-400" : "text-gray-600")}>
                여기로 파일을 끌어놓으세요
              </div>
              <div className={cn("text-xs mt-1", disabled ? "text-gray-300" : "text-gray-500")}>
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
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}