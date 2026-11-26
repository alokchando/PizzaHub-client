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
    customer:[

    ],
    admin:[

    ],
    vendor:[

    ],

}

      
export function AppSidebar() {
const {data: session,isPending} = useSession()
const role = session?.user?.role 
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarMenu>
          {menuItemsByRole[role].map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton render={<a href={project.url} />}>
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
