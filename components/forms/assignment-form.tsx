"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignmentSchema, AssignmentFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  GraduationCap,
  Calendar,
  Users,
  User,
  Download,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  isLoading: boolean;
}

export function AssignmentForm({ onSubmit, isLoading }: AssignmentFormProps) {
  const [isSingleMember, setIsSingleMember] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const handleToggleMemberType = (single: boolean) => {
    setIsSingleMember(single);
    setValue("isSingleMember", single);
    if (!single && fields.length === 0) {
      append({ reg: "", name: "" });
    }
  };

  return (
    <Card className="border-2 shadow-xl shadow-blue-500/5 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
                2
              </span>
              Assignment Details
            </CardTitle>
            <CardDescription>
              Fill in your assignment information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Assignment Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Assignment Information
            </h4>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Assignment Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter assignment title"
                className="h-11"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courseName" className="text-sm font-medium">
                  Course Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="courseName"
                  {...register("courseName")}
                  placeholder="e.g., Software Engineering"
                  className="h-11"
                />
                {errors.courseName && (
                  <p className="text-xs text-red-500">
                    {errors.courseName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Instructor <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  id="instructor"
                  {...register("instructor")}
                  placeholder="Instructor name"
                  className="h-11"
                />
                {errors.instructor && (
                  <p className="text-xs text-red-500">
                    {errors.instructor.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateSubmitted" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date Submitted <span className="text-red-500">*</span>
                </span>
              </Label>
              <Input
                id="dateSubmitted"
                type="date"
                {...register("dateSubmitted")}
                className="h-11"
              />
              {errors.dateSubmitted && (
                <p className="text-xs text-red-500">
                  {errors.dateSubmitted.message}
                </p>
              )}
            </div>
          </div>

          {/* Member Type Toggle */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Submission Type
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleMemberType(true)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                  isSingleMember
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    isSingleMember ? "bg-blue-100" : "bg-muted",
                  )}
                >
                  <User
                    className={cn(
                      "h-5 w-5",
                      isSingleMember
                        ? "text-blue-600"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Individual</p>
                  <p className="text-xs text-muted-foreground">Single person</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMemberType(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                  !isSingleMember
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    !isSingleMember ? "bg-blue-100" : "bg-muted",
                  )}
                >
                  <Users
                    className={cn(
                      "h-5 w-5",
                      !isSingleMember
                        ? "text-blue-600"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Group</p>
                  <p className="text-xs text-muted-foreground">
                    Multiple members
                  </p>
                </div>
              </button>
            </div>
          </div>

          {isSingleMember ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="name" className="text-sm font-medium">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your name"
                className="h-11"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Group Members <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ reg: "", name: "" })}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>
              <div className="rounded-xl border-2 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        Reg Number
                      </TableHead>
                      <TableHead className="font-semibold">
                        Member Name
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="group">
                        <TableCell className="py-2">
                          <Input
                            {...register(`members.${index}.reg`)}
                            placeholder="FA21-BSE-001"
                            className="h-10 font-mono text-sm"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            {...register(`members.${index}.name`)}
                            placeholder="Member name"
                            className="h-10"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="h-10 w-10 opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {errors.members && (
                <p className="text-xs text-red-500">{errors.members.message}</p>
              )}
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate & Download
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
