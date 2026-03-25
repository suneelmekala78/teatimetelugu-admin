import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  published: {
    label: "Published",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  archived: {
    label: "Archived",
    className:
      "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}
