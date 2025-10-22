import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  bio: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const doctorsWithProfiles = data.map(doctor => ({
          ...doctor,
          profiles: profilesData?.find(p => p.user_id === doctor.user_id) || {
            full_name: 'Unknown',
            avatar_url: null
          }
        }));
        
        setDoctors(doctorsWithProfiles as Doctor[]);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
            <p className="text-muted-foreground">Browse our network of qualified healthcare professionals</p>
          </div>

          {doctors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No doctors available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">
                          Dr. {doctor.profiles?.full_name || 'Unknown'}
                        </CardTitle>
                        <Badge variant="secondary" className="mb-2">
                          {doctor.specialization}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {doctor.qualification && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                        <p className="text-sm">{doctor.qualification}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-medium">{doctor.experience_years} years</p>
                      </div>
                      {doctor.consultation_fee && (
                        <div className="text-right">
                          <p className="text-muted-foreground">Fee</p>
                          <p className="font-medium">${doctor.consultation_fee}</p>
                        </div>
                      )}
                    </div>

                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>
                    )}

                    <Button className="w-full" onClick={() => navigate(`/book-appointment/${doctor.id}`)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
