// StatSkill AI — 404 Not Found Page

import Link from "next/link";
import { BarChart3, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold font-mono text-foreground mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
            className="gradient-navy text-white border-0 hover:opacity-90 gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
