import { DEFAULT_DATA, LabReportData } from "./labTypes";
import {
  AULogo,
  DocumentWrapper,
  PageNumber,
  DateFooter,
  RollNumberHeader,
} from "../shared";

export const LabTemplate = ({
  name = DEFAULT_DATA.name,
  rollNumber = DEFAULT_DATA.rollNumber,
  labWeek = DEFAULT_DATA.labWeek,
  courseName = DEFAULT_DATA.courseName,
  instructor = DEFAULT_DATA.instructor,
  dateSubmitted = DEFAULT_DATA.dateSubmitted,
}: LabReportData) => {
  return (
    <DocumentWrapper>
      <RollNumberHeader rollNumber={rollNumber} />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "257mm",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <AULogo />
        </div>

        {/* Course Name */}
        <p
          style={{
            fontWeight: "bold",
            fontSize: "16pt",
            margin: "0 0 8px 0",
            textAlign: "center",
          }}
        >
          {courseName}
        </p>

        {/* Lab Week */}
        <p
          style={{
            fontWeight: "bold",
            fontSize: "14pt",
            margin: "0 0 20px 0",
            textAlign: "center",
          }}
        >
          {labWeek}
        </p>

        {/* Student Info */}
        <p style={{ margin: "0 0 6px 0", textAlign: "center" }}>
          <span>Name:</span> {name}
        </p>
        <p style={{ margin: "0 0 6px 0", textAlign: "center" }}>
          <span>Roll Number:</span> {rollNumber}
        </p>
        {instructor && (
          <p style={{ margin: "0", textAlign: "center" }}>
            Submitted <span>to:</span> {instructor}
          </p>
        )}
      </div>

      <DateFooter date={dateSubmitted} />
      <PageNumber page={1} />
    </DocumentWrapper>
  );
};
