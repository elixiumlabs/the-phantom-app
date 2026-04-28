import { NavigationDock } from './components/liquid/NavigationDock';
import { HeroSection } from './components/liquid/HeroSection';
import { LiquidBackground } from './components/liquid/LiquidBackground';
import './styles/liquid-glass.css';

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <LiquidBackground className="pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
      <NavigationDock />
      <HeroSection />
    </main>
  );
}
