import "./globals.css";
import { Providers } from "@/components/providers";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata = {
  title: "AarikaAI",
  description: "AarikaAI platform",
  icons: {
    icon: "/aarika-logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ChunkLoadError')) {
                  const reloadCount = parseInt(sessionStorage.getItem('chunkLoadErrorCount') || '0');
                  if (reloadCount < 3) {
                    sessionStorage.setItem('chunkLoadErrorCount', String(reloadCount + 1));
                    window.location.reload();
                  }
                }
              });
              // Clear the counter on successful load
              window.addEventListener('load', function() {
                sessionStorage.removeItem('chunkLoadErrorCount');
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
