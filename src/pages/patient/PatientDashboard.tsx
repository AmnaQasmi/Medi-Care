import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Header } from '@/components/Header';
import { PatientDashboard as PatientDashboardContent } from '@/components/dashboard/PatientDashboard';

export default function PatientDashboard() {
  return (
    <RoleProtectedRoute allowedRole="patient">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <PatientDashboardContent />
        </main>
      </div>
    </RoleProtectedRoute>
  );
}
