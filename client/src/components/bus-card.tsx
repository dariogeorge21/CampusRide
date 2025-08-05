import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Route, CheckCircle, Bus } from "lucide-react";
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
    if (bus.availableSeats <= 10) return "secondary";
    return "default";
  };

  const getSeatsText = () => {
    if (bus.availableSeats === 0) return "Full";
    return `${bus.availableSeats} seats`;
  };

  const getSeatsColor = () => {
    if (bus.availableSeats === 0) return "from-red-500 to-red-600";
    if (bus.availableSeats <= 10) return "from-amber-500 to-orange-500";
    return "from-green-500 to-emerald-600";
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 glass-card border-0 card-hover ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl scale-105' 
          : 'hover:shadow-lg'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(bus)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${isSelected ? 'from-blue-500 to-indigo-600' : 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center shadow-lg`}>
              <Bus className="text-white text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-xl text-gray-900">{bus.busNumber}</h4>
              <p className="text-sm text-muted-foreground">
                {bus.availableDates?.length || 0} dates available
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getSeatsColor()} text-white text-sm font-medium shadow-lg`}>
              {getSeatsText()}
            </div>
          </div>
        </div>
        
        {/* Route Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Route</p>
              <p className="text-sm text-blue-600 font-semibold">
                {bus.origin} → {bus.destination}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                <Clock className="text-white text-xs" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Departure</p>
                <p className="text-sm font-semibold text-green-700">{bus.departureTime}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                <Route className="text-white text-xs" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Return</p>
                <p className="text-sm font-semibold text-orange-700">{bus.returnTime}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selection Button */}
        {isSelected ? (
          <Button className="w-full btn-primary" size="lg" disabled>
            <CheckCircle className="mr-2 h-5 w-5" />
            Selected
          </Button>
        ) : (
          <Button 
            className="w-full glass-card border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-r from-white to-blue-50 text-blue-700 hover:text-blue-800 font-medium" 
            size="lg"
            disabled={disabled}
          >
            {disabled ? 'Not Available' : 'Select Route'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
