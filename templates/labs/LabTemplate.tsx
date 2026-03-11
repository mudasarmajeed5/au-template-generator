import { DEFAULT_DATA, LabReportData } from "./labTypes";

function AULogo() {
  return (
    <img
      src="/aulogo.png"
      alt="Air University Logo"
      style={{ width: 280, height: "auto", display: "block", margin: "0 auto" }}
      onError={(e) => {
        // fallback: render text-based logo if image fails
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export const LabTemplate = ({
  name = DEFAULT_DATA.name,
  rollNumber = DEFAULT_DATA.rollNumber,
  labWeek = DEFAULT_DATA.labWeek,
  courseName = DEFAULT_DATA.courseName,
  instructor = DEFAULT_DATA.instructor,
  dateSubmitted = DEFAULT_DATA.dateSubmitted,
}: LabReportData) => {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#fff",
        fontFamily: "Times New Roman, Times, serif",
        fontSize: "13pt",
        color: "#000",
        position: "relative",
        boxSizing: "border-box",
        padding: "20mm 22mm 20mm 22mm",
        margin: "0 auto",
        boxShadow: "0 0 12px rgba(0,0,0,0.15)",
      }}
    >
      {/* Top-left: Roll No */}
      <div
        style={{
          position: "absolute",
          top: "18mm",
          left: "22mm",
          fontSize: "11pt",
        }}
      >
        Roll No: <span>{rollNumber}</span>
      </div>

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

      {/* Bottom-left: Date */}
      <div
        style={{
          position: "absolute",
          bottom: "14mm",
          left: "22mm",
          fontSize: "11pt",
          color: "#c0392b",
          fontStyle: "italic",
        }}
      >
        {dateSubmitted}
      </div>

      {/* Bottom-right: Page number */}
      <div
        style={{
          position: "absolute",
          bottom: "14mm",
          right: "18mm",
          backgroundColor: "#555",
          color: "#fff",
          fontSize: "11pt",
          padding: "3px 10px",
          borderRadius: 2,
          fontFamily: "Arial, sans-serif",
        }}
      >
        1
      </div>
    </div>
  );
};
