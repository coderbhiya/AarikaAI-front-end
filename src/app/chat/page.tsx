import Index from "@/views/Index";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  );
}
