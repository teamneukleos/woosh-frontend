import { cn } from "@/lib/cn";

const controlClass =
  "h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-white px-3 text-base text-[var(--text-primary)] outline-none transition duration-150 placeholder:text-[var(--text-muted)] hover:border-[rgb(20_20_18_/_0.22)] focus:border-[var(--woosh-blue)] focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-55 sm:h-9 sm:text-[0.875rem]";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlClass, className)} {...props} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(controlClass, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 min-w-0 w-full resize-y rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-white px-3 py-2.5 text-base leading-6 text-[var(--text-primary)] outline-none transition duration-150 placeholder:text-[var(--text-muted)] hover:border-[rgb(20_20_18_/_0.22)] focus:border-[var(--woosh-blue)] focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-55 sm:text-[0.875rem]",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-col gap-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}
