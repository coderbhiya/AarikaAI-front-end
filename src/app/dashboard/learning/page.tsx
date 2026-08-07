import MyLearning from "@/views/MyLearning";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <MyLearning />
    </ProtectedRoute>
  );
}
