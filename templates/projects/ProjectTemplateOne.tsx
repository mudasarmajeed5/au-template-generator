import { DEFAULT_DATA, ProjectReportData } from "./projectProposalTypes";

export const ProjectTemplateOne = ({
  projectTitle = DEFAULT_DATA.projectTitle,
  courseName = DEFAULT_DATA.courseName,
  instructor = DEFAULT_DATA.instructor,
  dateSubmitted = DEFAULT_DATA.dateSubmitted,
  members = DEFAULT_DATA.members,
}: ProjectReportData) => {
  return (
    <div
      style={{
        width: 595,
        height: 842,
        background: "#f0f4f8",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Top-right diamonds */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 220, height: 220 }}>
        <svg viewBox="0 0 220 220" fill="none" style={{ width: "100%", height: "100%" }}>
          <rect x="80" y="-40" width="160" height="160" rx="6" fill="#b8c8e0" fillOpacity="0.55" transform="rotate(15 80 -40)" />
          <rect x="110" y="10" width="110" height="110" rx="5" fill="#c8d8ec" fillOpacity="0.65" transform="rotate(20 110 10)" />
          <rect x="140" y="55" width="75" height="75" rx="4" fill="#dce8f4" fillOpacity="0.80" transform="rotate(15 140 55)" />
          <rect x="170" y="20" width="45" height="45" rx="3" fill="#eaf2fb" fillOpacity="0.90" transform="rotate(10 170 20)" />
        </svg>
      </div>

      {/* Bottom-right diamonds */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" fill="none" style={{ width: "100%", height: "100%" }}>
          <rect x="20" y="60" width="160" height="160" rx="6" fill="#b8c8e0" fillOpacity="0.50" transform="rotate(-15 20 60)" />
          <rect x="50" y="70" width="120" height="120" rx="5" fill="#c8d8ec" fillOpacity="0.60" transform="rotate(-10 50 70)" />
          <rect x="90" y="100" width="85" height="85" rx="4" fill="#dce8f4" fillOpacity="0.75" transform="rotate(-5 90 100)" />
          <rect x="110" y="60" width="50" height="50" rx="3" fill="#eaf2fb" fillOpacity="0.85" transform="rotate(-20 110 60)" />
        </svg>
      </div>

      {/* Course name */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 28,
          fontSize: 13,
          fontWeight: 600,
          color: "#3a4a6b",
          fontFamily: "'Segoe UI', sans-serif",
          letterSpacing: "0.03em",
        }}
      >
        {courseName}
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: 200, left: 28, right: 28 }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 900,
            fontSize: 68,
            lineHeight: 1.0,
            color: "#1e3461",
            textTransform: "uppercase",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {projectTitle}
        </h1>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 28,
          width: 280,
          height: 2,
          background: "linear-gradient(to right, #1e3461, transparent)",
          opacity: 0.25,
        }}
      />

      {/* Meta: Instructor & Date */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: 28,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {([["Instructor", instructor], ["Date Submitted", dateSubmitted]] as [string, string][]).map(
          ([label, val]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#7a8aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "sans-serif",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#1e3461",
                  fontWeight: 600,
                  fontFamily: "sans-serif",
                }}
              >
                {val}
              </span>
            </div>
          )
        )}
      </div>

      {/* Members */}
      <div style={{ position: "absolute", bottom: 160, left: 28 }}>
        <div
          style={{
            fontSize: 12,
            color: "#3a4a6b",
            marginBottom: 6,
            fontFamily: "sans-serif",
          }}
        >
          {members.length === 1 ? "Presented by :" : "Team Members :"}
        </div>
        {members.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 3,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1e3461",
                fontFamily: "sans-serif",
              }}
            >
              {m.name}
            </span>
            {m.reg && (
              <span style={{ fontSize: 11, color: "#5a6a8a", fontFamily: "sans-serif" }}>
                {m.reg}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 28,
          fontSize: 11,
          color: "#5a6a8a",
          fontFamily: "sans-serif",
        }}
      >
        www.reallygreatsite.com
      </div>
    </div>
  );
};

export default ProjectTemplateOne;
