export function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      fill="none"
      className="size-20 motion-safe:animate-spin motion-reduce:animate-none"
    >
      <circle
        cx="40"
        cy="40"
        r="34"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="6"
        className="text-foreground"
      />
      <path
        d="M40 6a34 34 0 0 1 34 34"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
        className="text-primary"
      />
    </svg>
  );
}
