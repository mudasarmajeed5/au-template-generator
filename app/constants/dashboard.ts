import { FileText, FlaskConical, FolderKanban } from "lucide-react";

export const tabs = [
  {
    id: "lab-report" as const,
    label: "Lab Report",
    icon: FlaskConical,
    color: "emerald",
  },
  {
    id: "assignment" as const,
    label: "Assignment",
    icon: FileText,
    color: "blue",
  },
  {
    id: "project-report" as const,
    label: "Project Report",
    icon: FolderKanban,
    color: "violet",
  },
];