import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SymptomChecker from "./components/SymptomChecker";
import AppointmentScheduler from "./components/AppointmentScheduler";
import MedicationReminder from "./components/MedicationReminder";
import HealthDashboard from "./components/HealthDashboard";
import Teleconsultation from "./components/Teleconsultation";
import HealthAlerts from "./components/HealthAlerts";
import HealthTrends from "./components/HealthTrends";
import MedicineHub from "./components/MedicineHub";
import HospitalLocator from "./components/HospitalLocator";
import InsuranceSupport from "./components/InsuranceSupport";
import Profile from "./components/Profile";
import Chatbot from "./components/Chatbot";
import AuthPage from "./pages/AuthPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="medicare-ai-theme">
      <TooltipProvider>
        <LanguageProvider>
          <AuthErrorBoundary>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/symptoms" element={
                  <ProtectedRoute>
                    <Layout>
                      <SymptomChecker />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <Layout>
                      <AppointmentScheduler />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/reminders" element={
                  <ProtectedRoute>
                    <Layout>
                      <MedicationReminder />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <HealthDashboard />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/teleconsultation" element={
                  <ProtectedRoute>
                    <Layout>
                      <Teleconsultation />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <Layout>
                      <HealthAlerts />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/trends" element={
                  <ProtectedRoute>
                    <Layout>
                      <HealthTrends />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/medicine-hub" element={
                  <ProtectedRoute>
                    <Layout>
                      <MedicineHub />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/hospital-locator" element={
                  <ProtectedRoute>
                    <Layout>
                      <HospitalLocator />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/insurance" element={
                  <ProtectedRoute>
                    <Layout>
                      <InsuranceSupport />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </AuthErrorBoundary>
      </LanguageProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
