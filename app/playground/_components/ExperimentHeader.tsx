interface ExperimentHeaderProps {
  title: string;
  subtitle: string;
}

export function ExperimentHeader({ title, subtitle }: ExperimentHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 pb-8 w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-bold text-center">{title}</h1>
      <span className="text-xs font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400 text-center">
        {subtitle}
      </span>
    </div>
  );
}
