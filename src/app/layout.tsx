import type { Metadata } from "next";
import { Inter, Style_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const styleScript = Style_Script({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-style-script"
});

export const metadata: Metadata = {
  title: "Solace Candidate Assignment",
  description: "Show us what you got",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${styleScript.variable}`}>{children}</body>
    </html>
  );
}
