import { useEffect, useState } from 'react';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, User, Phone, FileText, Video, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  symptoms: string;
  prescription: string | null;
  meet_link: string | null;
  patient_id: string;
  profiles: {
    full_name: string;
    age: number;
    gender: string;
    phone: string;
  };
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescription, setPrescription] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorData) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const patientIds = data.map(a => a.patient_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, age, gender, phone')
          .in('user_id', patientIds);

        const appointmentsWithProfiles = data.map(appointment => ({
          ...appointment,
          profiles: profilesData?.find(p => p.user_id === appointment.patient_id) || {
            full_name: 'Unknown',
            age: 0,
            gender: 'Unknown',
            phone: ''
          }
        }));

        setAppointments(appointmentsWithProfiles as Appointment[]);
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

  const updateStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment status updated"
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const savePrescription = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          prescription,
          meet_link: meetLink 
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription and meeting details saved"
      });

      setSelectedAppointment(null);
      setPrescription('');
      setMeetLink('');
      fetchAppointments();
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Error",
        description: "Failed to save prescription",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = (phone: string, patientName: string) => {
    const message = encodeURIComponent(`Hello ${patientName}, this is your doctor from MediConnect.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
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
      <RoleProtectedRoute allowedRole="doctor">
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
    <RoleProtectedRoute allowedRole="doctor">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
              <p className="text-muted-foreground">Manage your patient appointments</p>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No appointments scheduled</p>
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
                            {appointment.profiles.full_name}
                          </CardTitle>
                          <CardDescription>
                            {appointment.profiles.age} years • {appointment.profiles.gender}
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
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.profiles.phone}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Patient's Symptoms</Label>
                        <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                          {appointment.symptoms}
                        </p>
                      </div>

                      {appointment.prescription && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Prescription</Label>
                          <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                            {appointment.prescription}
                          </p>
                        </div>
                      )}

                      {appointment.meet_link && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Meeting Link</Label>
                          <a 
                            href={appointment.meet_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline block"
                          >
                            {appointment.meet_link}
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setPrescription(appointment.prescription || '');
                                setMeetLink(appointment.meet_link || '');
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {appointment.prescription ? 'Update' : 'Add'} Prescription
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Prescription & Meeting Details</DialogTitle>
                              <DialogDescription>
                                Add prescription and Google Meet link for {appointment.profiles.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="prescription">Prescription</Label>
                                <Textarea
                                  id="prescription"
                                  rows={6}
                                  placeholder="Enter prescription details, medications, dosage, etc."
                                  value={prescription}
                                  onChange={(e) => setPrescription(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="meetLink">Google Meet Link</Label>
                                <Input
                                  id="meetLink"
                                  type="url"
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  value={meetLink}
                                  onChange={(e) => setMeetLink(e.target.value)}
                                />
                              </div>
                              <Button onClick={savePrescription} className="w-full">
                                Save Details
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openWhatsApp(appointment.profiles.phone, appointment.profiles.full_name)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Button>

                        {appointment.meet_link && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(appointment.meet_link!, '_blank')}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Join Meeting
                          </Button>
                        )}

                        <Select 
                          value={appointment.status} 
                          onValueChange={(value) => updateStatus(appointment.id, value as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
