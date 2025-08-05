import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { BusRoute } from "@shared/schema";

interface BookingSummaryProps {
  selectedBus: BusRoute;
  selectedDate: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function BookingSummary({ 
  selectedBus, 
  selectedDate, 
  onConfirm,
  isLoading 
}: BookingSummaryProps) {
  return (
    <Card className="border-primary bg-blue-50 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="text-primary">Booking Summary</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Bus Number</p>
            <p className="font-medium">{selectedBus.busNumber}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Route</p>
            <p className="font-medium">{selectedBus.origin} → {selectedBus.destination}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Travel Date</p>
            <p className="font-medium">{selectedDate}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Departure Time</p>
            <p className="font-medium">{selectedBus.departureTime}</p>
          </div>
        </div>
        
        <Button 
          onClick={onConfirm}
          className="w-full"
          disabled={isLoading}
        >
          <Check className="mr-2 h-4 w-4" />
          {isLoading ? "Confirming..." : "Confirm Booking"}
        </Button>
      </CardContent>
    </Card>
  );
}
