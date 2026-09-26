"use client";

import { memo, useState } from "react";
import { useWatch, type Control, type FieldValues } from "react-hook-form";
import { ZoomControls } from "./ZoomControls";
import { WordDocPreview } from "./WordDocPreview";
import {
  prepareDocument,
  type DocumentType,
  type FormData,
  type ProjectTemplateVariant,
} from "@/utils/docx-core";

interface PreviewSectionProps<T extends FieldValues> {
  control: Control<T>;
  docType: DocumentType;
  projectTemplate: ProjectTemplateVariant;
  /** Paused while a download is running so preview work never delays it. */
  paused: boolean;
}

/**
 * Isolated, memoized preview panel: form keystrokes re-render only this
 * subtree (via `useWatch`), never the whole page, and the expensive document
 * render inside `WordDocPreview` is debounced + idle-scheduled.
 */
function PreviewSectionInner<T extends FieldValues>({
  control,
  docType,
  projectTemplate,
  paused,
}: PreviewSectionProps<T>) {
  const [zoom, setZoom] = useState(0.5);
  const values = useWatch({ control });

  const prepared = prepareDocument(
    docType,
    (values ?? {}) as unknown as FormData,
    docType === "project-report" ? { projectVariant: projectTemplate } : undefined,
  );

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col bg-slate-100 p-4 sm:p-6 md:w-1/2 dark:bg-slate-900">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase sm:text-sm dark:text-slate-400">
          <span className="font-extrabold">Preview</span> - Final output may
          vary.
        </h3>
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(1, z + 0.1))}
          onZoomOut={() => setZoom((z) => Math.max(0.2, z - 0.1))}
          onReset={() => setZoom(0.5)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg">
        <WordDocPreview prepared={prepared} zoom={zoom} paused={paused} />
      </div>
    </section>
  );
}

export const PreviewSection = memo(PreviewSectionInner) as typeof PreviewSectionInner;
