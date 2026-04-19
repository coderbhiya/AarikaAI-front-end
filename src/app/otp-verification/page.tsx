import OTPVerification from "@/components/auth/OTPVerification";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <OTPVerification />
    </ProtectedRoute>
  );
}
