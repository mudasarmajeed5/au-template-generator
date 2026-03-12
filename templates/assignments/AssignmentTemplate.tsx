import { DEFAULT_DATA, AssignmentData } from "./assignmentTypes";
import {
  AULogo,
  DocumentWrapper,
  PageNumber,
  DateFooter,
  RollNumberHeader,
} from "../shared";

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
    <DocumentWrapper>
      <RollNumberHeader rollNumber={displayRollNumber || ""} />

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
              <span>Name:</span> {name}
            </p>
            <p style={{ margin: "0 0 6px 0", textAlign: "center" }}>
              Submitted <span>to:</span> {instructor}
            </p>
            <p style={{ margin: "0", textAlign: "center" }}>
              Roll <span>Number:</span> {rollNumber}
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

      <DateFooter date={dateSubmitted} />
      <PageNumber page={1} />
    </DocumentWrapper>
  );
};
