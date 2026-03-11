import { DEFAULT_DATA, ProjectReportData } from "./projectProposalTypes";

export const ProjectTemplateTwo = ({
  projectTitle = DEFAULT_DATA.projectTitle,
  courseName = DEFAULT_DATA.courseName,
  instructor = DEFAULT_DATA.instructor,
  members = DEFAULT_DATA.members,
}: ProjectReportData) => {
  return (
    <div
      style={{
        width: 595,
        height: 842,
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Top teal wave */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
        <svg viewBox="0 0 595 180" fill="none" style={{ width: "100%", display: "block" }}>
          <path d="M0 0 H595 V100 C500 170 400 60 300 130 C200 200 100 90 0 150 Z" fill="#2aaa8a" />
          <path
            d="M0 0 H595 V80 C480 150 360 40 250 110 C140 180 60 70 0 120 Z"
            fill="#1d8c70"
            fillOpacity="0.6"
          />
          <line x1="28" y1="28" x2="52" y2="28" stroke="white" strokeWidth="2.5" />
          <line x1="28" y1="28" x2="28" y2="52" stroke="white" strokeWidth="2.5" />
          <line x1="567" y1="28" x2="543" y2="28" stroke="white" strokeWidth="2.5" />
          <line x1="567" y1="28" x2="567" y2="52" stroke="white" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Bottom teal wave */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%" }}>
        <svg viewBox="0 0 595 180" fill="none" style={{ width: "100%", display: "block" }}>
          <path d="M0 180 H595 V80 C480 20 360 130 250 60 C140 -10 60 100 0 50 Z" fill="#2aaa8a" />
          <path
            d="M0 180 H595 V100 C500 30 380 150 260 80 C140 10 60 120 0 70 Z"
            fill="#1d8c70"
            fillOpacity="0.5"
          />
          <line x1="28" y1="152" x2="52" y2="152" stroke="white" strokeWidth="2.5" />
          <line x1="28" y1="152" x2="28" y2="128" stroke="white" strokeWidth="2.5" />
          <line x1="567" y1="152" x2="543" y2="152" stroke="white" strokeWidth="2.5" />
          <line x1="567" y1="152" x2="567" y2="128" stroke="white" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Project title */}
      <div style={{ position: "absolute", top: 210, left: 52 }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 52,
            lineHeight: 1.15,
            color: "#2aaa8a",
            margin: 0,
            maxWidth: 480,
          }}
        >
          {projectTitle}
        </h1>
      </div>

      {/* Course name */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 52,
          fontSize: 20,
          fontWeight: 700,
          color: "#1a2a1a",
          fontFamily: "Georgia, serif",
        }}
      >
        {courseName}
      </div>

      {/* Instructor */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 52,
          fontSize: 14,
          color: "#333",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <span style={{ fontWeight: 600 }}>Submitted to:</span> {instructor}
      </div>

      {/* Members */}
      <div style={{ position: "absolute", top: 490, left: 52 }}>
        {members.map((m, i) => (
          <div
            key={i}
            style={{
              fontSize: 12,
              color: "#444",
              fontFamily: "sans-serif",
              marginBottom: 3,
            }}
          >
            {m.reg ? `${m.reg} – ${m.name}` : m.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTemplateTwo;
