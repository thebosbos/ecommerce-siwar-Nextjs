"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileCard } from "@/components/ProfileCard";
import { OrderCard } from "@/components/OrderCard";
import { EmptyOrdersState } from "@/components/EmptyOrdersState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { OrderType, ProfileType } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  subscribeToUserOrders,
  unsubscribeFromUserOrders,
  type OrderSubscriptionCallbacks,
} from "@/services/order/orderSubscriptionService";
import {
  subscribeToUserProfile,
  unsubscribeFromUserProfile,
  type ProfileSubscriptionCallbacks,
} from "@/services/profile/profileSubscriptionService";

interface ProfileClientPageProps {
  initialProfile: ProfileType | null;
  initialOrders: OrderType[];
  user: User;
}

export default function ProfileClientPage({
  initialProfile,
  initialOrders,
  user,
}: ProfileClientPageProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  // Initialize state with server-fetched data
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [email, setEmail] = useState(initialProfile?.email || user.email || "");
  const [orders, setOrders] = useState<OrderType[]>(initialOrders);
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving profile data
  const handleSaveProfile = async (
    usernameInput: string,
    emailInput: string,
    avatarUrlInput: string,
  ) => {
    try {
      setIsSaving(true);

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          username: usernameInput,
          email: emailInput,
          avatar_url: avatarUrlInput,
        })
        .eq("profile_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setUsername(updatedProfile.username || "");
      setEmail(updatedProfile.email || "");
      setAvatarUrl(updatedProfile.avatar_url || "");

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a handler for auth email updates
  const handleUpdateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success(
        "Verification email sent! Please check your inbox and click the verification link.",
      );
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update email",
      );
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Remove order from state immediately after deletion (optimistic UI)
  //the UI is updated immediately without waiting for the server to confirm the deletion
  const handleOrderDeleted = (deletedOrderId: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== deletedOrderId));
  };

  // Subscribe to realtime updates
  useEffect(() => {
    let orderSubscription: RealtimeChannel | null = null;
    let profileSubscription: RealtimeChannel | null = null;

    const setupSubscriptions = async () => {
      try {
        // Order subscription callbacks
        const orderCallbacks: OrderSubscriptionCallbacks = {
          onOrderUpdate: (order: OrderType) => {
            setOrders((prevOrders) => {
              const index = prevOrders.findIndex((o) => o.id === order.id);
              if (index !== -1) {
                // Replace existing order with updated data
                const updated = [...prevOrders];
                updated[index] = { ...updated[index], ...order };
                return updated;
              }
              // If order not found, don't add it (should not happen for updates)
              return prevOrders;
            });
          },
          onOrderDelete: (order: OrderType) => {
            setOrders((prevOrders) =>
              prevOrders.filter((o) => o.id !== order.id),
            );
          },
        };

        // Profile subscription callbacks
        const profileCallbacks: ProfileSubscriptionCallbacks = {
          onProfileUpdate: (profile: ProfileType) => {
            setUsername(profile.username || "");
            setEmail(profile.email || "");
            setAvatarUrl(profile.avatar_url || "");
          },
        };

        // Setup subscriptions
        orderSubscription = subscribeToUserOrders(user.id, orderCallbacks);
        profileSubscription = subscribeToUserProfile(user.id, profileCallbacks);
      } catch (error) {
        console.error("Error setting up subscriptions:", error);
      }
    };

    setupSubscriptions();

    return () => {
      try {
        unsubscribeFromUserOrders(orderSubscription);
        unsubscribeFromUserProfile(profileSubscription);
      } catch (error) {
        console.error("Error cleaning up subscriptions:", error);
      }
    };
  }, [user.id]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) =>
      ["pending", "processing"].includes(o.status),
    ).length;

    return { totalOrders, totalSpent, pendingOrders };
  }, [orders]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <ProfileCard
        user={user}
        username={username}
        setUsername={setUsername}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        email={email}
        setEmail={setEmail}
        createdAt={initialProfile?.created_at || null}
        isSaving={isSaving}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
        onUpdateEmail={handleUpdateEmail}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyOrdersState onBrowseProducts={() => router.push("/shop")} />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDelete={handleOrderDeleted}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
