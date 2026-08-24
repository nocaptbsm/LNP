// StatSkill AI — Profile Edit Form (Client Component)

"use client";

import { useState } from "react";
import { Save, Loader2, User, Building2, Briefcase, FileText, Mail, Hash, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { updateProfile } from "./actions";
import type { ProfileWithDepartment, Department } from "@/types";

interface ProfileFormProps {
  profile: ProfileWithDepartment;
  departments: Department[];
}

export function ProfileForm({ profile, departments }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [designation, setDesignation] = useState(profile.designation || "");
  const [departmentId, setDepartmentId] = useState(profile.department_id || "");
  const [bio, setBio] = useState(profile.bio || "");

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        full_name: fullName,
        designation: designation || null,
        department_id: departmentId || null,
        bio: bio || null,
      });

      if (result.error) {
        toast.error("Failed to update profile", {
          description: result.error,
        });
        return;
      }

      toast.success("Profile updated successfully");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile.full_name}</h2>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={ROLE_COLORS[profile.role]}>
                  {ROLE_LABELS[profile.role]}
                </Badge>
                {profile.department && (
                  <Badge variant="outline">{profile.department.code}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profileName" className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="profileName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileDesignation" className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              Designation
            </Label>
            <Input
              id="profileDesignation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g., Statistical Officer, Data Analyst"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileDepartment" className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Department
            </Label>
            <select
              id="profileDepartment"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileBio" className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Bio
            </Label>
            <textarea
              id="profileBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description of your role and expertise..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gradient-navy text-white border-0 hover:opacity-90 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Read-only Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                Email Address
              </Label>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3 h-3" />
                Employee ID
              </Label>
              <p className="text-sm font-medium">
                {profile.employee_id || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Member Since
              </Label>
              <p className="text-sm font-medium">
                {new Date(profile.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="w-3 h-3" />
                Role
              </Label>
              <p className="text-sm font-medium">{ROLE_LABELS[profile.role]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
