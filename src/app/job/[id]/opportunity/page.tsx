import OpportunityReport from "../../../../views/OpportunityReport";
import { ProtectedRoute } from "../../../../components/auth/ProtectedRoute";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <ProtectedRoute>
      <OpportunityReport jobId={resolvedParams.id} />
    </ProtectedRoute>
  );
}
