export interface LabReportData {
  name?: string;
  rollNumber?: string;
  labWeek?: string;
  courseName?: string;
  instructor?: string;
  dateSubmitted?: string;
}

export const DEFAULT_DATA: Required<LabReportData> = {
  name: "Student Name",
  rollNumber: "FA21-BSE-001",
  labWeek: "Week 1",
  courseName: "Data Structures Lab",
  instructor: "Dr. Jane Smith",
  dateSubmitted: "March 11, 2026",
};
