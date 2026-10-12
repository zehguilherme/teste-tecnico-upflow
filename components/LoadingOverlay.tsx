import { SpinnerIcon } from "@/components/icons/SpinnerIcon";

export function LoadingOverlay({ inline = false }: { inline?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none flex flex-col items-center justify-center gap-5 bg-background ${inline ? "min-h-64" : "fixed inset-0 z-50"}`}
    >
      <SpinnerIcon />
      <span className="text-xl font-semibold text-foreground">
        Aguarde um momento!
      </span>
    </div>
  );
}
