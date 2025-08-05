import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { IdCard, History, Bus, ArrowRight } from "lucide-react";
import BusCard from "@/components/bus-card";
import BookingSummary from "@/components/booking-summary";
import type { Student, BusRoute } from "@shared/schema";

const collegeIdSchema = z.object({
  collegeId: z.string().regex(/^SJCET\d{7}$/, {
    message: "College ID must be in format SJCET followed by 7 digits (e.g., SJCET2024001)"
  })
});

const bookingSchema = z.object({
  travelDate: z.string().min(1, "Please select a travel date")
});

export default function StudentPortal() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const { toast } = useToast();

  // College ID form
  const authForm = useForm<z.infer<typeof collegeIdSchema>>({
    resolver: zodResolver(collegeIdSchema),
    defaultValues: { collegeId: "" }
  });

  // Date selection form
  const dateForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { travelDate: "" }
  });

  // Queries
  const { data: busRoutes, isLoading: busRoutesLoading } = useQuery({
    queryKey: ['/api/bus-routes'],
    enabled: !!currentStudent
  });

  const { data: bookingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/student', currentStudent?.collegeId, 'bookings'],
    enabled: !!currentStudent?.collegeId
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status']
  });

  // Mutations
  const authMutation = useMutation({
    mutationFn: async (data: z.infer<typeof collegeIdSchema>) => {
      const response = await apiRequest('POST', '/api/student/auth', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentStudent(data.student);
        queryClient.invalidateQueries({ queryKey: ['/api/bus-routes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/student', data.student.collegeId, 'bookings'] });
        toast({
          title: "Authentication Successful",
          description: "Welcome to the bus booking system!"
        });
      }
    },
    onError: () => {
      toast({
        title: "Authentication Failed",
        description: "Please check your college ID format.",
        variant: "destructive"
      });
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Booking Confirmed!",
          description: "Your bus ticket has been booked successfully."
        });
        setSelectedBus(null);
        setSelectedDate("");
        dateForm.reset();
        refetchHistory();
        queryClient.invalidateQueries({ queryKey: ['/api/bus-routes'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book ticket. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAuth = (data: z.infer<typeof collegeIdSchema>) => {
    authMutation.mutate(data);
  };

  const handleBusSelect = (bus: BusRoute) => {
    setSelectedBus(bus);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    dateForm.setValue('travelDate', date);
  };

  const handleBookingConfirm = () => {
    if (!currentStudent || !selectedBus || !selectedDate) return;

    const bookingData = {
      studentId: currentStudent.id,
      busRouteId: selectedBus.id,
      travelDate: selectedDate,
      status: "confirmed"
    };

    bookingMutation.mutate(bookingData);
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if system is offline
  const isSystemOffline = systemStatus?.status === 'offline';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="primary-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Bus Pass Booking System</h2>
          <p className="text-xl text-blue-100">Book your college transportation easily and efficiently</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* College ID Entry Section */}
        <Card className="material-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <IdCard className="text-primary mr-3" />
              Student Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Form {...authForm}>
                <form onSubmit={authForm.handleSubmit(handleAuth)} className="space-y-4">
                  <FormField
                    control={authForm.control}
                    name="collegeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College ID</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Enter College ID (e.g., SJCET2024001)" 
                              {...field} 
                            />
                          </FormControl>
                          <Button 
                            type="submit" 
                            disabled={authMutation.isPending}
                            size="icon"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          Format: SJCET followed by year and roll number
                        </p>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        {currentStudent && (
          <>
            {/* Booking History Section */}
            <Card className="material-shadow mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="text-secondary mr-3" />
                  Your Booking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingHistory?.bookings?.length > 0 ? (
                  <div className="space-y-3">
                    {bookingHistory.bookings.map((booking: any) => (
                      <div key={booking.id} className="border-l-4 border-success bg-green-50 dark:bg-green-950 p-4 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {booking.busRoute?.busNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.busRoute?.origin} → {booking.busRoute?.destination}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {booking.travelDate}
                            </p>
                          </div>
                          {getBookingStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bookings found. Book your first ticket below!</p>
                )}
              </CardContent>
            </Card>

            {/* System Offline Message */}
            {isSystemOffline && (
              <Card className="material-shadow mb-8 border-warning bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Bus className="text-warning mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">System Offline</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        The booking system is currently under maintenance. Please come back later.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bus Booking Section */}
            {!isSystemOffline && (
              <Card className="material-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="text-primary mr-3" />
                    Book New Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Bus Selection */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Select Bus Route</h4>
                    {busRoutesLoading ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
                        ))}
                      </div>
                    ) : busRoutes?.routes?.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {busRoutes.routes.map((bus: BusRoute) => (
                          <BusCard
                            key={bus.id}
                            bus={bus}
                            onSelect={handleBusSelect}
                            isSelected={selectedBus?.id === bus.id}
                            disabled={bus.availableSeats === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No bus routes available at the moment.</p>
                    )}
                  </div>

                  {/* Date Selection */}
                  {selectedBus && (
                    <div className="bg-muted rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold mb-4">Select Travel Date</h4>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full md:w-auto"
                      />
                    </div>
                  )}

                  {/* Booking Confirmation */}
                  {selectedBus && selectedDate && (
                    <BookingSummary
                      selectedBus={selectedBus}
                      selectedDate={selectedDate}
                      onConfirm={handleBookingConfirm}
                      isLoading={bookingMutation.isPending}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
