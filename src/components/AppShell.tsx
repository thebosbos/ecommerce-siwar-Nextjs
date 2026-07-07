"use client";

import Sidebar from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MainLayout } from "@/components/MainLayout";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAdmin } from "@/hooks/useAdmin";

interface AppShellProps {
  children: React.ReactNode;
}

// Only admins get the app sidebar (categories + admin nav); everyone else
// just gets the top navbar.
export function AppShell({ children }: AppShellProps) {
  const { isAdmin } = useAdmin();

  return (
    <SidebarProvider>
      {isAdmin && <Sidebar />}
      <SidebarInset>
        <Navbar />
        <MainLayout>{children}</MainLayout>
      </SidebarInset>
    </SidebarProvider>
  );
}
