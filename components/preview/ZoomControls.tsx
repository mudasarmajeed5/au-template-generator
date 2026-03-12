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
    <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border p-1">
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 rounded hover:bg-slate-100 transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4 text-slate-600" />
      </button>
      <span className="text-xs font-medium text-slate-600 w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 rounded hover:bg-slate-100 transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4 text-slate-600" />
      </button>
      <div className="w-px h-4 bg-slate-200 mx-1" />
      <button
        type="button"
        onClick={onReset}
        className="p-1.5 rounded hover:bg-slate-100 transition-colors"
        title="Reset zoom"
      >
        <RotateCcw className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  );
}
