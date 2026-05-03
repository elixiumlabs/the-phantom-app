import { memo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProjectProvider } from '@/contexts/ProjectContext'

// Landing page
import LiquidBackground from '@/components/LiquidBackground'
import NavigationDock from '@/components/NavigationDock'
import HeroSection from '@/components/HeroSection'
import SocialProofBar from '@/components/SocialProofBar'
import ProblemSection from '@/components/ProblemSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import FeaturesSection from '@/components/FeaturesSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import PricingSection from '@/components/PricingSection'
import FooterSection from '@/components/FooterSection'

// Auth
import AuthPage from '@/pages/AuthPage'
import OnboardingPage from '@/pages/OnboardingPage'

// App
import DashboardPage from '@/pages/app/DashboardPage'
import BrandLayout from '@/pages/app/BrandLayout'
import PhaseIdentify from '@/pages/app/PhaseIdentify'
import PhaseTest from '@/pages/app/PhaseTest'
import PhaseIterate from '@/pages/app/PhaseIterate'
import PhaseLock from '@/pages/app/PhaseLock'
import SettingsPage from '@/pages/app/SettingsPage'
import VaultPage from '@/pages/app/VaultPage'
import SignalTrackerPage from '@/pages/app/SignalTrackerPage'
import TemplatesPage from '@/pages/app/TemplatesPage'
import ValidationDashboardPage from '@/pages/app/ValidationDashboardPage'
import AIBrandAssistantPage from '@/pages/app/AIBrandAssistantPage'
import BlogPage from '@/pages/BlogPage'
import RefundPolicyPage from '@/pages/RefundPolicyPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/TermsOfServicePage'
import CookiePolicyPage from '@/pages/CookiePolicyPage'
import FeaturesPage from '@/pages/FeaturesPage'
import PricingPage from '@/pages/PricingPage'
import HowItWorksPage from '@/pages/HowItWorksPage'
import SystemStatusPage from '@/pages/SystemStatusPage'
import AffiliatesPage from '@/pages/AffiliatesPage'
import DiagnosticPage from '@/pages/DiagnosticPage'
import IntegrationsHelpPage from '@/pages/IntegrationsHelpPage'

const LandingPage = memo(() => (
  <div className="relative min-h-screen">
    <LiquidBackground />
    <div className="relative z-10">
      <NavigationDock />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  </div>
))
LandingPage.displayName = 'LandingPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="label text-phantom-lime">Loading...</span>
    </div>
  )
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  // Anyone signed in but not yet onboarded gets pushed through onboarding,
  // unless they're already on it.
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="label text-phantom-lime">Loading...</span>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  // If they've already onboarded, route them away from this page.
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    // Send straight into onboarding if they haven't done it yet.
    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />
  }
  return <>{children}</>
}

const AppRoutes = memo(() => (
  <Routes>
    <Route path="/" element={<LandingPage />} />

    <Route path="/login" element={
      <RedirectIfAuthed><AuthPage mode="login" /></RedirectIfAuthed>
    } />
    <Route path="/signup" element={
      <RedirectIfAuthed><AuthPage mode="signup" /></RedirectIfAuthed>
    } />

    <Route path="/onboarding" element={
      <RequireOnboarding><OnboardingPage /></RequireOnboarding>
    } />

    <Route path="/dashboard" element={
      <RequireAuth><DashboardPage /></RequireAuth>
    } />

    <Route path="/project/:id" element={
      <RequireAuth><BrandLayout /></RequireAuth>
    }>
      <Route index element={<Navigate to="identify" replace />} />
      <Route path="identify" element={<PhaseIdentify />} />
      <Route path="test" element={<PhaseTest />} />
      <Route path="iterate" element={<PhaseIterate />} />
      <Route path="lock" element={<PhaseLock />} />
    </Route>

    <Route path="/vault" element={
      <RequireAuth><VaultPage /></RequireAuth>
    } />

    <Route path="/signals" element={
      <RequireAuth><SignalTrackerPage /></RequireAuth>
    } />

    <Route path="/templates" element={
      <RequireAuth><TemplatesPage /></RequireAuth>
    } />

    <Route path="/validation" element={
      <RequireAuth><ValidationDashboardPage /></RequireAuth>
    } />

    <Route path="/assistant" element={
      <RequireAuth><AIBrandAssistantPage /></RequireAuth>
    } />

    <Route path="/settings" element={
      <RequireAuth><SettingsPage /></RequireAuth>
    } />

    <Route path="/blog" element={<BlogPage />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/status" element={<SystemStatusPage />} />
    <Route path="/affiliates" element={<AffiliatesPage />} />
    <Route path="/refund-policy" element={<RefundPolicyPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
    <Route path="/diagnostic" element={<DiagnosticPage />} />
    <Route path="/help/integrations" element={<IntegrationsHelpPage />} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
))
AppRoutes.displayName = 'AppRoutes'

const App = memo(() => (
  <BrowserRouter>
    <AuthProvider>
      <ProjectProvider>
        <AppRoutes />
      </ProjectProvider>
    </AuthProvider>
  </BrowserRouter>
))

App.displayName = 'App'
export default App
