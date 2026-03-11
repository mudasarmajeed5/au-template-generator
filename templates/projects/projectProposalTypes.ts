export interface Member {
  name: string;
  reg?: string;
}

export interface ProjectReportData {
  projectTitle?: string;
  courseName?: string;
  instructor?: string;
  dateSubmitted?: string;
  members?: Member[];
}

export const DEFAULT_DATA: Required<ProjectReportData> = {
  projectTitle: "Project Proposal",
  courseName: "Software Engineering 101",
  instructor: "Dr. Jane Smith",
  dateSubmitted: "March 11, 2026",
  members: [
    { name: "John Doe", reg: "2021-CS-001" },
    { name: "Jane Smith", reg: "2021-CS-002" },
    { name: "Alex Johnson", reg: "2021-CS-003" },
  ],
};
