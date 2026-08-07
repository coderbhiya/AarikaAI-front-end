import AgentDashboard from "@/views/AgentDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <AgentDashboard />
    </ProtectedRoute>
  );
}
