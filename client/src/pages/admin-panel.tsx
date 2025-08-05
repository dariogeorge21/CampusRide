import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, Plus, Edit, Trash2, Save } from "lucide-react";
import AdminStats from "@/components/admin-stats";
import type { BusRoute } from "@shared/schema";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const busRouteSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  totalSeats: z.number().min(1, "Total seats must be at least 1"),
  availableSeats: z.number().min(0, "Available seats cannot be negative"),
  departureTime: z.string().min(1, "Departure time is required"),
  returnTime: z.string().min(1, "Return time is required"),
  isActive: z.boolean().default(true),
});

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');
  const { toast } = useToast();

  // Forms
  const loginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: "", password: "" }
  });

  const busRouteForm = useForm<z.infer<typeof busRouteSchema>>({
    resolver: zodResolver(busRouteSchema),
    defaultValues: {
      busNumber: "",
      origin: "",
      destination: "",
      totalSeats: 40,
      availableSeats: 40,
      departureTime: "",
      returnTime: "",
      isActive: true
    }
  });

  // Queries
  const { data: busRoutes, refetch: refetchRoutes } = useQuery({
    queryKey: ['/api/admin/bus-routes'],
    enabled: isAuthenticated
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/admin/bookings'],
    enabled: isAuthenticated
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated
  });

  const { data: currentSystemStatus, refetch: refetchSystemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setSystemStatus(data.status as 'online' | 'offline');
    }
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminLoginSchema>) => {
      const response = await apiRequest('POST', '/api/admin/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsAuthenticated(true);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard"
        });
      }
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    }
  });

  const createBusRouteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof busRouteSchema>) => {
      const response = await apiRequest('POST', '/api/admin/bus-routes', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bus Route Created",
          description: "New bus route has been added successfully"
        });
        busRouteForm.reset();
        refetchRoutes();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bus route",
        variant: "destructive"
      });
    }
  });

  const deleteBusRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/bus-routes/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bus Route Deleted",
        description: "Bus route has been removed successfully"
      });
      refetchRoutes();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bus route",
        variant: "destructive"
      });
    }
  });

  const systemStatusMutation = useMutation({
    mutationFn: async (status: 'online' | 'offline') => {
      const response = await apiRequest('POST', '/api/admin/system/status', { status });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSystemStatus(data.status);
        toast({
          title: "System Status Updated",
          description: `System is now ${data.status}`
        });
        refetchSystemStatus();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update system status",
        variant: "destructive"
      });
    }
  });

  const handleLogin = (data: z.infer<typeof adminLoginSchema>) => {
    loginMutation.mutate(data);
  };

  const handleCreateBusRoute = (data: z.infer<typeof busRouteSchema>) => {
    createBusRouteMutation.mutate(data);
  };

  const handleDeleteBusRoute = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus route?')) {
      deleteBusRouteMutation.mutate(id);
    }
  };

  const handleToggleSystemStatus = () => {
    const newStatus = systemStatus === 'online' ? 'offline' : 'online';
    systemStatusMutation.mutate(newStatus);
  };

  const getStatusBadge = (status: string) => {
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

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md material-shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white text-2xl" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground">Enter administrator credentials</p>
          </CardHeader>
          
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@sjcet.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-950 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">System Status:</span>
                <Button
                  variant={systemStatus === 'online' ? 'success' : 'destructive'}
                  size="sm"
                  onClick={handleToggleSystemStatus}
                  disabled={systemStatusMutation.isPending}
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  {systemStatus === 'online' ? 'Online' : 'Offline'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Status Alert */}
        {systemStatus === 'offline' && (
          <Card className="mb-6 border-warning bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="text-warning mr-3" />
                <div>
                  <h4 className="font-medium">System Offline</h4>
                  <p className="text-muted-foreground">Students will see "Come back later" message for new bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {stats?.stats && (
          <div className="mb-8">
            <AdminStats stats={stats.stats} />
          </div>
        )}

        {/* Bus Management */}
        <Card className="material-shadow mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bus Route Management</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Add Bus Form */}
            <Card className="bg-muted mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Bus Route</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...busRouteForm}>
                  <form onSubmit={busRouteForm.handleSubmit(handleCreateBusRoute)}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <FormField
                        control={busRouteForm.control}
                        name="busNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bus Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., BUS-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Tambaram" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., SJCET Campus" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="totalSeats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Seats</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="40" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="availableSeats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Seats</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="40" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="departureTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departure Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={busRouteForm.control}
                        name="returnTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createBusRouteMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createBusRouteMutation.isPending ? "Creating..." : "Create Route"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Bus Routes Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus Number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busRoutes?.routes?.map((route: BusRoute) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.busNumber}</TableCell>
                      <TableCell>{route.origin} → {route.destination}</TableCell>
                      <TableCell>{route.availableSeats}/{route.totalSeats}</TableCell>
                      <TableCell className="text-sm">
                        {route.departureTime} - {route.returnTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant={route.isActive ? "success" : "destructive"}>
                          {route.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteBusRoute(route.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="material-shadow">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Booking Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.bookings?.slice(0, 10).map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.student?.collegeId || booking.studentId}
                      </TableCell>
                      <TableCell>{booking.busRoute?.busNumber}</TableCell>
                      <TableCell>{booking.travelDate}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(booking.bookingTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
