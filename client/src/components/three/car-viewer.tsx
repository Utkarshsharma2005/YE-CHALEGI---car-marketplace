import { useState, useRef } from "react";
import { motion, useSpring } from "motion/react";
import heroImg from "@/assets/hero-car-rotated-rotated.jpeg";

/** Interactive mouse-tilting hypercar image component replacing 3D canvas models */
export function CarViewer({
  color = "#c9ccd2",
  className = "",
  label = "Hover to tilt & rotate 3D view",
  image = heroImg,
}: {
  color?: string;
  className?: string;
  label?: string;
  image?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const rotateXSpring = useSpring(0, { stiffness: 180, damping: 20 });
  const rotateYSpring = useSpring(0, { stiffness: 180, damping: 20 });
  const translateXSpring = useSpring(0, { stiffness: 180, damping: 20 });
  const translateYSpring = useSpring(0, { stiffness: 180, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Percentages (0 to 100)
    setMousePos({ x: (mouseX / width) * 100, y: (mouseY / height) * 100 });

    // Ratios from center (-0.5 to +0.5)
    const xRatio = mouseX / width - 0.5;
    const yRatio = mouseY / height - 0.5;

    // Set 3D tilt & offset (moving cursor down shifts image down slightly)
    rotateXSpring.set(-yRatio * 28);
    rotateYSpring.set(xRatio * 28);
    translateXSpring.set(xRatio * 25);
    translateYSpring.set(yRatio * 25);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateXSpring.set(0);
    rotateYSpring.set(0);
    translateXSpring.set(0);
    translateYSpring.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl bg-[#0b0c0e] border border-white/10 select-none cursor-grab active:cursor-grabbing [perspective:1000px] ${className}`}
    >
      {/* Dynamic Cursor Light Sheen */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.12), transparent 40%)`,
          }}
        />
      )}

      {/* Tilting & Translating Image Frame */}
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          x: translateXSpring,
          y: translateYSpring,
          transformStyle: "preserve-3d",
        }}
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-full w-full"
      >
        <img
          src={image}
          alt="Hypercar interactive view"
          className="h-full w-full object-cover object-center shadow-2xl transition-all duration-300"
        />

        {/* Ambient Overlay & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      </motion.div>

      {/* Label Badge */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-4 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-white/90 shadow-lg border border-white/20 z-30"
      >
        {label.toUpperCase()}
      </motion.span>
    </div>
  );
}
