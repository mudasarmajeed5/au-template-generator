import { LabTemplate } from "@/templates/labs/LabTemplate";
import { LabReportData } from "@/templates/labs/labTypes";

interface LabTemplateRendererProps {
  data: Record<string, unknown>;
  zoom: number;
}

export function LabTemplateRenderer({ data, zoom }: LabTemplateRendererProps) {
  const templateData: LabReportData = {
    name: (data.name as string) || undefined,
    rollNumber: (data.rollNumber as string) || undefined,
    labWeek: (data.labWeek as string) || undefined,
    courseName: (data.courseName as string) || undefined,
    instructor: (data.instructor as string) || undefined,
    dateSubmitted: (data.dateSubmitted as string) || undefined,
  };

  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        transition: "transform 0.15s ease-out",
      }}
    >
      <LabTemplate {...templateData} />
    </div>
  );
}
