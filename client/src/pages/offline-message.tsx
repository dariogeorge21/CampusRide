import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface OfflineMessageProps {
  isAdminPanel?: boolean;
}

export default function OfflineMessage({ isAdminPanel = false }: OfflineMessageProps) {
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000 // Check every 30 seconds
  });

  const isOffline = (systemStatus as any)?.status === 'offline';

  // Don't show offline message in admin panel - let admins access even when offline
  if (!isOffline || isAdminPanel) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-lg w-full floating-element animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
            <AlertTriangle className="text-white text-3xl" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 gradient-text">System Under Maintenance</h3>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            We're currently updating our bus booking system to serve you better. 
            Please check back in a few minutes.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Check Again
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Expected downtime: 5-10 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
