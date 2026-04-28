import { memo, useEffect, useRef } from 'react';

type LiquidBackgroundProps = {
  className?: string;
};

export const LiquidBackground = memo(function LiquidBackground({ className }: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let phase = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      context.clearRect(0, 0, width, height);

      phase += 0.0028;

      const gradientA = context.createRadialGradient(
        width * (0.3 + Math.sin(phase * 0.8) * 0.08),
        height * (0.25 + Math.cos(phase) * 0.06),
        20,
        width * 0.45,
        height * 0.42,
        Math.max(width, height) * 0.7
      );

      gradientA.addColorStop(0, 'rgba(200, 241, 53, 0.24)');
      gradientA.addColorStop(0.45, 'rgba(66, 118, 255, 0.18)');
      gradientA.addColorStop(1, 'rgba(10, 10, 10, 0.04)');

      context.fillStyle = gradientA;
      context.fillRect(0, 0, width, height);

      const gradientB = context.createLinearGradient(0, 0, width, height);
      gradientB.addColorStop(0, `rgba(255, 78, 116, ${0.08 + Math.sin(phase * 2) * 0.03})`);
      gradientB.addColorStop(0.5, 'rgba(17, 17, 17, 0.15)');
      gradientB.addColorStop(1, `rgba(36, 144, 255, ${0.08 + Math.cos(phase * 1.5) * 0.03})`);

      context.fillStyle = gradientB;
      context.fillRect(0, 0, width, height);

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    render();

    const controller = new AbortController();
    window.addEventListener('resize', resize, { signal: controller.signal });

    return () => {
      controller.abort();
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas aria-hidden className={className} ref={canvasRef} />;
});
