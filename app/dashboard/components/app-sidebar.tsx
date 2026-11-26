"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Plus,
  ClipboardList,
  CreditCard,
  Users,
  ShoppingBag,
  Receipt,
  Settings,
  Store,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useSession } from "@/lib/auth-client"

const menuItemsByRole = {
  customer: [
    {
      name: "Overview",
      url: "/customer/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Orders",
      url: "/customer/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      name: "Browse Menu",
      url: "/browse-menu",
      icon: UtensilsCrossed,
    },
    {
      name: "Profile Settings",
      url: "/customer/dashboard/settings",
      icon: Settings,
    },
  ],

  vendor: [
    {
      name: "Overview",
      url: "/vendor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Add Menu Item",
      url: "/vendor/dashboard/add-item",
      icon: Plus,
    },
    {
      name: "My Menu Items",
      url: "/vendor/dashboard/menu-items",
      icon: UtensilsCrossed,
    },
    {
      name: "Customer Orders",
      url: "/vendor/dashboard/orders",
      icon: ClipboardList,
    },
    {
      name: "Subscription",
      url: "/vendor/dashboard/subscription",
      icon: CreditCard,
    },
    {
      name: "Profile Settings",
      url: "/vendor/dashboard/settings",
      icon: Settings,
    },
  ],

  admin: [
    {
      name: "Overview",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Users",
      url: "/admin/dashboard/users",
      icon: Users,
    },
    {
      name: "Manage Menu Items",
      url: "/admin/dashboard/menu-items",
      icon: UtensilsCrossed,
    },
    {
      name: "Transactions",
      url: "/admin/dashboard/transactions",
      icon: Receipt,
    },
    {
      name: "Profile Settings",
      url: "/admin/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar() {
  const { data: session, isPending } = useSession()

  const role = session?.user?.role

  if (isPending) return null

  if (!role || !(role in menuItemsByRole)) return null

  const menuItems = menuItemsByRole[role as keyof typeof menuItemsByRole]

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Store className="size-6 text-primary" />
          <span className="text-xl font-bold">PizzaHub</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="mb-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
            {role} dashboard
          </div>

          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <Link href={item.url}>
                  <SidebarMenuButton tooltip={item.name}>
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <User className="size-5 text-muted-foreground" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {session?.user?.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
