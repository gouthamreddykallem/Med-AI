// src/app/record/[id]/page.tsx

import Record from "@/app/components/record/Record";

export default function RecordPage({ params }: { params: { id: string } }) {
  return <Record id={params.id} filename={""} audio_url={""} extracted_text={""} created_at={""} file_path={""} />;
}