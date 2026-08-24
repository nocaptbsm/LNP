import type { Metadata } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StatSkill AI — Skill Intelligence Platform",
    template: "%s | StatSkill AI",
  },
  description:
    "AI-Powered Skill Intelligence for India's Official Statistical Workforce. Competency mapping, personalized learning paths, AI-generated assessments, and workforce analytics.",
  keywords: [
    "StatSkill AI",
    "MoSPI",
    "competency",
    "skill gap",
    "official statistics",
    "iGOT Karmayogi",
    "AI learning",
    "workforce analytics",
  ],
  authors: [{ name: "Data Informatics & Innovation Division, MoSPI" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
