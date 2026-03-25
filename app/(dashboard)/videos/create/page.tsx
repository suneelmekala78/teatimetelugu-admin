import { VideoForm } from "@/components/forms/video-form";
import { PageHeader } from "@/components/common";

export default function CreateVideoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Video" />
      <VideoForm />
    </div>
  );
}
