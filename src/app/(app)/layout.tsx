import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "../globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vx44ai.com"),
  title: {
    default: "VX44 AI Monitoring | Your cameras see everything. Now someone's watching.",
    template: "%s | VX44 AI Monitoring",
  },
  description:
    "AI monitoring for the cameras you already own. Detect, verify, respond and report on what happens at your site.",
  openGraph: {
    title: "VX44 AI Monitoring",
    description: "Your cameras see everything. Now someone's watching.",
    url: "https://www.vx44ai.com",
    siteName: "VX44 AI Monitoring",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05080F",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
