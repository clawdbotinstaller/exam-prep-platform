interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export default function FilterButton({
  label,
  isActive,
  onClick,
  className = '',
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`font-condensed text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-all ${
        isActive
          ? 'bg-blueprint-navy text-paper-cream border-blueprint-navy'
          : 'bg-transparent text-pencil-gray border-pencil-gray/30 hover:border-blueprint-navy hover:text-blueprint-navy'
      } ${className}`}
    >
      {label}
    </button>
  );
}
