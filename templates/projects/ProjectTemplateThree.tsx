import { DEFAULT_DATA, ProjectReportData } from "./projectProposalTypes";

export const ProjectTemplateThree = ({
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
      {/* Right-side teal wave */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: 140,
        }}
      >
        <svg viewBox="0 0 140 842" fill="none" style={{ width: "100%", height: "100%" }}>
          <path
            d="M140 0 V842 H80 C40 720 100 600 60 480 C20 360 80 240 50 120 C30 60 60 20 140 0 Z"
            fill="#2aaa8a"
          />
          <path
            d="M140 0 V842 H100 C70 700 120 580 90 450 C60 320 110 210 80 90 C65 40 95 10 140 0 Z"
            fill="#1d8c70"
            fillOpacity="0.55"
          />
        </svg>
      </div>

      {/* Corner bracket — top-left */}
      <svg
        style={{ position: "absolute", top: 20, left: 20 }}
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <line x1="0" y1="0" x2="28" y2="0" stroke="#ccc" strokeWidth="2" />
        <line x1="0" y1="0" x2="0" y2="28" stroke="#ccc" strokeWidth="2" />
      </svg>

      {/* Corner bracket — bottom-left */}
      <svg
        style={{ position: "absolute", bottom: 20, left: 20 }}
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <line x1="0" y1="28" x2="28" y2="28" stroke="#ccc" strokeWidth="2" />
        <line x1="0" y1="28" x2="0" y2="0" stroke="#ccc" strokeWidth="2" />
      </svg>

      {/* Corner bracket — bottom-right */}
      <svg
        style={{ position: "absolute", bottom: 20, right: 20 }}
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <line x1="28" y1="28" x2="0" y2="28" stroke="#ccc" strokeWidth="2" />
        <line x1="28" y1="28" x2="28" y2="0" stroke="#ccc" strokeWidth="2" />
      </svg>

      {/* Course name — top left */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 36,
          fontSize: 13,
          fontWeight: 600,
          color: "#1a2a1a",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {courseName}
      </div>

      {/* Project title — vertical center */}
      <div style={{ position: "absolute", top: 300, left: 36, right: 160 }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 400,
            fontSize: 48,
            lineHeight: 1.2,
            color: "#111",
            margin: 0,
          }}
        >
          {projectTitle}
        </h1>
      </div>

      {/* Instructor & members — bottom left */}
      <div style={{ position: "absolute", bottom: 120, left: 36 }}>
        <div
          style={{
            fontSize: 13,
            color: "#222",
            fontFamily: "sans-serif",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          {instructor}
        </div>
        {members.map((m, i) => (
          <div
            key={i}
            style={{
              fontSize: 12,
              color: "#444",
              fontFamily: "sans-serif",
              marginBottom: 2,
            }}
          >
            {m.reg ? `${m.reg} – ${m.name}` : m.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTemplateThree;
