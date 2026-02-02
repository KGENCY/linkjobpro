"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCase: (data: {
    foreignerName: string;
    companyName: string;
    visaType: string;
  }) => void;
}

export function CreateCaseDialog({
  open,
  onOpenChange,
  onCreateCase,
}: CreateCaseDialogProps) {
  const [foreignerName, setForeignerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [visaType, setVisaType] = useState("E-7 변경");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foreignerName.trim() || !companyName.trim()) {
      return;
    }

    onCreateCase({
      foreignerName: foreignerName.trim(),
      companyName: companyName.trim(),
      visaType,
    });

    // Reset form
    setForeignerName("");
    setCompanyName("");
    setVisaType("E-7 변경");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>새 케이스 만들기</DialogTitle>
          <DialogDescription>
            외국인과 회사 정보를 입력하여 새 케이스를 시작하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="foreignerName">외국인 이름</Label>
            <Input
              id="foreignerName"
              value={foreignerName}
              onChange={(e) => setForeignerName(e.target.value)}
              placeholder="예: Nguyen Van A"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="companyName">회사명</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="예: ABC 제조"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="visaType">신청 유형</Label>
            <select
              id="visaType"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="E-7 신규">E-7 신규</option>
              <option value="E-7 변경">E-7 변경</option>
              <option value="E-7 연장">E-7 연장</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" className="flex-1">
              케이스 생성
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}