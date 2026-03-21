import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotFoundPage } from '@/components/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { ProjetsList } from '@/pages/dashboard/ProjetsList';
import { NouveauProjet } from '@/pages/dashboard/NouveauProjet';
import { EditProjet } from '@/pages/dashboard/EditProjet';
import { CandidatsList } from '@/pages/dashboard/CandidatsList';
import { MessagesPage } from '@/pages/dashboard/MessagesPage';
import { ParametresPage } from '@/pages/dashboard/ParametresPage';
import { PipelinePage } from '@/pages/dashboard/PipelinePage';
import { CandidatDetailPage } from '@/pages/dashboard/CandidatDetailPage';
import { FinancesPage } from '@/pages/dashboard/FinancesPage';
import { CalendrierPage } from '@/pages/dashboard/CalendrierPage';
import { StatistiquesPage } from '@/pages/dashboard/StatistiquesPage';
import { DocumentsGenerationPage } from '@/pages/dashboard/DocumentsGenerationPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { BolokoboueLanding } from '@/pages/landing/BolokoboueLanding';
import { YCIHLanding } from '@/pages/landing/YCIHLanding';
import { YCIHLandingZH } from '@/pages/landing/YCIHLandingZH';
import { YCIHGabonProjects } from '@/pages/landing/YCIHGabonProjects';
import { YCIHGabonProjectsZH } from '@/pages/landing/YCIHGabonProjectsZH';
import { BookingPage } from '@/pages/public/BookingPage';
import { CABINET_DEFAULT } from '@/lib/cabinetDefaults';

// Layout pour le dashboard
function DashboardLayout() {
  const { signOut, user } = useAuth();

  const cabinetName = user
    ? `${user.prenom} ${user.nom}`
    : CABINET_DEFAULT.nom;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar cabinetName={cabinetName} onLogout={handleLogout} />
      <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Landing pages publiques */}
          <Route path="/p/:slug" element={<LandingPage />} />
          <Route path="/bolokoboue" element={<BolokoboueLanding />} />
          <Route path="/ycih" element={<YCIHLanding />} />
          <Route path="/ycih/zh" element={<YCIHLandingZH />} />
          <Route path="/ycih/gabon" element={<YCIHGabonProjects />} />
          <Route path="/ycih/gabon/zh" element={<YCIHGabonProjectsZH />} />
          <Route path="/rdv/:token" element={<BookingPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard - routes protegees */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/projets" element={<ProjetsList />} />
              <Route path="/dashboard/nouveau-projet" element={<NouveauProjet />} />
              <Route path="/dashboard/projets/:projetId" element={<EditProjet />} />
              <Route path="/dashboard/candidats" element={<CandidatsList />} />
              <Route path="/dashboard/projets/:projetId/candidats" element={<CandidatsList />} />
              <Route path="/dashboard/projets/:projetId/pipeline" element={<PipelinePage />} />
              <Route path="/dashboard/projets/:projetId/candidats/:candidatId" element={<CandidatDetailPage />} />
              <Route path="/dashboard/projets/:projetId/finances" element={<FinancesPage />} />
              <Route path="/dashboard/projets/:projetId/documents" element={<DocumentsGenerationPage />} />
              <Route path="/dashboard/calendrier" element={<CalendrierPage />} />
              <Route path="/dashboard/statistiques" element={<StatistiquesPage />} />
              <Route path="/dashboard/messages" element={<MessagesPage />} />
              <Route path="/dashboard/parametres" element={<ParametresPage />} />
            </Route>
          </Route>

          {/* Redirection */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
