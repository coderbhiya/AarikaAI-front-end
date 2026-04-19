import SkillScore from "@/views/SkillScore";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
export default function Page() {
  return (
    <ProtectedRoute>
      <SkillScore />
    </ProtectedRoute>
  );
}
