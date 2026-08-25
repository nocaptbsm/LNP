// StatSkill AI — Header Component

"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import type { ProfileWithDepartment } from "@/types";

interface HeaderProps {
  profile: ProfileWithDepartment | null;
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Breadcrumb area — can be expanded later */}
      <div className="flex-1" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 h-auto py-1.5 px-2 rounded-lg hover:bg-muted transition-colors outline-none" />
          }
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="text-sm font-medium leading-none">
              {profile?.full_name || "Loading..."}
            </span>
            {profile?.role && (
              <Badge
                variant="secondary"
                className={`mt-1 text-[10px] px-1.5 py-0 h-4 ${ROLE_COLORS[profile.role]}`}
              >
                {ROLE_LABELS[profile.role]}
              </Badge>
            )}
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div>
                <div className="font-medium">{profile?.full_name}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {profile?.email}
                </div>
                {profile?.department && (
                  <div className="text-xs text-muted-foreground font-normal mt-0.5">
                    {profile.department.name}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <User className="w-4 h-4 mr-2" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
