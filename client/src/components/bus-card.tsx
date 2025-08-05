import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Route } from "lucide-react";
import type { BusRoute } from "@shared/schema";

interface BusCardProps {
  bus: BusRoute;
  onSelect: (bus: BusRoute) => void;
  isSelected: boolean;
  disabled?: boolean;
}

export default function BusCard({ bus, onSelect, isSelected, disabled }: BusCardProps) {
  const getSeatsVariant = () => {
    if (bus.availableSeats === 0) return "destructive";
    if (bus.availableSeats <= 10) return "warning";
    return "success";
  };

  const getSeatsText = () => {
    if (bus.availableSeats === 0) return "Full";
    return `${bus.availableSeats} seats`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-primary bg-blue-50 dark:bg-blue-950' 
          : 'hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(bus)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-lg">{bus.busNumber}</h4>
          <Badge variant={getSeatsVariant()}>
            {getSeatsText()}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm">{bus.origin} → {bus.destination}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm">{bus.departureTime}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Route className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm">Return: {bus.returnTime}</span>
          </div>
        </div>
        
        {isSelected && (
          <Button className="w-full mt-4" size="sm">
            Selected
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
