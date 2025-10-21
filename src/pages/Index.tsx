import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, Clock, Shield, Users, CheckCircle } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Connect with trusted healthcare professionals. Book appointments seamlessly and manage your health journey with confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                  <Link to="/auth">Book Appointment</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/doctors">Find Doctors</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Activity className="w-32 h-32 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MediConnect?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional healthcare management made simple and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Book appointments in seconds with our intuitive calendar system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-accent mb-2" />
                <CardTitle>Trusted Doctors</CardTitle>
                <CardDescription>
                  Connect with verified healthcare professionals across specializations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-secondary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your health data is protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications about appointment status and reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-success mb-2" />
                <CardTitle>Verified Profiles</CardTitle>
                <CardDescription>
                  All doctors are verified with credentials and experience details
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Activity className="w-12 h-12 text-accent mb-2" />
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>
                  Keep track of your medical history and appointments in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to better healthcare</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up in seconds and complete your profile
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold">Find Doctor</h3>
              <p className="text-muted-foreground">
                Search and select from our network of verified doctors
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-secondary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Book & Visit</h3>
              <p className="text-muted-foreground">
                Schedule your appointment and get confirmation instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of patients who trust MediConnect for their healthcare needs
              </p>
              <Button size="lg" variant="secondary" asChild className="shadow-lg">
                <Link to="/auth">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2025 MediConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
