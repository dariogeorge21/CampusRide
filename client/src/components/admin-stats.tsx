import { Card, CardContent } from "@/components/ui/card";
import { Bus, Ticket, Users, MapPin } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalBuses: number;
    todayBookings: number;
    availableSeats: number;
    activeRoutes: number;
  };
}

export default function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="material-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Buses</p>
              <p className="text-3xl font-bold text-primary">{stats.totalBuses}</p>
            </div>
            <Bus className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="material-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Bookings</p>
              <p className="text-3xl font-bold text-success">{stats.todayBookings}</p>
            </div>
            <Ticket className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="material-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Seats</p>
              <p className="text-3xl font-bold text-secondary">{stats.availableSeats}</p>
            </div>
            <Users className="h-8 w-8 text-secondary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="material-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Routes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeRoutes}</p>
            </div>
            <MapPin className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
