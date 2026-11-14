import CareerDiscovery from "@/views/CareerDiscovery";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <CareerDiscovery />
    </ProtectedRoute>
  );
}
