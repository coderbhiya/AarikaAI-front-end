import { Suspense } from "react";
import OpenJobs from "@/views/OpenJobs";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading jobs...</div>}>
      <OpenJobs />
    </Suspense>
  );
}
