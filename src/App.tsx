import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuthContext } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Collaborate from "./pages/Collaborate";
import Resources from "./pages/Resources";
import Showcase from "./pages/Showcase";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, signOut } = useAuthContext();

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="text-4xl font-bold italic text-foreground">Roundtable</div>
          <p className="text-muted-foreground animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/auth"
          element={
            user ? <Navigate to="/" replace /> : <Auth mode="signin" onLogin={() => {}} />
          }
        />
        <Route
          path="/signup"
          element={
            user ? <Navigate to="/" replace /> : <Auth mode="signup" onSignup={() => {}} />
          }
        />

        {/* Protected Routes */}
        {user ? (
          <Route path="/" element={<Layout onLogout={signOut} />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="collaborate" element={<Collaborate />} />
            <Route path="resources" element={<Resources />} />
            <Route path="showcase" element={<Showcase />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        ) : (
          <Route path="/" element={<Navigate to="/auth" replace />} />
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
