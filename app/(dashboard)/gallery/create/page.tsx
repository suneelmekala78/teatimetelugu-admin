import { GalleryForm } from "@/components/forms/gallery-form";
import { PageHeader } from "@/components/common";

export default function CreateGalleryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Gallery" />
      <GalleryForm />
    </div>
  );
}
