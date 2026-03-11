export interface Member {
  name: string;
  reg?: string;
}

export interface AssignmentData {
  title?: string;
  courseName?: string;
  instructor?: string;
  dateSubmitted?: string;
  rollNumber?: string;
  name?: string;
  members?: Member[];
}

export const DEFAULT_DATA: Required<Omit<AssignmentData, "members">> & {
  members: Member[];
} = {
  title: "Assignment Title",
  courseName: "Software Engineering 101",
  instructor: "Dr. Jane Smith",
  dateSubmitted: "March 11, 2026",
  rollNumber: "FA21-BSE-001",
  name: "Student Name",
  members: [
    { name: "John Doe", reg: "FA21-BSE-001" },
    { name: "Jane Smith", reg: "FA21-BSE-002" },
  ],
};
