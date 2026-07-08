"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { EmailChangeModal } from "@/components/EmailChangeModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { profileService } from "@/services/profile/profileService";
import { Calendar, LogOut, Mail, UserRound, Camera } from "lucide-react";
import { format } from "date-fns";

interface ProfileCardProps {
  user: User;
  username: string;
  setUsername: (value: string) => void;
  avatarUrl: string;
  setAvatarUrl: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  createdAt: string | null;
  isSaving: boolean;
  onSaveProfile: (username: string, email: string, avatarUrl: string) => void;
  onAvatarUploaded: (avatarUrl: string) => Promise<void>;
  onSignOut: () => void;
  onUpdateEmail?: (newEmail: string) => Promise<void>;
}

export function ProfileCard({
  user,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
  email,
  setEmail,
  createdAt,
  isSaving,
  onSaveProfile,
  onAvatarUploaded,
  onSignOut,
  onUpdateEmail,
}: ProfileCardProps) {
  const [usernameInput, setUsernameInput] = useState(username);
  const [emailInput, setEmailInput] = useState(email);
  const [avatarUrlInput, setAvatarUrlInput] = useState(avatarUrl);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when props change (e.g., after successful save)
  useEffect(() => {
    setUsernameInput(username);
    setEmailInput(email);
    setAvatarUrlInput(avatarUrl);
    // Clear preview when avatar URL changes from external source
    if (avatarUrl !== avatarUrlInput) {
      setPreviewUrl(null);
    }
  }, [username, email, avatarUrl, avatarUrlInput]);

  const handleSave = async () => {
    // Update local UI state
    setUsername(usernameInput);
    setAvatarUrl(avatarUrlInput);
    setEmail(emailInput);

    // Save profile data
    onSaveProfile(usernameInput, emailInput, avatarUrlInput);
  };

  const handleAvatarClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(
        `File size exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(
          2,
        )}MB)`,
      );
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);

      const publicUrl = await profileService.uploadAvatar(user.id, file);

      if (publicUrl) {
        // Update local state and persist to the database immediately
        setAvatarUrlInput(publicUrl);
        await onAvatarUploaded(publicUrl);
        // Clear preview since we now have the uploaded URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        toast.success("Avatar uploaded successfully");
      } else {
        throw new Error("Failed to upload avatar. Please try again later.");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Provide a user-friendly error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload avatar. Please try again later.");
      }
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Determine which image to show: preview, uploaded avatar, or fallback
  const displayImageUrl = previewUrl || avatarUrlInput || undefined;

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Hero banner */}
      <div className="from-primary/15 via-primary/5 relative bg-gradient-to-r to-transparent px-6 py-8">
        <Button
          onClick={onSignOut}
          variant="outline"
          size="sm"
          className="bg-background/80 absolute top-4 right-4 cursor-pointer backdrop-blur-sm"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign Out
        </Button>

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div
            className="group relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="ring-primary/20 h-24 w-24 ring-4">
              <AvatarImage
                src={displayImageUrl}
                className="h-24 w-24 rounded-full object-cover"
              />
              <AvatarFallback className="from-primary to-primary/80 text-primary-foreground h-24 w-24 bg-gradient-to-br text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">
              {username || "Add a username"}
            </h1>
            <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm sm:justify-start">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {createdAt && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Member since{" "}
                  {format(new Date(createdAt), "MMM yyyy")}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 font-mono text-xs">
                <UserRound className="h-3 w-3" />
                {user.id.slice(0, 8)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Account settings */}
      <CardContent className="space-y-4 pt-6">
        <h3 className="text-sm font-semibold tracking-tight">
          Account Settings
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted flex-1"
              />
              <Button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                variant="outline"
                className="cursor-pointer"
              >
                Change
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Email changes require verification
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>

      {onUpdateEmail && (
        <EmailChangeModal
          user={user}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          setEmail={setEmail}
        />
      )}
    </Card>
  );
}
