import SubscriptionPage from "@/views/SubscriptionPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Subscription() {
  return (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  );
}
