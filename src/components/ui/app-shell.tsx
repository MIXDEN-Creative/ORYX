import { cn } from "@/lib/utils";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {(title || subtitle || actions) && (
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              {title ? (
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}