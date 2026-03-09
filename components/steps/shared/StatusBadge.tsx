import {
  Circle, Clock, CheckCircle2, FileX, FileText,
  AlertTriangle, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocStatus } from "@/lib/types";

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; icon: React.ElementType }> = {
  not_submitted: { label: "미제출", color: "bg-gray-100 text-gray-500", icon: FileX },
  submitted: { label: "제출 완료", color: "bg-blue-100 text-blue-700", icon: FileText },
  confirmed: { label: "확인 완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  revision_requested: { label: "보완 요청", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  resubmitted: { label: "재제출 완료", color: "bg-indigo-100 text-indigo-700", icon: RotateCcw },
};

// Step1 uses a simpler 3-state subset with slightly different styling
const STEP1_CONFIG: Partial<Record<DocStatus, { label: string; color: string; icon: React.ElementType }>> = {
  not_submitted: { label: "미제출", color: "bg-gray-100 text-gray-600", icon: Circle },
  submitted: { label: "제출 완료", color: "bg-blue-100 text-blue-700", icon: Clock },
  confirmed: { label: "확인 완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export function StatusBadge({
  status,
  variant = "full",
}: {
  status: DocStatus;
  variant?: "full" | "simple";
}) {
  const config = variant === "simple" ? STEP1_CONFIG : STATUS_CONFIG;
  const entry = config[status] ?? STATUS_CONFIG[status];
  if (!entry) return null;

  const { label, color, icon: Icon } = entry;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      variant === "full" && "gap-1.5 px-2.5 py-1 font-semibold",
      color,
    )}>
      <Icon className={cn("w-3 h-3", variant === "full" && "w-3.5 h-3.5")} />
      {label}
    </span>
  );
}
