"use client";
import {
  ShoppingCart,
  Moon,
  Sun,
  User,
  LogIn,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/queries";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { data: categories } = useCategories();
  const router = useRouter();

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  // Show every category in the nav; visiting a restricted one while signed
  // out still redirects to sign-in at the page level.
  const displayCategories = categories || [];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 z-60 w-full border-b backdrop-blur">
      <div className="mx-4 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 justify-self-start">
          {isAdmin && (
            <SidebarTrigger className="hover:bg-muted/50 transition-colors duration-200" />
          )}
          <Link href="/" className="flex cursor-pointer items-center">
            <h1 className="text-2xl font-bold">Glow&Home</h1>
          </Link>
        </div>

        <div className="hidden items-center gap-1 justify-self-center sm:flex">
          <Link href="/">
            <Button variant="ghost" className="cursor-pointer">
              Home
            </Button>
          </Link>

          {displayCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="cursor-pointer">
                    Categories
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {displayCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() =>
                      router.push(`/${category.name.toLowerCase()}`)
                    }
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center justify-self-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 cursor-pointer"
                  >
                    <User className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Account menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={() => router.push("/signup")}
            >
              <LogIn className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Sign in</span>
            </Button>
          )}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 cursor-pointer"
            >
              <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-medium">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
