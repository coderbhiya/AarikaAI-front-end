import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Aarika.AI",
  description: "Reset your Aarika.AI account password securely.",
};

export default function ForgotPassword() {
  return <ForgotPasswordPage />;
}
