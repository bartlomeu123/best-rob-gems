import { Checkbox } from '@/components/ui/checkbox';
import { FeatureOption } from '@/lib/gameFeatures';

interface FeatureChecklistProps {
  options: FeatureOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyLabel?: string;
  className?: string;
}

const FeatureChecklist = ({
  options,
  selectedIds,
  onToggle,
  emptyLabel = 'No features available yet.',
  className,
}: FeatureChecklistProps) => {
  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className={className ?? 'grid grid-cols-1 gap-2 sm:grid-cols-2'}>
      {options.map((feature) => (
        <label key={feature.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5 text-xs">
          <Checkbox checked={selectedIds.includes(feature.id)} onCheckedChange={() => onToggle(feature.id)} />
          <span className="text-foreground">{feature.name}</span>
        </label>
      ))}
    </div>
  );
};

export default FeatureChecklist;
