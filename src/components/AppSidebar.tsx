import { useState } from "react";
import { Shield, BarChart3, FileText, Settings, Camera, Lock, Router } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Attack Logs", url: "/logs", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

const deviceItems = [
  { title: "IoT Camera", url: "/device/camera", icon: Camera },
  { title: "Smart Lock", url: "/device/lock", icon: Lock },
  { title: "IoT Router", url: "/device/router", icon: Router },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-primary/20 text-primary border-r-2 border-primary font-medium" 
      : "hover:bg-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary honeypot-glow" />
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">IoT HoneyNet</h2>
                <p className="text-xs text-sidebar-foreground/60">Security Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavClass(item.url)} flex items-center gap-3 p-3 rounded-lg transition-all`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Honeypot Devices */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Honeypot Devices"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {deviceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClass(item.url)} flex items-center gap-3 p-3 rounded-lg transition-all`}
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary status-online" />
                      </div>
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <div className="w-2 h-2 rounded-full bg-primary status-online" />
              <span>All systems operational</span>
            </div>
            <div className="text-xs text-sidebar-foreground/40 mt-1">
              Last scan: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}