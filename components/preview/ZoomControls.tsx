import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded p-2 transition-colors hover:bg-slate-100 sm:p-1.5 dark:hover:bg-slate-700"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </button>
      <span className="w-12 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded p-2 transition-colors hover:bg-slate-100 sm:p-1.5 dark:hover:bg-slate-700"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </button>
      <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-600" />
      <button
        type="button"
        onClick={onReset}
        className="rounded p-2 transition-colors hover:bg-slate-100 sm:p-1.5 dark:hover:bg-slate-700"
        title="Reset zoom"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </button>
    </div>
  );
}
