import { NewsForm } from "@/components/forms";
import { PageHeader } from "@/components/common";

export default function CreateNewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Create News Article" />
      <NewsForm />
    </div>
  );
}
