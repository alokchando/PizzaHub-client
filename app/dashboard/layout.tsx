import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full flex-1">
        <SidebarTrigger className="m-2" />
        {children}
      </main>
    </SidebarProvider>
  )
}