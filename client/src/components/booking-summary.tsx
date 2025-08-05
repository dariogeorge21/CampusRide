import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Calendar, MapPin, Clock, Bus, CreditCard } from "lucide-react";
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="glass-card border-0 shadow-xl border-l-4 border-l-green-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <CreditCard className="text-white text-xl" />
          </div>
          Booking Summary
        </CardTitle>
        <p className="text-muted-foreground ml-16">Review your booking details</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bus Information Card */}
        <div className="glass-card p-6 rounded-xl border-l-4 border-l-blue-500">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bus className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedBus.busNumber}</h3>
              <p className="text-sm text-muted-foreground">College Transportation</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MapPin className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold text-blue-700">{selectedBus.origin} → {selectedBus.destination}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Clock className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold text-green-700">{selectedBus.departureTime}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Calendar className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Travel Date</p>
                  <p className="font-semibold text-purple-700">{formatDate(selectedDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Return Time</p>
                  <p className="font-semibold text-orange-700">{selectedBus.returnTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="glass-card p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
          <h4 className="text-lg font-semibold text-amber-900 mb-2">Pricing</h4>
          <div className="flex justify-between items-center">
            <span className="text-amber-800">Bus Ticket</span>
            <span className="text-2xl font-bold text-amber-900">FREE</span>
          </div>
          <p className="text-sm text-amber-700 mt-2">
            ✨ College-sponsored transportation for all students
          </p>
        </div>

        {/* Terms */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">📋 <strong>Booking Terms:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Please arrive 10 minutes before departure time</li>
            <li>• Carry your college ID for verification</li>
            <li>• Booking confirmation will be sent to your registered email</li>
            <li>• Cancellation allowed up to 2 hours before departure</li>
          </ul>
        </div>
        
        <Button 
          onClick={onConfirm}
          className="w-full btn-primary h-14 text-lg font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Confirming Your Booking...
            </>
          ) : (
            <>
              <Check className="mr-3 h-6 w-6" />
              Confirm Booking
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
