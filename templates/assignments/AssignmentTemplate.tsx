import { DEFAULT_DATA, AssignmentData } from "./assignmentTypes";

function AULogo() {
  return (
    <img
      src="https://portals.au.edu.pk/admissions/assets/images/aulogo.png"
      alt="Air University Logo"
      style={{ width: 280, height: "auto", display: "block", margin: "0 auto" }}
      onError={(e) => {
        // fallback: render text-based logo if image fails
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export const AssignmentTemplate = ({
  title = DEFAULT_DATA.title,
  courseName = DEFAULT_DATA.courseName,
  instructor = DEFAULT_DATA.instructor,
  dateSubmitted = DEFAULT_DATA.dateSubmitted,
  rollNumber = DEFAULT_DATA.rollNumber,
  name = DEFAULT_DATA.name,
  members = [],
}: AssignmentData) => {
  const isGroup = members && members.length > 0;
  const displayRollNumber = isGroup ? members[0]?.reg : rollNumber;

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
        Roll No:{" "}
        <span style={{ borderBottom: "1px solid #000", paddingBottom: 1 }}>
          {displayRollNumber}
        </span>
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

        {/* Topic */}
        <p
          style={{
            fontWeight: "bold",
            fontSize: "13pt",
            textDecoration: "underline",
            margin: "0 0 20px 0",
            textAlign: "center",
          }}
        >
          Topic: {title}
        </p>

        {/* Single student */}
        {!isGroup && (
          <>
            <p style={{ margin: "0 0 6px 0", textAlign: "center" }}>
              <span style={{ textDecoration: "underline" }}>Name:</span> {name}
            </p>
            <p style={{ margin: "0 0 6px 0", textAlign: "center" }}>
              Submitted <span style={{ textDecoration: "underline" }}>to:</span>{" "}
              {instructor}
            </p>
            <p style={{ margin: "0", textAlign: "center" }}>
              Roll <span style={{ textDecoration: "underline" }}>Number:</span>{" "}
              {rollNumber}
            </p>
          </>
        )}

        {/* Group members */}
        {isGroup && (
          <>
            <table
              style={{
                borderCollapse: "collapse",
                margin: "10px 0 20px 0",
                width: "auto",
                minWidth: "280px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px 16px",
                      textAlign: "center",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px 16px",
                      textAlign: "center",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Roll No
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 16px",
                        textAlign: "left",
                      }}
                    >
                      {member.name}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 16px",
                        textAlign: "center",
                      }}
                    >
                      {member.reg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: "10px 0 0 0", textAlign: "center" }}>
              Submitted <span style={{ textDecoration: "underline" }}>to:</span>{" "}
              {instructor}
            </p>
          </>
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
