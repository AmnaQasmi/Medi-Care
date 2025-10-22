import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock } from 'lucide-react';

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  profiles: {
    full_name: string;
  };
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    symptoms: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  useEffect(() => {
    fetchDoctor();
    if (user) {
      fetchUserProfile();
    }
  }, [doctorId, user]);

  const fetchDoctor = async () => {
    try {
      const { data: doctorData, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (error) throw error;

      if (doctorData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', doctorData.user_id)
          .single();

        setDoctor({
          ...doctorData,
          profiles: profileData || { full_name: 'Unknown' }
        });
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, age, gender, phone')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          fullName: data.full_name || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          phone: data.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setSubmitting(true);

    try {
      // Update user profile with latest info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          phone: formData.phone
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          patient_id: user.id,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          symptoms: formData.symptoms,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "Success",
        description: "Appointment booked successfully!"
      });

      navigate('/patient/dashboard');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Doctor not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
            <p className="text-muted-foreground">
              Schedule a consultation with Dr. {doctor.profiles.full_name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialization:</span>
                <span className="font-medium">{doctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Qualification:</span>
                <span className="font-medium">{doctor.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience:</span>
                <span className="font-medium">{doctor.experience_years} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation Fee:</span>
                <span className="font-medium">${doctor.consultation_fee}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
              <CardDescription>Please provide your information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Appointment Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Appointment Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      required
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Describe Your Symptoms/Problem *</Label>
                  <Textarea
                    id="symptoms"
                    required
                    rows={4}
                    placeholder="Please describe your symptoms or health concerns..."
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Book Appointment
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/doctors')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
