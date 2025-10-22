import { useEffect, useState } from 'react';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, User, FileText, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  symptoms: string;
  prescription: string | null;
  meet_link: string | null;
  doctor_id: string;
  doctors: {
    specialization: string;
    profiles: {
      full_name: string;
    };
  };
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const doctorIds = data.map(a => a.doctor_id);
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('id, user_id, specialization')
          .in('id', doctorIds);

        if (doctorsData) {
          const userIds = doctorsData.map(d => d.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          const appointmentsWithDoctors = data.map(appointment => {
            const doctor = doctorsData.find(d => d.id === appointment.doctor_id);
            const profile = profilesData?.find(p => p.user_id === doctor?.user_id);
            
            return {
              ...appointment,
              doctors: {
                specialization: doctor?.specialization || 'Unknown',
                profiles: {
                  full_name: profile?.full_name || 'Unknown'
                }
              }
            };
          });

          setAppointments(appointmentsWithDoctors as Appointment[]);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully"
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <RoleProtectedRoute allowedRole="patient">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRole="patient">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
              <p className="text-muted-foreground">View and manage your appointments</p>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No appointments found</p>
                  <Button onClick={() => window.location.href = '/doctors'}>
                    Find a Doctor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dr. {appointment.doctors.profiles.full_name}
                          </CardTitle>
                          <CardDescription>
                            {appointment.doctors.specialization}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Your Symptoms</Label>
                        <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                          {appointment.symptoms}
                        </p>
                      </div>

                      {appointment.prescription && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Prescription</Label>
                          <p className="text-sm text-muted-foreground border rounded-md p-3 bg-primary/5">
                            {appointment.prescription}
                          </p>
                        </div>
                      )}

                      {appointment.meet_link && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Meeting Link</Label>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(appointment.meet_link!, '_blank')}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Join Google Meet
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'pending' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelAppointment(appointment.id)}
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleProtectedRoute>
  );
}
