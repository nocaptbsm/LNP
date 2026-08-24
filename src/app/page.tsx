// StatSkill AI — Public Landing Page

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  LineChart,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const FEATURES = [
  {
    icon: Target,
    title: "Competency Mapping",
    description:
      "Comprehensive competency profiles mapped to official statistical roles. Identify strengths and areas for development across statistical, technical, governance, and behavioural domains.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description:
      "AI-powered analysis compares current competencies against role requirements. Transparent, explainable scoring helps officials and administrators make data-driven decisions.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: BookOpen,
    title: "Personalized Learning",
    description:
      "Intelligent recommendations from iGOT Karmayogi and NSSTA catalogues. Each learning path is tailored to close the most critical skill gaps for your specific role.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Brain,
    title: "AI-Generated Assessments",
    description:
      "Upload training materials and let AI generate targeted MCQs. Trainers review and approve questions before publishing. Results feed back into competency scores.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
];

const STATS = [
  { value: "4", label: "Competency Domains", icon: Shield },
  { value: "50+", label: "Mapped Skills", icon: Zap },
  { value: "100%", label: "AI-Driven Insights", icon: LineChart },
  { value: "∞", label: "Continuous Learning", icon: TrendingUp },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Tricolour Indian Flag Top Banner Strip */}
      <div className="h-1.5 w-full flex">
        <div className="bg-[#FF9933] flex-1" />
        <div className="bg-white flex-1" />
        <div className="bg-[#138808] flex-1" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-navy flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Sign In
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/register" />}
              className="gradient-navy text-white border-0 hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-navy opacity-[0.03]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-1.5 mb-8 rounded-xl border bg-muted/40 text-xs font-semibold text-muted-foreground max-w-fit mx-auto shadow-sm">
              <span className="flex items-center gap-1.5 text-navy font-bold dark:text-amber-400">
                <Shield className="w-4 h-4 text-saffron" />
                Ministry of Statistics & Programme Implementation (MoSPI)
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-[10px] uppercase font-mono tracking-wide text-saffron font-bold">
                Mission Karmayogi
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              {APP_DESCRIPTION}
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A comprehensive platform combining competency intelligence, skill
              gap analysis, personalized learning paths, AI-powered assessments,
              and workforce analytics — built for India&apos;s Official Statistical
              System.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
                className="gradient-navy text-white border-0 hover:opacity-90 text-base px-8 py-6"
              >
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
                className="text-base px-8 py-6"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 justify-center"
              >
                <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-saffron" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Intelligent Workforce Development
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A closed-loop learning ecosystem that continuously identifies
              gaps, recommends training, assesses progress, and updates
              competency profiles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border bg-card p-8 stat-card"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Loop */}
      <section className="py-20 sm:py-28 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              The Continuous Learning Loop
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every interaction feeds back into the system, creating a
              self-improving cycle of competency development.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              { step: "01", title: "Profile & Role Assignment", desc: "Register and get mapped to your organizational role and responsibilities" },
              { step: "02", title: "Competency Assessment", desc: "Take targeted assessments to establish your current competency baseline" },
              { step: "03", title: "Skill Gap Identification", desc: "AI analyzes gaps between your current skills and role requirements" },
              { step: "04", title: "Personalized Recommendations", desc: "Receive tailored course recommendations from iGOT and NSSTA catalogues" },
              { step: "05", title: "Learning & Assessment", desc: "Complete courses and take AI-generated quizzes to validate learning" },
              { step: "06", title: "Competency Update", desc: "Scores automatically update, triggering new recommendations" },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full gradient-navy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  {i < 5 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Ready to Transform Workforce Capability?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join the platform that&apos;s modernizing capacity building for India&apos;s
            Official Statistical System.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/register" />}
            className="gradient-navy text-white border-0 hover:opacity-90 text-base px-10 py-6"
          >
            Create Your Account
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">
                  {APP_NAME}
                </div>
                <div className="text-xs text-muted-foreground">
                  Data Informatics & Innovation Division, MoSPI
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Integrated with iGOT Karmayogi · NSSTA · TPAC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
