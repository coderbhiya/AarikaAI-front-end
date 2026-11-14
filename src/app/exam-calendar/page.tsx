import ExamCalendar from "@/views/ExamCalendar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <ExamCalendar />
    </ProtectedRoute>
  );
}
