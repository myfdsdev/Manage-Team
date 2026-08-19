import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as HotToaster } from "react-hot-toast";
import { AppAlertHost } from "@/components/ui/app-alert";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import NavigationTracker from "@/lib/NavigationTracker";
import { pagesConfig } from "./pages.config";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { AppSettingsProvider } from "@/lib/AppSettingsContext";
import { ActivityTrackerProvider } from "@/lib/ActivityTracker";
import { CompanyProvider } from "@/lib/CompanyContext";
import CookieConsent from "@/components/CookieConsent";

const { Pages, Layout } = pagesConfig;

const PUBLIC_PAGES = [
  "Welcome",
  "Login",
  "Register",
  "join-admin",
  "join-member",
  "no-access",
  "PrivacyPolicy",
  "AccessDenied",
  "ResetPassword",
];

const NO_LAYOUT_PAGES = [
  "Welcome",
  "Login",
  "Register",
  "join-admin",
  "join-member",
  "no-access",
  "CompleteProfile",
  "AccessDenied",
  "ResetPassword",
  "CompanySetup",
  "PrivacyPolicy",
];

const ADMIN_PAGES = [
  "AdminDashboard",
  "AttendanceReports",
  "CompanySettings",
  "DomainSettings",
  "SalaryManagement",
  "SalaryBoard",
  "SalaryConfig",
];

const SUPER_ADMIN_PAGES = ["SuperAdmin"];

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
};

const LayoutWrapper = ({ children, currentPageName }) => {
  if (NO_LAYOUT_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  return Layout ? (
    <Layout currentPageName={currentPageName}>{children}</Layout>
  ) : (
    <>{children}</>
  );
};

const getUserRedirectPage = (user) => {
  if (!user) return "/Welcome";
  if (user.role === "super_admin") return "/SuperAdmin";

  // No workspace yet AND not unlocked via /join-admin → they can't create a
  // workspace, so send them to the message page instead of CompanySetup.
  // (Existing workspace members keep flowing to their dashboard below.)
  if (!user.company_id && !user.has_app_access) {
    return "/no-access";
  }

  const isProfileComplete =
    user.mobile_number && user.department;

  if (!isProfileComplete) {
    return "/CompleteProfile";
  }

  if (!user.company_id) {
    return "/CompanySetup";
  }

  if (user.role === "admin") {
    return "/AdminDashboard";
  }

  return "/Dashboard";
};

const ProtectedRoute = ({ pageName, Page }) => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  const isPublicPage = PUBLIC_PAGES.includes(pageName);

  if (isPublicPage) {
    return (
      <LayoutWrapper currentPageName={pageName}>
        <Page />
      </LayoutWrapper>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Welcome" state={{ from: location }} replace />;
  }

  if (SUPER_ADMIN_PAGES.includes(pageName)) {
    if (user?.role !== "super_admin") {
      return <Navigate to="/AccessDenied" replace />;
    }

    return (
      <LayoutWrapper currentPageName={pageName}>
        <Page />
      </LayoutWrapper>
    );
  }

  // Super admin = god mode. They can visit ANY page in the app, behave as a
  // regular admin or user inside workspaces, and their role never changes.
  // Skip every gate below for them.
  const isSuperAdmin = user?.role === "super_admin";

  // Access gate — a logged-in user who hasn't unlocked via /join-admin AND isn't
  // in a workspace yet can ONLY see the message page. This blocks the whole
  // onboarding surface (CompanySetup, CompleteProfile) and the rest of the app
  // for normal logins. Existing workspace members (they have a company_id) and
  // unlocked users pass through. Invited teammates arrive at CompanySetup with
  // ?invite/?code and are let through so they can still JOIN an existing team.
  const isBlocked = !isSuperAdmin && !user?.has_app_access && !user?.company_id;
  if (isBlocked) {
    const params = new URLSearchParams(location.search);
    const hasInvite = params.get("invite") || params.get("code");
    if (!(pageName === "CompanySetup" && hasInvite)) {
      return <Navigate to="/no-access" replace />;
    }
  }

  // Profile completion is required before the app, but NOT before creating a
  // workspace — a freshly unlocked user goes straight to CompanySetup.
  if (!isSuperAdmin && !["CompleteProfile", "CompanySetup"].includes(pageName)) {
    const isProfileComplete =
      user?.mobile_number && user?.department;

    if (!isProfileComplete) {
      return <Navigate to="/CompleteProfile" replace />;
    }
  }

  if (!isSuperAdmin && pageName === "CompanySetup" && user?.company_id) {
    return <Navigate to={getUserRedirectPage(user)} replace />;
  }

  if (
    !isSuperAdmin &&
    !["CompleteProfile", "CompanySetup"].includes(pageName) &&
    !user?.company_id
  ) {
    return <Navigate to="/CompanySetup" replace />;
  }

  // Admin pages: super_admin counts as admin.
  if (
    ADMIN_PAGES.includes(pageName) &&
    user?.role !== "admin" &&
    !isSuperAdmin
  ) {
    return <Navigate to="/AccessDenied" replace />;
  }

  return (
    <LayoutWrapper currentPageName={pageName}>
      <Page />
    </LayoutWrapper>
  );
};

const RootRoute = () => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Welcome" replace />;
  }

  return <Navigate to={getUserRedirectPage(user)} replace />;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={<ProtectedRoute pageName={path} Page={Page} />}
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <CompanyProvider>
          <QueryClientProvider client={queryClientInstance}>
            <TooltipProvider delayDuration={300}>
              <Router>
                <NavigationTracker />
                <ActivityTrackerProvider>
                  <AuthenticatedApp />
                </ActivityTrackerProvider>
              </Router>
            </TooltipProvider>
            <Toaster />
            <HotToaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#020806",
                  color: "#fff",
                  border: "1px solid rgba(163, 230, 53, 0.18)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                },
                success: { iconTheme: { primary: "#a3e635", secondary: "#020806" } },
                error: { iconTheme: { primary: "#fb7185", secondary: "#020806" } },
              }}
            />
            <AppAlertHost />
            <CookieConsent />
          </QueryClientProvider>
        </CompanyProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}

export default App;
