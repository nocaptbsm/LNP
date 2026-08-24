// StatSkill AI — Profile Page

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileWithDepartment, Department } from "@/types";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile with department
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("id", user.id)
    .single();

  // Fetch all departments for the dropdown
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and organizational details
        </p>
      </div>

      <ProfileForm
        profile={profile as unknown as ProfileWithDepartment}
        departments={(departments as unknown as Department[]) || []}
      />
    </div>
  );
}
