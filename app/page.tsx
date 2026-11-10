"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { tabs } from "@/app/constants/dashboard";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DocumentType,
  LabReportFormData,
  AssignmentFormData,
  ProjectReportFormData,
  labReportSchema,
  assignmentSchema,
  projectReportSchema,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Loader2,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PreviewSection } from "@/components/preview/PreviewSection";
import { TemplatePicker } from "@/components/TemplatePicker";
import { prepareDocument, type CoverDesignId, type ProjectTemplateVariant } from "@/utils/docx-core";
import {
  downloadBlob,
  generateDocxBlob,
  generateDocxViaApi,
} from "@/utils/docx-client";
import { ModeToggle } from "@/components/mode-toggle";

function FieldError({
  error,
  fallback,
}: {
  error?: { message?: string };
  fallback?: string;
}) {
  if (!error) return null;
  const message = error.message || fallback;
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function Home() {
  const [docType, setDocType] = useState<DocumentType>("lab-report");
  const [includePageNumbers, setIncludePageNumbers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSingleMember, setIsSingleMember] = useState(true);
  const [projectTemplate, setProjectTemplate] =
    useState<ProjectTemplateVariant>(1);

  const [coverDesigns, setCoverDesigns] = useState<Partial<Record<DocumentType, CoverDesignId>>>({
    "lab-report": "01-formal-academic-lab",
    assignment: "02-editorial-assignment",
    "project-report": "04-technical-project",
  });
  const coverDesign = coverDesigns[docType];

  // Lab Report Form
  const labForm = useForm<LabReportFormData>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      labWeek: "",
      courseName: "",
      instructor: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
    },
  });

  // Assignment Form
  const assignmentForm = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      courseName: "",
      instructor: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
      isSingleMember: true,
      name: "",
      rollNumber: "",
      members: [{ reg: "", name: "" }],
    },
  });

  const assignmentMembers = useFieldArray({
    control: assignmentForm.control,
    name: "members",
  });

  // Project Report Form
  const projectForm = useForm<ProjectReportFormData>({
    resolver: zodResolver(projectReportSchema),
    defaultValues: {
      projectTitle: "",
      courseName: "",
      instructor: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
      members: [{ reg: "", name: "" }],
    },
  });

  const projectMembers = useFieldArray({
    control: projectForm.control,
    name: "members",
  });

  // NOTE: form values are intentionally NOT watched at this level. The preview
  // subscribes to the active form itself (see PreviewSection), so typing does
  // not re-render the whole page and never delays the Download button.

  const handleSubmit = async (
    formData: LabReportFormData | AssignmentFormData | ProjectReportFormData,
  ) => {
    setIsLoading(true);
    try {
      const projectVariant =
        docType === "project-report" ? projectTemplate : undefined;
      const prepared = prepareDocument(
        docType,
        formData,
        { projectVariant, coverDesign, includePageNumbers },
      );

      let blob: Blob;
      try {
        // Fast path: render entirely in the browser - no server round-trip,
        // independent from whatever the preview is doing.
        blob = await generateDocxBlob(prepared);
      } catch (clientError) {
        console.warn(
          "Client-side generation failed, falling back to API:",
          clientError,
        );
        blob = await generateDocxViaApi(docType, formData, projectVariant, coverDesign, includePageNumbers);
      }

      downloadBlob(blob, prepared.filename);
    } catch (error) {
      console.error("Error generating document:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate document",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMemberType = (single: boolean) => {
    setIsSingleMember(single);
    assignmentForm.setValue("isSingleMember", single);
    assignmentForm.clearErrors(["name", "members"]);
    if (!single && assignmentMembers.fields.length === 0) {
      assignmentMembers.append({ reg: "", name: "" });
    }
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              Cover Page Generator
            </h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 border-b bg-card px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDocType(tab.id)}
              aria-pressed={docType === tab.id}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                docType === tab.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <TemplatePicker
          key={docType}
          docType={docType}
          coverDesign={coverDesign}
          projectTemplate={projectTemplate}
          isSingleMember={isSingleMember}
          onSelect={(option) => {
            setCoverDesigns((previous) => ({
              ...previous,
              [docType]: option.coverDesign,
            }));
            if (option.projectVariant) setProjectTemplate(option.projectVariant);
          }}
        />
        {/* Form Section */}
        <div className="w-full shrink-0 border-b bg-card p-4 sm:p-6 md:min-h-0 md:w-1/2 md:flex-1 md:overflow-y-auto md:border-r md:border-b-0">
          <div className="mx-auto max-w-md space-y-6">
            <div>
              <h2 className="text-sm font-semibold">Document details</h2>
              <p className="mt-1 text-xs text-muted-foreground">Fill in the details for your cover page.</p>
            </div>
            {/* Lab Report Form */}
            {docType === "lab-report" && (
              <form
                onSubmit={labForm.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Name *
                    </Label>
                    <Input
                      {...labForm.register("name")}
                      placeholder="Your name"
                      className="h-11"
                    />
                    <FieldError error={labForm.formState.errors.name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Roll Number *
                    </Label>
                    <Input
                      {...labForm.register("rollNumber")}
                      placeholder="FA21-BSE-001"
                      className="h-11 font-mono text-sm"
                    />
                    <FieldError error={labForm.formState.errors.rollNumber} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...labForm.register("courseName")}
                      placeholder="Data Structures Lab"
                      className="h-11"
                    />
                    <FieldError error={labForm.formState.errors.courseName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Lab Week
                    </Label>
                    <Input
                      {...labForm.register("labWeek")}
                      placeholder="Week 5"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Instructor
                    </Label>
                    <Input
                      {...labForm.register("instructor")}
                      placeholder="Instructor name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Date Submitted *
                    </Label>
                    <Input
                      type="date"
                      {...labForm.register("dateSubmitted")}
                      className="h-11"
                    />
                    <FieldError
                      error={labForm.formState.errors.dateSubmitted}
                    />
                  </div>
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3">
                  <span>
                    <span className="block text-sm font-medium">Include page numbers</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Automatically number each page in Word.</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={includePageNumbers}
                    onChange={(event) => setIncludePageNumbers(event.target.checked)}
                    className="size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sticky bottom-0 z-10 h-11 w-full shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Download"}
                </Button>
              </form>
            )}

            {/* Assignment Form */}
            {docType === "assignment" && (
              <form
                onSubmit={assignmentForm.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Assignment Title *
                  </Label>
                  <Input
                    {...assignmentForm.register("title")}
                    placeholder="Enter assignment title"
                    className="h-11"
                  />
                  <FieldError error={assignmentForm.formState.errors.title} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...assignmentForm.register("courseName")}
                      placeholder="Software Engineering"
                      className="h-11"
                    />
                    <FieldError
                      error={assignmentForm.formState.errors.courseName}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Instructor *
                    </Label>
                    <Input
                      {...assignmentForm.register("instructor")}
                      placeholder="Instructor name"
                      className="h-11"
                    />
                    <FieldError
                      error={assignmentForm.formState.errors.instructor}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Date Submitted *
                  </Label>
                  <Input
                    type="date"
                    {...assignmentForm.register("dateSubmitted")}
                    className="h-11"
                  />
                  <FieldError
                    error={assignmentForm.formState.errors.dateSubmitted}
                  />
                </div>

                {/* Submission Type Toggle */}
                <div className="flex gap-1 rounded-full bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => handleToggleMemberType(true)}
                    aria-pressed={isSingleMember}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                      isSingleMember
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-card/60",
                    )}
                  >
                    <User className="h-4 w-4" /> Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMemberType(false)}
                    aria-pressed={!isSingleMember}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                      !isSingleMember
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-card/60",
                    )}
                  >
                    <Users className="h-4 w-4" /> Group
                  </button>
                </div>

                {isSingleMember ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Your Name *
                        </Label>
                        <Input
                          {...assignmentForm.register("name")}
                          placeholder="Enter your name"
                          className="h-11"
                        />
                        <FieldError
                          error={assignmentForm.formState.errors.name}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Roll Number
                        </Label>
                        <Input
                          {...assignmentForm.register("rollNumber")}
                          placeholder="FA21-BSE-001"
                          className="h-11 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Group Members *
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          assignmentMembers.append({ reg: "", name: "" })
                        }
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {assignmentMembers.fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <Input
                            {...assignmentForm.register(`members.${index}.reg`)}
                            placeholder="Reg No."
                            className="h-8 text-xs font-mono flex-1"
                          />
                          <Input
                            {...assignmentForm.register(
                              `members.${index}.name`,
                            )}
                            placeholder="Name"
                            className="h-8 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => assignmentMembers.remove(index)}
                            disabled={assignmentMembers.fields.length === 1}
                            className="h-8 w-8 shrink-0"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <FieldError
                      error={assignmentForm.formState.errors.members}
                      fallback="Please fill in all member details"
                    />
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3">
                  <span>
                    <span className="block text-sm font-medium">Include page numbers</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Automatically number each page in Word.</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={includePageNumbers}
                    onChange={(event) => setIncludePageNumbers(event.target.checked)}
                    className="size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sticky bottom-0 z-10 h-11 w-full shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Download"}
                </Button>
              </form>
            )}

            {/* Project Report Form */}
            {docType === "project-report" && (
              <form
                onSubmit={projectForm.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Project Title *
                  </Label>
                  <Input
                    {...projectForm.register("projectTitle")}
                    placeholder="Enter project title"
                    className="h-11"
                  />
                  <FieldError
                    error={projectForm.formState.errors.projectTitle}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...projectForm.register("courseName")}
                      placeholder="Final Year Project"
                      className="h-11"
                    />
                    <FieldError
                      error={projectForm.formState.errors.courseName}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Instructor *
                    </Label>
                    <Input
                      {...projectForm.register("instructor")}
                      placeholder="Instructor name"
                      className="h-11"
                    />
                    <FieldError
                      error={projectForm.formState.errors.instructor}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Date Submitted *
                  </Label>
                  <Input
                    type="date"
                    {...projectForm.register("dateSubmitted")}
                    className="h-11"
                  />
                  <FieldError
                    error={projectForm.formState.errors.dateSubmitted}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Team Members *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        projectMembers.append({ reg: "", name: "" })
                      }
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {projectMembers.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...projectForm.register(`members.${index}.reg`)}
                          placeholder="Reg No."
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Input
                          {...projectForm.register(`members.${index}.name`)}
                          placeholder="Name"
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => projectMembers.remove(index)}
                          disabled={projectMembers.fields.length === 1}
                          className="h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <FieldError
                    error={projectForm.formState.errors.members}
                    fallback="Please fill in all member details"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3">
                  <span>
                    <span className="block text-sm font-medium">Include page numbers</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Automatically number each page in Word.</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={includePageNumbers}
                    onChange={(event) => setIncludePageNumbers(event.target.checked)}
                    className="size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sticky bottom-0 z-10 h-11 w-full shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Download"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {docType === "lab-report" ? (
          <PreviewSection
            control={labForm.control}
            docType="lab-report"
            projectTemplate={projectTemplate}
            coverDesign={coverDesign}
            includePageNumbers={includePageNumbers}
            paused={isLoading}
          />
        ) : docType === "assignment" ? (
          <PreviewSection
            control={assignmentForm.control}
            docType="assignment"
            projectTemplate={projectTemplate}
            coverDesign={coverDesign}
            includePageNumbers={includePageNumbers}
            paused={isLoading}
          />
        ) : (
          <PreviewSection
            control={projectForm.control}
            docType="project-report"
            projectTemplate={projectTemplate}
            coverDesign={coverDesign}
            includePageNumbers={includePageNumbers}
            paused={isLoading}
          />
        )}
      </div>
    </main>
  );
}
