import Reviews from "@/views/Reviews";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <Reviews />
    </ProtectedRoute>
  );
}
