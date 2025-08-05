import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { GraduationCap, User, Settings } from "lucide-react";
import StudentPortal from "@/pages/student-portal";
import AdminPanel from "@/pages/admin-panel";
import OfflineMessage from "@/pages/offline-message";
import { Button } from "@/components/ui/button";

function Header({ activeTab, setActiveTab }: { 
  activeTab: 'student' | 'admin', 
  setActiveTab: (tab: 'student' | 'admin') => void 
}) {
  return (
    <header className="bg-primary text-white material-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <GraduationCap className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">St Joseph's College</h1>
              <p className="text-blue-100 text-sm">Engineering & Technology</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:text-blue-100 hover:bg-white/10 ${
                activeTab === 'student' ? 'bg-white/20' : ''
              }`}
              onClick={() => setActiveTab('student')}
            >
              <User className="mr-2 h-4 w-4" />
              Student Portal
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`text-white hover:text-blue-100 hover:bg-white/10 ${
                activeTab === 'admin' ? 'bg-white/20' : ''
              }`}
              onClick={() => setActiveTab('admin')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main>
            {activeTab === 'student' ? <StudentPortal /> : <AdminPanel />}
          </main>
          
          <OfflineMessage />
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
