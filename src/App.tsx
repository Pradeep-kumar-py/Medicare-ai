import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { AuthDebugInfo } from "./components/auth/AuthDebugInfo";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SymptomChecker from "./components/SymptomChecker";
import AppointmentScheduler from "./components/AppointmentScheduler";
import MedicationReminder from "./components/MedicationReminder";
import HealthDashboard from "./components/HealthDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import DatabaseDebug from "./components/DatabaseDebug";
import SignupDebug from "./components/SignupDebug";
import Teleconsultation from "./components/Teleconsultation";
import TeleconsultancyPrototype from "./components/TeleconsultancyPrototype";
import TeleconsultancyPrototypePage from "./pages/TeleconsultancyPrototype";
import HealthAlerts from "./components/HealthAlerts";
import HealthTrends from "./components/HealthTrends";
import MedicineHub from "./components/MedicineHub";
import HospitalLocator from "./components/HospitalLocator";
import AmbulanceSystem from "./components/AmbulanceSystem";
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
              {/* <AuthDebugInfo /> */}
              <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
                
                {/* Demo-friendly routes - minimal protection for hackathon */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                      <Chatbot />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/symptoms" element={
                  <Layout>
                    <SymptomChecker />
                    <Chatbot />
                  </Layout>
                } />
                
                <Route path="/appointments" element={
                  <Layout>
                    <AppointmentScheduler />
                    <Chatbot />
                  </Layout>
                } />
                
                <Route path="/reminders" element={
                  <Layout>
                    <MedicationReminder />
                    <Chatbot />
                  </Layout>
                } />
                
                {/* <Route path="/dashboard" element={
                  <Layout>
                    <HealthDashboard />
                    <Chatbot />
                  </Layout>
                } /> */}
                
                <Route path="/teleconsultation" element={
                  <Layout>
                    <TeleconsultancyPrototype />
                  </Layout>
                } />

                {/* Teleconsultancy Prototype for Presentation */}
                <Route path="/teleconsultancy-prototype" element={
                  <Layout>
                    {/* No Chatbot for clean demo */}
                    <TeleconsultancyPrototypePage />
                  </Layout>
                } />
                
                <Route path="/doctor-dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <DoctorDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/debug" element={
                  <Layout>
                    <div className="space-y-6">
                      <SignupDebug />
                      <DatabaseDebug />
                    </div>
                  </Layout>
                } />
                
                <Route path="/alerts" element={
                  <Layout>
                    <HealthAlerts />
                    <Chatbot />
                  </Layout>
                } />
{/*                 
                <Route path="/trends" element={
                  <Layout>
                    <HealthTrends />
                    <Chatbot />
                  </Layout>
                } /> */}
                
                <Route path="/medicine-hub" element={
                  <Layout>
                    <MedicineHub />
                    <Chatbot />
                  </Layout>
                } />
                
                <Route path="/hospital-locator" element={
                  <Layout>
                    <HospitalLocator />
                    <Chatbot />
                  </Layout>
                } />
                
                <Route path="/ambulance" element={
                  <Layout>
                    <AmbulanceSystem />
                  </Layout>
                } />
                
                {/* <Route path="/insurance" element={
                  <Layout>
                    <InsuranceSupport />
                    <Chatbot />
                  </Layout>
                } /> */}
                
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
