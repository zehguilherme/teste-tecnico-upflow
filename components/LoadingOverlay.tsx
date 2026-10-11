import { SpinnerIcon } from "@/components/icons/SpinnerIcon";

export function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"
    >
      <SpinnerIcon />
      <span className="text-xl font-semibold text-foreground">
        Aguarde um momento!
      </span>
    </div>
  );
}
