import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-muted"
    >
      {label}
      <input
        {...props}
        id={id}
        className={`h-11 w-full rounded-lg border border-border-control bg-surface px-4 text-base font-normal text-foreground outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:border-border disabled:bg-placeholder disabled:text-muted disabled:placeholder:text-muted disabled:opacity-100 ${className}`}
      />
    </label>
  );
}
