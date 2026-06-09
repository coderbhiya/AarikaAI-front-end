import CommunityView from "@/views/CommunityView";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <CommunityView />
    </ProtectedRoute>
  );
}
