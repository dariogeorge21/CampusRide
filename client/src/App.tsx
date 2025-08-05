import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GraduationCap, User, Settings } from "lucide-react";
import StudentPortal from "@/pages/student-portal";
import AdminPanel from "@/pages/admin-panel";
import OfflineMessage from "@/pages/offline-message";
import { Button } from "@/components/ui/button";

function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <GraduationCap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                CampusRide
              </h1>
              <p className="text-blue-200 text-sm font-medium">St Joseph's College - Engineering & Technology</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                className={`text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 transition-all duration-300 font-medium ${
                  location === '/' 
                    ? 'bg-white/25 shadow-lg ring-2 ring-white/30' 
                    : 'hover:shadow-md'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Student Portal
              </Button>
            </Link>
            
            <Link href="/admin">
              <Button
                variant="ghost"
                size="lg"
                className={`text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 transition-all duration-300 font-medium ${
                  location === '/admin' 
                    ? 'bg-white/25 shadow-lg ring-2 ring-white/30' 
                    : 'hover:shadow-md'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin Panel
              </Button>
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-xl p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Header />
          
          <main className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            
            <Switch>
              <Route path="/">
                <div className="relative z-10">
                  <StudentPortal />
                  <OfflineMessage isAdminPanel={false} />
                </div>
              </Route>
              <Route path="/admin">
                <div className="relative z-10">
                  <AdminPanel />
                </div>
              </Route>
            </Switch>
          </main>
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
