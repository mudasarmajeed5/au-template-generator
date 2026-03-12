import { ProjectTemplateOne } from "@/templates/projects/ProjectTemplateOne";
import { ProjectTemplateTwo } from "@/templates/projects/ProjectTemplateTwo";
import { ProjectTemplateThree } from "@/templates/projects/ProjectTemplateThree";
import { ProjectReportData } from "@/templates/projects/projectProposalTypes";
import { Member } from "@/lib/schemas";

export type ProjectTemplateVariant = 1 | 2 | 3;

interface ProjectTemplateRendererProps {
  data: Record<string, unknown>;
  zoom: number;
  templateVariant: ProjectTemplateVariant;
}

export function ProjectTemplateRenderer({
  data,
  zoom,
  templateVariant,
}: ProjectTemplateRendererProps) {
  const templateData: ProjectReportData = {
    projectTitle: (data.projectTitle as string) || undefined,
    courseName: (data.courseName as string) || undefined,
    instructor: (data.instructor as string) || undefined,
    dateSubmitted: (data.dateSubmitted as string) || undefined,
    members: ((data.members as Member[]) || []).filter((m) => m.name || m.reg),
  };

  const renderTemplate = () => {
    switch (templateVariant) {
      case 1:
        return <ProjectTemplateOne {...templateData} />;
      case 2:
        return <ProjectTemplateTwo {...templateData} />;
      case 3:
        return <ProjectTemplateThree {...templateData} />;
      default:
        return <ProjectTemplateOne {...templateData} />;
    }
  };

  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        transition: "transform 0.15s ease-out",
      }}
    >
      {renderTemplate()}
    </div>
  );
}
