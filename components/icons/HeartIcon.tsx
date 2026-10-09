type HeartIconProps = {
  filled?: boolean;
};

export function HeartIcon({ filled = false }: HeartIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.8 8.7c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
      />
    </svg>
  );
}
