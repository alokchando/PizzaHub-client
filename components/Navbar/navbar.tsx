"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "@/lib/auth-client"

import {
  Loader2,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Pizza,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = session?.user
  const role = user?.role
  type UserRole = "customer" | "vendor" | "admin"
  const dashboardLinks: Record<UserRole, { label: string; href: string }> = {
    customer: {
      label: "My Orders",
      href: "/my-orders",
    },
    vendor: {
      label: "Vendor Dashboard",
      href: "/vendor-dashboard",
    },
    admin: {
      label: "Admin Dashboard",
      href: "/admin-dashboard",
    },
  }

  const dashboard =
    role && role in dashboardLinks
      ? dashboardLinks[role as UserRole]
      : undefined

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Pizza className="h-7 w-7 text-orange-500" />
          <span className="text-xl font-bold">
            Pizza<span className="text-orange-500">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-orange-500">
            Home
          </Link>

          <Link
            href="/menu"
            className="text-sm font-medium hover:text-orange-500"
          >
            Browse Menu
          </Link>

          {user && dashboard && (
            <Link
              href={dashboard.href}
              className="text-sm font-medium hover:text-orange-500"
            >
              {dashboard.label}
            </Link>
          )}
        </div>

        {/* Authentication Section */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">{user.name}</span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {dashboard && (
                  <Link href={dashboard.href}>
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}

                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:text-orange-500"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="space-y-4 border-t bg-background px-5 py-5 md:hidden">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium"
          >
            Home
          </Link>

          <Link
            href="/menu"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium"
          >
            Browse Menu
          </Link>

          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : user ? (
            <>
              {dashboard && (
                <Link
                  href={dashboard.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium"
                >
                  {dashboard.label}
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium"
              >
                Profile Settings
              </Link>

              <div className="flex items-center gap-3 border-t pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">{user.name}</span>
              </div>

              <button
                onClick={async () => {
                  await handleLogout()
                  setMobileOpen(false)
                }}
                className="flex items-center gap-2 text-sm font-medium text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 border-t pt-4">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-orange-500"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
