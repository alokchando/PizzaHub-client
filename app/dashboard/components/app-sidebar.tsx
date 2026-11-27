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
      url: "/dashboard/customer",
      icon: LayoutDashboard,
    },
    {
      name: "My Orders",
      url: "/dashboard/customer/orders",
      icon: ShoppingBag,
    },
    {
      name: "Browse Menu",
      url: "/browse-menu",
      icon: UtensilsCrossed,
    },
    {
      name: "Profile Settings",
      url: "/dashboard/customer/settings",
      icon: Settings,
    },
  ],

  vendor: [
    {
      name: "Overview",
      url: "/dashboard/vendor",
      icon: LayoutDashboard,
    },
    {
      name: "Add Menu Item",
      url: "/dashboard/vendor/add-item",
      icon: Plus,
    },
    {
      name: "My Menu Items",
      url: "/dashboard/vendor/menu-items",
      icon: UtensilsCrossed,
    },
    {
      name: "Customer Orders",
      url: "/dashboard/vendor/orders",
      icon: ClipboardList,
    },
    {
      name: "Subscription",
      url: "/dashboard/vendor/subscription",
      icon: CreditCard,
    },
    {
      name: "Profile Settings",
      url: "/dashboard/vendor/settings",
      icon: Settings,
    },
  ],

  admin: [
    {
      name: "Overview",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Users",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Manage Menu Items",
      url: "/dashboard/admin/manage-menu-items",
      icon: UtensilsCrossed,
    },
    {
      name: "Transactions",
      url: "/dashboard/admin/transactions",
      icon: Receipt,
    },
    {
      name: "Profile Settings",
      url: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
};

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
