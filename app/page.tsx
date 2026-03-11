"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DocumentType,
  LabReportFormData,
  AssignmentFormData,
  ProjectReportFormData,
  labReportSchema,
  assignmentSchema,
  projectReportSchema,
  Member,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  FlaskConical,
  FolderKanban,
  Download,
  Loader2,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "lab-report" as const,
    label: "Lab Report",
    icon: FlaskConical,
    color: "emerald",
  },
  {
    id: "assignment" as const,
    label: "Assignment",
    icon: FileText,
    color: "blue",
  },
  {
    id: "project-report" as const,
    label: "Project Report",
    icon: FolderKanban,
    color: "violet",
  },
];

export default function Home() {
  const [docType, setDocType] = useState<DocumentType>("lab-report");
  const [isLoading, setIsLoading] = useState(false);
  const [isSingleMember, setIsSingleMember] = useState(true);
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});

  // Lab Report Form
  const labForm = useForm<LabReportFormData>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      labWeek: "",
      courseName: "",
      submittedTo: "",
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

  // Watch form values for preview
  const labValues = labForm.watch();
  const assignmentValues = assignmentForm.watch();
  const projectValues = projectForm.watch();

  useEffect(() => {
    if (docType === "lab-report") {
      setPreviewData(labValues);
    } else if (docType === "assignment") {
      setPreviewData(assignmentValues);
    } else {
      setPreviewData(projectValues);
    }
  }, [docType, labValues, assignmentValues, projectValues]);

  const handleDownload = async (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSubmit = async (
    formData: LabReportFormData | AssignmentFormData | ProjectReportFormData,
  ) => {
    setIsLoading(true);
    try {
      let apiData: Record<string, unknown> = { ...formData };

      if (docType === "assignment") {
        const assignmentData = formData as AssignmentFormData;
        if (assignmentData.isSingleMember) {
          const { members: _m, isSingleMember: _s, ...rest } = assignmentData;
          apiData = rest;
        } else {
          const { name: _n, isSingleMember: _s, ...rest } = assignmentData;
          apiData = rest;
        }
      }

      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, formData: apiData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate document");
      }

      const blob = await response.blob();
      await handleDownload(blob, `${docType}-${Date.now()}.docx`);
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
    if (!single && assignmentMembers.fields.length === 0) {
      assignmentMembers.append({ reg: "", name: "" });
    }
  };

  const currentTab = tabs.find((t) => t.id === docType)!;

  const getColorClasses = (color: string, active: boolean) => {
    const colors: Record<
      string,
      { active: string; inactive: string; accent: string }
    > = {
      emerald: {
        active: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
        inactive: "text-emerald-600 hover:bg-emerald-50",
        accent: "from-emerald-500 to-teal-600",
      },
      blue: {
        active: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
        inactive: "text-blue-600 hover:bg-blue-50",
        accent: "from-blue-500 to-indigo-600",
      },
      violet: {
        active: "bg-violet-500 text-white shadow-lg shadow-violet-500/30",
        inactive: "text-violet-600 hover:bg-violet-50",
        accent: "from-violet-500 to-purple-600",
      },
    };
    return active ? colors[color].active : colors[color].inactive;
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="shrink-0 border-b bg-white/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Cover Page Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 bg-white border-b px-6 py-2">
        <div className="flex gap-1 max-w-7xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDocType(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                getColorClasses(tab.color, docType === tab.id),
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Section */}
        <div className="w-1/2 border-r bg-white overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-4">
            {/* Lab Report Form */}
            {docType === "lab-report" && (
              <form
                onSubmit={labForm.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Name *
                    </Label>
                    <Input
                      {...labForm.register("name")}
                      placeholder="Your name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Roll Number *
                    </Label>
                    <Input
                      {...labForm.register("rollNumber")}
                      placeholder="FA21-BSE-001"
                      className="h-9 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...labForm.register("courseName")}
                      placeholder="Data Structures Lab"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Lab Week
                    </Label>
                    <Input
                      {...labForm.register("labWeek")}
                      placeholder="Week 5"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Submitted To
                    </Label>
                    <Input
                      {...labForm.register("submittedTo")}
                      placeholder="Instructor name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Date Submitted *
                    </Label>
                    <Input
                      type="date"
                      {...labForm.register("dateSubmitted")}
                      className="h-9"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Generate & Download"}
                </Button>
              </form>
            )}

            {/* Assignment Form */}
            {docType === "assignment" && (
              <form
                onSubmit={assignmentForm.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Assignment Title *
                  </Label>
                  <Input
                    {...assignmentForm.register("title")}
                    placeholder="Enter assignment title"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...assignmentForm.register("courseName")}
                      placeholder="Software Engineering"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Instructor *
                    </Label>
                    <Input
                      {...assignmentForm.register("instructor")}
                      placeholder="Instructor name"
                      className="h-9"
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
                    className="h-9"
                  />
                </div>

                {/* Submission Type Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleToggleMemberType(true)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                      isSingleMember
                        ? "bg-white shadow text-blue-600"
                        : "text-slate-500",
                    )}
                  >
                    <User className="h-4 w-4" /> Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMemberType(false)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                      !isSingleMember
                        ? "bg-white shadow text-blue-600"
                        : "text-slate-500",
                    )}
                  >
                    <Users className="h-4 w-4" /> Group
                  </button>
                </div>

                {isSingleMember ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Your Name *
                    </Label>
                    <Input
                      {...assignmentForm.register("name")}
                      placeholder="Enter your name"
                      className="h-9"
                    />
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
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Generate & Download"}
                </Button>
              </form>
            )}

            {/* Project Report Form */}
            {docType === "project-report" && (
              <form
                onSubmit={projectForm.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Project Title *
                  </Label>
                  <Input
                    {...projectForm.register("projectTitle")}
                    placeholder="Enter project title"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Course Name *
                    </Label>
                    <Input
                      {...projectForm.register("courseName")}
                      placeholder="Final Year Project"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Instructor *
                    </Label>
                    <Input
                      {...projectForm.register("instructor")}
                      placeholder="Instructor name"
                      className="h-9"
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
                    className="h-9"
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
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Generate & Download"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-1/2 bg-slate-100 p-6 overflow-hidden flex flex-col">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 shrink-0">
            Live Preview
          </h3>

          <div className="flex-1 flex items-center justify-center">
            {/* Document Preview Card */}
            <div className="bg-white rounded-xl shadow-xl border overflow-hidden w-full max-w-xs aspect-[8.5/11] flex flex-col">
              {/* Header accent bar */}
              <div
                className={cn(
                  "h-2 bg-gradient-to-r shrink-0",
                  currentTab.color === "emerald" &&
                    "from-emerald-500 to-teal-600",
                  currentTab.color === "blue" && "from-blue-500 to-indigo-600",
                  currentTab.color === "violet" &&
                    "from-violet-500 to-purple-600",
                )}
              />

              <div className="flex-1 p-6 flex flex-col min-h-0">
                {/* University/Institution placeholder */}
                <div className="text-center mb-4 shrink-0">
                  <div className="h-3 w-32 bg-slate-200 rounded mx-auto mb-2" />
                  <div className="h-2 w-24 bg-slate-100 rounded mx-auto" />
                </div>

                {/* Title */}
                <div className="text-center my-auto py-6 shrink-0">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    {docType === "lab-report" && "Lab Report"}
                    {docType === "assignment" && "Assignment"}
                    {docType === "project-report" && "Project Report"}
                  </p>
                  <h2 className="text-sm font-bold text-slate-800 leading-tight">
                    {docType === "lab-report" &&
                      ((previewData.courseName as string) || "Course Name")}
                    {docType === "assignment" &&
                      ((previewData.title as string) || "Assignment Title")}
                    {docType === "project-report" &&
                      ((previewData.projectTitle as string) || "Project Title")}
                  </h2>
                  {docType === "lab-report" &&
                  (previewData.labWeek as string) ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {previewData.labWeek as string}
                    </p>
                  ) : null}
                </div>

                {/* Details */}
                <div className="space-y-2 text-[9px] mt-auto shrink-0">
                  {docType === "lab-report" && (
                    <>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Name</span>
                        <span className="font-medium text-slate-700">
                          {(previewData.name as string) || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Roll Number</span>
                        <span className="font-mono text-slate-700">
                          {(previewData.rollNumber as string) || "—"}
                        </span>
                      </div>
                      {previewData.submittedTo && (
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Submitted To</span>
                          <span className="text-slate-700">
                            {previewData.submittedTo as string}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="text-slate-700">
                          {(previewData.dateSubmitted as string) || "—"}
                        </span>
                      </div>
                    </>
                  )}

                  {docType === "assignment" && (
                    <>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Course</span>
                        <span className="text-slate-700">
                          {(previewData.courseName as string) || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Instructor</span>
                        <span className="text-slate-700">
                          {(previewData.instructor as string) || "—"}
                        </span>
                      </div>
                      {isSingleMember ? (
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Submitted By</span>
                          <span className="font-medium text-slate-700">
                            {(previewData.name as string) || "—"}
                          </span>
                        </div>
                      ) : (
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Team Members</span>
                          <div className="mt-1 space-y-0.5">
                            {((previewData.members as Member[]) || [])
                              .filter((m) => m.name || m.reg)
                              .map((m, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between pl-2"
                                >
                                  <span className="font-mono text-slate-500">
                                    {m.reg || "—"}
                                  </span>
                                  <span className="text-slate-700">
                                    {m.name || "—"}
                                  </span>
                                </div>
                              ))}
                            {!((previewData.members as Member[]) || []).some(
                              (m) => m.name || m.reg,
                            ) && (
                              <span className="text-slate-400 pl-2">
                                No members added
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="text-slate-700">
                          {(previewData.dateSubmitted as string) || "—"}
                        </span>
                      </div>
                    </>
                  )}

                  {docType === "project-report" && (
                    <>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Course</span>
                        <span className="text-slate-700">
                          {(previewData.courseName as string) || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Instructor</span>
                        <span className="text-slate-700">
                          {(previewData.instructor as string) || "—"}
                        </span>
                      </div>
                      <div className="border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Team Members</span>
                        <div className="mt-1 space-y-0.5">
                          {((previewData.members as Member[]) || [])
                            .filter((m) => m.name || m.reg)
                            .map((m, i) => (
                              <div
                                key={i}
                                className="flex justify-between pl-2"
                              >
                                <span className="font-mono text-slate-500">
                                  {m.reg || "—"}
                                </span>
                                <span className="text-slate-700">
                                  {m.name || "—"}
                                </span>
                              </div>
                            ))}
                          {!((previewData.members as Member[]) || []).some(
                            (m) => m.name || m.reg,
                          ) && (
                            <span className="text-slate-400 pl-2">
                              No members added
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="text-slate-700">
                          {(previewData.dateSubmitted as string) || "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-slate-100 text-center shrink-0">
                  <p className="text-[8px] text-slate-400">
                    Generated on{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
