"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Trash2 } from "lucide-react";
import { updateUserRoleAction, deleteUserAction } from "./actions";

interface AdminUserActionsProps {
  userId: string;
  username: string;
  role: "admin" | "user";
  isCurrentUser: boolean;
}

export function AdminUserActions({
  userId,
  username,
  role,
  isCurrentUser,
}: AdminUserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRoleChange = (newRole: string | null) => {
    if (!newRole || newRole === role) return;

    startTransition(async () => {
      const result = await updateUserRoleAction(
        userId,
        newRole as "admin" | "user",
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success(result.message);
        setShowDeleteModal(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onValueChange={handleRoleChange}
        disabled={isPending || isCurrentUser}
      >
        <SelectTrigger className="w-28" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={isPending || isCurrentUser}
        onClick={() => setShowDeleteModal(true)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isPending}
        title="Delete User"
        description={`Are you sure you want to delete "${username}"? This will also delete their orders, reviews, and addresses. This action cannot be undone.`}
      />
    </div>
  );
}
