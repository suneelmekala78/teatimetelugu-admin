import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  createHref,
  createLabel = "Create",
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {createHref && (
        <Button
          nativeButton={false}
          render={<Link href={createHref} />}
          className="shadow-sm shadow-primary/20"
        >
            <Plus className="h-4 w-4 mr-2" />
            {createLabel}
        </Button>
      )}
      {action}
    </div>
  );
}
