

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, Plus, Home, User, LogOut, Hash, FolderOpen, UserCircle, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "All Polls",
    url: createPageUrl("Polls"),
    icon: Home,
  },
  {
    title: "My Polls",
    url: createPageUrl("MyPolls"),
    icon: FolderOpen,
  },
  {
    title: "Create Poll",
    url: createPageUrl("CreatePoll"),
    icon: Plus,
  },
  {
    title: "Join with Code",
    url: createPageUrl("JoinPoll"),
    icon: Hash,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setIsDarkMode(currentUser.dark_mode || false);
    }).catch(() => {});
  }, []);

  // Don't show layout on ProfileSetup page
  if (currentPageName === "ProfileSetup") {
    return children;
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full ${
        isDarkMode 
          ? 'bg-black' 
          : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <style>{`
          :root {
            --primary: 238 70% 58%;
            --primary-foreground: 0 0% 100%;
            --accent: 262 70% 60%;
          }
        `}</style>
        
        <Sidebar className={`border-r ${
          isDarkMode 
            ? 'border-slate-800 bg-slate-950/90' 
            : 'border-slate-200/60 backdrop-blur-sm'
        }`}>
          <SidebarHeader className={`border-b p-6 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200/60'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`font-bold text-lg ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>SYT</h2>
                <p className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Real-time Polling</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                            : isDarkMode ? 'text-slate-300 hover:text-slate-900' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className={`border-t p-4 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200/60'
          }`}>
            {user && (
              <div className="space-y-3">
                <Link to={createPageUrl("UserProfile")}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-900 hover:bg-slate-800' 
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>{user.full_name || user.email}</p>
                      <p className={`text-xs truncate ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>View Profile</p>
                    </div>
                    <UserCircle className={`w-4 h-4 ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                </Link>
                <button
                  onClick={() => base44.auth.logout()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-900' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className={`backdrop-blur-md border-b px-6 py-4 md:hidden sticky top-0 z-10 ${
            isDarkMode 
              ? 'bg-slate-950/80 border-slate-800' 
              : 'bg-white/80 border-slate-200/60'
          }`}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className={`p-2 rounded-xl transition-colors duration-200 ${
                isDarkMode ? 'hover:bg-slate-900' : 'hover:bg-slate-100'
              }`} />
              <h1 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>SYT</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

