import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Header } from '@/components/Header';
import { DoctorDashboard as DoctorDashboardContent } from '@/components/dashboard/DoctorDashboard';

export default function DoctorDashboard() {
  return (
    <RoleProtectedRoute allowedRole="doctor">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <DoctorDashboardContent />
        </main>
      </div>
    </RoleProtectedRoute>
  );
}
