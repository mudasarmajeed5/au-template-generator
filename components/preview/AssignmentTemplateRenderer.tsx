import { AssignmentTemplate } from "@/templates/assignments/AssignmentTemplate";
import { AssignmentData } from "@/templates/assignments/assignmentTypes";
import { Member } from "@/lib/schemas";

interface AssignmentTemplateRendererProps {
  data: Record<string, unknown>;
  zoom: number;
  isSingleMember: boolean;
}

export function AssignmentTemplateRenderer({
  data,
  zoom,
  isSingleMember,
}: AssignmentTemplateRendererProps) {
  const templateData: AssignmentData = {
    title: (data.title as string) || undefined,
    courseName: (data.courseName as string) || undefined,
    instructor: (data.instructor as string) || undefined,
    dateSubmitted: (data.dateSubmitted as string) || undefined,
    rollNumber: (data.rollNumber as string) || undefined,
    name: (data.name as string) || undefined,
    members: isSingleMember
      ? []
      : ((data.members as Member[]) || []).filter((m) => m.name || m.reg),
  };

  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        transition: "transform 0.15s ease-out",
      }}
    >
      <AssignmentTemplate {...templateData} />
    </div>
  );
}
