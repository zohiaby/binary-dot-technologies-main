export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-muted sm:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}
