"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/queries";

export function Footer() {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background border-t">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 space-y-2 sm:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-bold">Glow&Home</h2>
          <p className="text-muted-foreground max-w-xs text-sm">
            Quality electronics, clothing, and accessories curated for your
            everyday life.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                className="hover:text-foreground transition-colors"
              >
                All Products
              </Link>
            </li>
            {(categories || []).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${category.name.toLowerCase()}`}
                  className="hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link
                href="/cart"
                className="hover:text-foreground transition-colors"
              >
                Cart
              </Link>
            </li>
            {user ? (
              <li>
                <Link
                  href="/profile"
                  className="hover:text-foreground transition-colors"
                >
                  My Profile
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/signin"
                    className="hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-foreground transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">About</h3>
          <p className="text-muted-foreground text-sm">
            Built with care to make everyday shopping simple and reliable.
          </p>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="text-muted-foreground container mx-auto px-4 py-4 text-center text-xs">
          &copy; {year} Glow&Home. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
