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
  type CoverDesignId,
} from "@/utils/docx-core";

interface PreviewSectionProps<T extends FieldValues> {
  control: Control<T>;
  docType: DocumentType;
  projectTemplate: ProjectTemplateVariant;
  coverDesign?: CoverDesignId;
  includePageNumbers: boolean;
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
  coverDesign,
  includePageNumbers,
  paused,
}: PreviewSectionProps<T>) {
  const [zoom, setZoom] = useState(0.5);
  const values = useWatch({ control });

  const prepared = prepareDocument(
    docType,
    (values ?? {}) as unknown as FormData,
    { coverDesign, includePageNumbers, projectVariant: docType === "project-report" ? projectTemplate : undefined },
  );

  return (
    <section aria-label="Document preview" className="flex min-h-[520px] w-full shrink-0 flex-col bg-background p-4 sm:p-6 md:min-h-0 md:w-1/2 md:flex-1">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div>
          <h2 className="text-sm font-semibold">Document preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">Updates as you type</p>
        </div>
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(1, Math.round((z + 0.1) * 10) / 10))}
          onZoomOut={() => setZoom((z) => Math.max(0.2, Math.round((z - 0.1) * 10) / 10))}
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
