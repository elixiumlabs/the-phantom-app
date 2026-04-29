import { memo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { BrandProvider } from '@/contexts/BrandContext'

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

// App
import DashboardPage from '@/pages/app/DashboardPage'
import BrandLayout from '@/pages/app/BrandLayout'
import PhaseIdentify from '@/pages/app/PhaseIdentify'
import PhaseTest from '@/pages/app/PhaseTest'
import PhaseIterate from '@/pages/app/PhaseIterate'
import PhaseLock from '@/pages/app/PhaseLock'
import SettingsPage from '@/pages/app/SettingsPage'

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
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
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

    <Route path="/dashboard" element={
      <RequireAuth><DashboardPage /></RequireAuth>
    } />

    <Route path="/brand/:id" element={
      <RequireAuth><BrandLayout /></RequireAuth>
    }>
      <Route index element={<Navigate to="identify" replace />} />
      <Route path="identify" element={<PhaseIdentify />} />
      <Route path="test" element={<PhaseTest />} />
      <Route path="iterate" element={<PhaseIterate />} />
      <Route path="lock" element={<PhaseLock />} />
    </Route>

    <Route path="/settings" element={
      <RequireAuth><SettingsPage /></RequireAuth>
    } />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
))
AppRoutes.displayName = 'AppRoutes'

const App = memo(() => (
  <BrowserRouter>
    <AuthProvider>
      <BrandProvider>
        <AppRoutes />
      </BrandProvider>
    </AuthProvider>
  </BrowserRouter>
))

App.displayName = 'App'
export default App
