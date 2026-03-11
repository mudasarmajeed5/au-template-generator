"use client";

import { DocumentType } from "@/lib/schemas";
import { FileText, FlaskConical, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTypeSelectorProps {
  value: DocumentType | "";
  onChange: (value: DocumentType) => void;
}

const documentTypes = [
  {
    value: "lab-report" as const,
    label: "Lab Report",
    icon: FlaskConical,
    description: "Individual lab submissions",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "assignment" as const,
    label: "Assignment",
    icon: FileText,
    description: "Individual or group work",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "project-report" as const,
    label: "Project Report",
    icon: FolderKanban,
    description: "Team project submissions",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

export function DocumentTypeSelector({
  value,
  onChange,
}: DocumentTypeSelectorProps) {
  return (
    <div className="grid gap-3">
      {documentTypes.map((type) => {
        const isSelected = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
              "hover:shadow-md hover:-translate-y-0.5",
              isSelected
                ? `${type.borderColor} bg-gradient-to-r ${type.bgGradient} shadow-md`
                : "border-border bg-card hover:border-muted-foreground/30",
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                isSelected ? type.iconBg : "bg-muted",
              )}
            >
              <type.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isSelected ? type.iconColor : "text-muted-foreground",
                )}
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold transition-colors",
                  isSelected ? "text-foreground" : "text-foreground",
                )}
              >
                {type.label}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {type.description}
              </p>
            </div>

            {/* Selection indicator */}
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isSelected
                  ? `bg-gradient-to-r ${type.gradient} border-transparent`
                  : "border-muted-foreground/30",
              )}
            >
              {isSelected && (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
