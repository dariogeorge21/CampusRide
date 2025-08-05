import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export default function OfflineMessage() {
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000 // Check every 30 seconds
  });

  const isOffline = systemStatus?.status === 'offline';

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="text-white text-2xl" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">System Under Maintenance</h3>
          <p className="text-muted-foreground mb-6">
            We're currently updating our booking system. Please come back later.
          </p>
          
          <Button onClick={() => window.location.reload()}>
            Understood
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
