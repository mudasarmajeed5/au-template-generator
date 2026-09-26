"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { DocxViewer } from "@silurus/ooxml/docx";
import { Loader2 } from "lucide-react";
import { generateDocxBlob } from "@/utils/docx-client";
import type { PreparedDocument } from "@/utils/docx-core";

export type { PreviewTemplateKey } from "@/utils/docx-core";

/**
 * Debounce so fast typing never triggers a render per keystroke, and wait for
 * an idle callback so document rendering never steals the main thread from
 * the form or the Download button.
 */
const RENDER_DEBOUNCE_MS = 400;

function waitForIdle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: 1200 });
    } else {
      window.setTimeout(resolve, 0);
    }
  });
}

interface WordDocPreviewProps {
  /** Fully prepared document request (template + payload + filename). */
  prepared: PreparedDocument;
  zoom?: number;
  /** While true (e.g. a download is running) no preview work is scheduled. */
  paused?: boolean;
}

export const WordDocPreview = memo(function WordDocPreview({
  prepared,
  zoom = 0.5,
  paused = false,
}: WordDocPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<DocxViewer | null>(null);
  const preparedRef = useRef(prepared);
  const renderedKeyRef = useRef<string | null>(null);
  // Serializes loads so two renders never race on the same canvas viewer.
  const loadChainRef = useRef<Promise<void>>(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  preparedRef.current = prepared;

  // The filename embeds a timestamp for project reports; it must not be part
  // of the change key or every render would look like new content.
  const dataKey = JSON.stringify([
    prepared.templateKey,
    prepared.payload,
    prepared.projectVariant ?? null,
    prepared.assignmentVariant ?? null,
  ]);

  useEffect(() => {
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (paused || dataKey === renderedKeyRef.current) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        await waitForIdle();
        if (cancelled) return;

        loadChainRef.current = loadChainRef.current.then(async () => {
          if (cancelled) return;
          setLoading(true);
          setError(null);
          try {
            const blob = await generateDocxBlob(preparedRef.current);
            if (cancelled) return;

            let viewer = viewerRef.current;
            if (!viewer) {
              const { DocxViewer } = await import("@silurus/ooxml/docx");
              const canvas = canvasRef.current;
              if (!canvas || cancelled) return;
              viewer = new DocxViewer(canvas, {
                progressiveLayout: true,
                useGoogleFonts: true,
              });
              viewerRef.current = viewer;
            }

            await viewer.load(await blob.arrayBuffer());
            if (cancelled) return;

            renderedKeyRef.current = dataKey;
          } catch (e) {
            if (cancelled) return;
            console.error("Preview error:", e);
            setError(e instanceof Error ? e.message : "Failed to render");
          } finally {
            if (!cancelled) setLoading(false);
          }
        });
      })();
    }, RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [dataKey, paused]);

  return (
    <div
      aria-busy={loading}
      className="relative h-full min-h-0 overflow-auto flex items-start justify-center rounded-lg bg-slate-200/60 p-4 dark:bg-slate-800/60"
    >
      <canvas
        ref={canvasRef}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          maxWidth: "none",
        }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/75 dark:bg-slate-950/75">
          <div
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
            role="status"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Rendering preview…
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center rounded-lg bg-white/80 dark:bg-slate-950/80">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
});
