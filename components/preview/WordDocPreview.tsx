"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type PreviewTemplateKey =
  | "lab-report"
  | "assignment-individual"
  | "assignment-group"
  | "project-report-1"
  | "project-report-2"
  | "project-report-3";

interface WordDocPreviewProps {
  templateKey: PreviewTemplateKey;
  zoom?: number;
}

export function WordDocPreview({
  templateKey,
  zoom = 0.5,
}: WordDocPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError(null);

    try {
      const { DocxViewer } = await import("@silurus/ooxml/docx");

      const res = await fetch(
        `/api/preview-template?key=${encodeURIComponent(templateKey)}`,
      );
      if (!res.ok) throw new Error("Failed to load template");

      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();

      const viewer = new DocxViewer(canvas, {
        progressiveLayout: true,
        useGoogleFonts: true,
      });

      await viewer.load(buffer);
    } catch (e) {
      console.error("Preview error:", e);
      setError(e instanceof Error ? e.message : "Failed to render");
    } finally {
      setLoading(false);
    }
  }, [templateKey]);

  useEffect(() => {
    render();
  }, [render]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto flex items-start justify-center bg-slate-200/50 p-4">
      <canvas
        ref={canvasRef}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          maxWidth: "none",
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <span className="text-sm text-slate-500">Loading preview…</span>
        </div>
      )}
    </div>
  );
}
