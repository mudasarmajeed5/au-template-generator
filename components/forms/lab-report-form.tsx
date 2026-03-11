"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labReportSchema, LabReportFormData } from "@/lib/schemas";
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
  Loader2,
  FlaskConical,
  Download,
  User,
  Hash,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";

interface LabReportFormProps {
  onSubmit: (data: LabReportFormData) => Promise<void>;
  isLoading: boolean;
}

export function LabReportForm({ onSubmit, isLoading }: LabReportFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LabReportFormData>({
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

  return (
    <Card className="border-2 shadow-xl shadow-emerald-500/5 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">
                2
              </span>
              Lab Report Details
            </CardTitle>
            <CardDescription>
              Fill in your lab report information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your name"
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    Roll Number <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  id="rollNumber"
                  {...register("rollNumber")}
                  placeholder="e.g., FA21-BSE-001"
                  className="h-11 font-mono"
                />
                {errors.rollNumber && (
                  <p className="text-xs text-red-500">
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Info Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Course Details
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courseName" className="text-sm font-medium">
                  Course Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="courseName"
                  {...register("courseName")}
                  placeholder="e.g., Data Structures Lab"
                  className="h-11"
                />
                {errors.courseName && (
                  <p className="text-xs text-red-500">
                    {errors.courseName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="labWeek" className="text-sm font-medium">
                  Lab Week
                </Label>
                <Input
                  id="labWeek"
                  {...register("labWeek")}
                  placeholder="e.g., Week 5"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Submission Info Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Submission Details
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-sm font-medium">
                  Instructor
                </Label>
                <Input
                  id="instructor"
                  {...register("instructor")}
                  placeholder="Instructor name"
                  className="h-11"
                />
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
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
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
