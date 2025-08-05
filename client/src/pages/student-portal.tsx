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
  collegeId: z.string().min(3, {
    message: "College ID must be at least 3 characters long"
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
    if (selectedBus && selectedBus.availableDates?.includes(date)) {
      setSelectedDate(date);
      dateForm.setValue('travelDate', date);
    }
  };

  const isDateDisabled = (date: string) => {
    if (!selectedBus || !selectedBus.availableDates) return true;
    return !selectedBus.availableDates.includes(date);
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
  const isSystemOffline = (systemStatus as any)?.status === 'offline';

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="animate-slide-up">
            <h2 className="text-5xl font-bold mb-6 text-shadow-lg">
              Student <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Portal</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Book your college transportation with ease. Fast, reliable, and always on time.
            </p>
            
            {currentStudent && (
              <div className="glass-card inline-block px-8 py-4 rounded-2xl">
                <p className="text-lg font-medium">
                  Welcome back, <span className="text-amber-400">{currentStudent.name}</span>
                </p>
                <p className="text-sm text-blue-200">ID: {currentStudent.collegeId}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-amber-400/20 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Authentication Section */}
        {!currentStudent && (
          <div className="max-w-md mx-auto animate-scale-in">
            <Card className="glass-card border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <IdCard className="text-white text-2xl" />
                </div>
                <CardTitle className="text-2xl gradient-text">Student Authentication</CardTitle>
                <p className="text-muted-foreground">Enter your college ID to get started</p>
              </CardHeader>
              <CardContent className="pt-2">
                <Form {...authForm}>
                  <form onSubmit={authForm.handleSubmit(handleAuth)} className="space-y-6">
                    <FormField
                      control={authForm.control}
                      name="collegeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">College ID</FormLabel>
                          <div className="flex gap-3">
                            <FormControl>
                              <Input 
                                placeholder="Enter your College ID" 
                                className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                                {...field} 
                              />
                            </FormControl>
                            <Button 
                              type="submit" 
                              disabled={authMutation.isPending}
                              className="btn-primary h-12 px-6"
                            >
                              {authMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ArrowRight className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground">
                            Enter your college-issued student ID (e.g., CSE2023001)
                          </p>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStudent && (
          <div className="space-y-8 animate-slide-up">
            {/* Dashboard Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card border-0 shadow-lg card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <History className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-1">
                    {(bookingHistory as any)?.bookings?.length || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0 shadow-lg card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Bus className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-1">
                    {(busRoutes as any)?.routes?.length || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Available Routes</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0 shadow-lg card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <IdCard className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-600 mb-1">Active</h3>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </CardContent>
              </Card>
            </div>

            {/* Booking History Section */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                    <History className="text-white text-lg" />
                  </div>
                  Your Booking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(bookingHistory as any)?.bookings?.length > 0 ? (
                  <div className="space-y-4">
                    {(bookingHistory as any).bookings.map((booking: any, index: number) => (
                      <div 
                        key={booking.id} 
                        className="glass-card p-6 rounded-xl border-l-4 border-l-blue-500 card-hover"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Bus className="text-white text-sm" />
                              </div>
                              <h4 className="font-semibold text-lg">{booking.busRoute?.busNumber}</h4>
                            </div>
                            <p className="text-muted-foreground">
                              {booking.busRoute?.origin} → {booking.busRoute?.destination}
                            </p>
                            <p className="text-sm font-medium text-blue-600">
                              📅 {new Date(booking.travelDate).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            {getBookingStatusBadge(booking.status)}
                            <p className="text-xs text-muted-foreground mt-2">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="text-gray-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">Start by booking your first bus ticket below!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Offline Message */}
            {isSystemOffline && (
              <Card className="glass-card border-0 shadow-xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center animate-float">
                      <Bus className="text-white text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-amber-900 mb-2">System Under Maintenance</h4>
                      <p className="text-amber-800 leading-relaxed">
                        The booking system is currently being updated to serve you better. 
                        Please check back in a few minutes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bus Booking Section */}
            {!isSystemOffline && (
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Bus className="text-white text-xl" />
                    </div>
                    Book New Ticket
                  </CardTitle>
                  <p className="text-muted-foreground ml-16">Choose your route and travel date</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Bus Selection */}
                  <div>
                    <h4 className="text-xl font-semibold mb-6 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                      Select Bus Route
                    </h4>
                    {busRoutesLoading ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse glass-card h-48 rounded-xl" />
                        ))}
                      </div>
                    ) : (busRoutes as any)?.routes?.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(busRoutes as any).routes.map((bus: BusRoute, index: number) => (
                          <div key={bus.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                            <BusCard
                              bus={bus}
                              onSelect={handleBusSelect}
                              isSelected={selectedBus?.id === bus.id}
                              disabled={bus.availableSeats === 0}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bus className="text-gray-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No routes available</h3>
                        <p className="text-muted-foreground">Check back later for available bus routes.</p>
                      </div>
                    )}
                  </div>

                  {/* Date Selection */}
                  {selectedBus && (
                    <div className="glass-card rounded-2xl p-8 animate-scale-in border-l-4 border-l-indigo-500">
                      <h4 className="text-xl font-semibold mb-6 flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                        Select Travel Date
                      </h4>
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Bus className="text-white text-lg" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-lg">{selectedBus.busNumber}</h5>
                            <p className="text-sm text-muted-foreground">
                              {selectedBus.origin} → {selectedBus.destination}
                            </p>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="text-sm font-medium text-green-600">
                              {selectedBus.availableDates?.length || 0} dates available
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedBus.availableSeats} seats left
                            </p>
                          </div>
                        </div>
                        
                        {selectedBus.availableDates && selectedBus.availableDates.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-xl">
                            {selectedBus.availableDates.map((date, index) => {
                              const dateObj = new Date(date);
                              const isToday = date === new Date().toISOString().split('T')[0];
                              const isPast = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
                              const isSelected = selectedDate === date;
                              
                              return (
                                <Button
                                  key={date}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  disabled={isPast}
                                  onClick={() => handleDateChange(date)}
                                  className={`p-4 h-auto flex flex-col space-y-1 transition-all duration-300 hover:scale-105 ${
                                    isPast ? 'opacity-50 cursor-not-allowed' : ''
                                  } ${isToday ? 'ring-2 ring-amber-400 ring-offset-2' : ''} ${
                                    isSelected ? 'btn-primary border-0' : 'glass-card border-2 border-blue-200 hover:border-blue-400'
                                  }`}
                                  style={{animationDelay: `${index * 0.05}s`}}
                                >
                                  <span className="text-base font-bold">
                                    {dateObj.getDate()}
                                  </span>
                                  <span className="text-xs">
                                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                  </span>
                                  <span className="text-xs">
                                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                  </span>
                                  {isToday && (
                                    <span className="text-xs bg-amber-400 text-amber-900 px-1 rounded font-bold">
                                      Today
                                    </span>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Bus className="text-red-500 text-xl" />
                            </div>
                            <h3 className="text-lg font-medium text-red-600 mb-2">No dates available</h3>
                            <p className="text-sm text-muted-foreground">
                              This bus route has no available travel dates at the moment.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Booking Confirmation */}
                  {selectedBus && selectedDate && (
                    <div className="animate-scale-in">
                      <h4 className="text-xl font-semibold mb-6 flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                        Confirm Booking
                      </h4>
                      <BookingSummary
                        selectedBus={selectedBus}
                        selectedDate={selectedDate}
                        onConfirm={handleBookingConfirm}
                        isLoading={bookingMutation.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
