import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  options: SelectOption[];
};

export function Select({
  label,
  id,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-muted"
    >
      {label}
      <select
        {...props}
        id={id}
        className={`h-11 w-full rounded-lg border border-border-control bg-surface px-4 text-base font-normal text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:border-border disabled:bg-placeholder disabled:text-muted disabled:opacity-100 ${className}`}
      >
        {options.map(({ label: optionLabel, value }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
