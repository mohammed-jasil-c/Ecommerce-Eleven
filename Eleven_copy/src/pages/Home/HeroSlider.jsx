import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1925&auto=format&fit=crop",
    title: "ULTRABOOST",
    subtitle: "Energy that never stops.",
    cta: "SHOP COLLECTION",
    link: "/shop",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1925&auto=format&fit=crop",
    title: "NMD_R1 V2",
    subtitle: "Step into the future.",
    cta: "EXPLORE",
    link: "/shop",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1925&auto=format&fit=crop",
    title: "YEEZY BOOST 350 V2",
    subtitle: "Iconic style, redefined.",
    cta: "SHOP NOW",
    link: "/shop",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef(null);

  const startSlider = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const stopSlider = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    setIsLoaded(true);

    // preload images
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });

    startSlider();

    return () => stopSlider();
  }, []);

  return (
    <section
      className="relative w-full h-[100dvh] overflow-hidden bg-black text-white"
      onMouseEnter={stopSlider}
      onMouseLeave={startSlider}
    >
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]
          ${
            index === currentSlide
              ? "opacity-100 scale-100 z-0"
              : "opacity-0 scale-105 pointer-events-none z-0"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
        </div>
      ))}

      {/* ELEVEN Title */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-[1.5s] ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        <h1
          className="text-[clamp(4rem,20vw,18rem)] font-light uppercase mix-blend-overlay"
          style={{
            fontFamily:
              "'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', serif",
            letterSpacing: "0.15em",
            textShadow: "0 10px 50px rgba(0,0,0,0.8)",
          }}
        >
          ELEVEN
        </h1>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col lg:flex-row justify-between lg:items-end w-full max-w-[1920px] mx-auto pb-16 px-6 md:pb-24 md:px-12 xl:px-24">
        {/* Text */}
        <div className="max-w-2xl mb-8 lg:mb-0">
          <h2
            key={`title-${currentSlide}`}
            className="text-white font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight slide-up-anim"
          >
            {slides[currentSlide].title}
          </h2>

          <p
            key={`subtitle-${currentSlide}`}
            className="text-gray-200 text-lg md:text-xl lg:text-2xl mt-2 slide-up-anim-delay"
          >
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* CTA */}
        <Link
          to={slides[currentSlide].link}
          className="group relative flex items-center justify-center gap-3 bg-white text-black px-12 py-5 uppercase tracking-[0.25em] text-xs font-bold min-w-[220px] overflow-hidden transition-colors hover:text-white"
        >
          <span className="relative z-10 flex items-center gap-3">
            {slides[currentSlide].cta}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>

          <div className="absolute inset-0 bg-black translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
        </Link>
      </div>

      {/* Desktop Pagination */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`rounded-full transition-all duration-500 ${
              idx === currentSlide
                ? "w-[3px] h-16 bg-white"
                : "w-[3px] h-4 bg-white/40 hover:h-8"
            }`}
          />
        ))}
      </div>

      {/* Mobile Pagination */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 lg:hidden z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-500 ${
              idx === currentSlide
                ? "w-10 h-[3px] bg-white"
                : "w-4 h-[3px] bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .slide-up-anim {
            animation: slideUp 1s cubic-bezier(.16,1,.3,1) forwards;
        }

        .slide-up-anim-delay {
            animation: slideUp 1.2s cubic-bezier(.16,1,.3,1) forwards;
        }

        @keyframes slideUp {
            from {
                transform: translateY(80%);
                opacity:0;
            }
            to {
                transform: translateY(0);
                opacity:1;
            }
        }
        `,
        }}
      />
    </section>
  );
};

export default HeroSlider;