import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "AarikaAI",
  description: "AarikaAI platform",
  icons: {
    icon: "/aarika-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
