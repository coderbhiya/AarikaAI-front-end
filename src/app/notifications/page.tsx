import Notification from "@/views/Notification";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <Notification />
    </ProtectedRoute>
  );
}
