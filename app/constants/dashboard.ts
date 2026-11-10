import { FileText, FlaskConical, FolderKanban } from "lucide-react";

export const tabs = [
  {
    id: "lab-report" as const,
    label: "Lab Report",
    icon: FlaskConical,
  },
  {
    id: "assignment" as const,
    label: "Assignment",
    icon: FileText,
  },
  {
    id: "project-report" as const,
    label: "Project Report",
    icon: FolderKanban,
  },
];