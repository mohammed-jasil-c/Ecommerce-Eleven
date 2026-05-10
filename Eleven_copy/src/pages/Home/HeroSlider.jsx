import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

const heroSets = [
  {
    headline: "ULTRABOOST",
    tagline: "Step into Hyperboost Edge. Now in new colors available on Eleven.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop",
    ],
    ctas: [
      { label: "Shop Men", link: "/shop?gender=men" },
      { label: "Shop Women", link: "/shop?gender=women" },
    ],
  },
  {
    headline: "NMD COLLECTION",
    tagline: "Future-forward design meets all-day comfort. Only at Eleven.",
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop",
    ],
    ctas: [
      { label: "Shop Now", link: "/shop" },
      { label: "New Arrivals", link: "/new-arrivals" },
    ],
  },
  {
    headline: "YEEZY 350 V2",
    tagline: "Iconic style, redefined. Limited stock available.",
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=1200&auto=format&fit=crop",
    ],
    ctas: [
      { label: "Shop Collection", link: "/shop" },
      { label: "View All", link: "/shop" },
    ],
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const panelsRef = useRef([]);
  const intervalRef = useRef(null);

  const slide = heroSets[current];

  // Preload all images
  useEffect(() => {
    heroSets.forEach((set) =>
      set.images.forEach((src) => {
        const img = new Image();
        img.src = src;
      })
    );
  }, []);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % heroSets.length);
    }, 7000);
    return () => clearInterval(intervalRef.current);
  }, [current]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    // Panels clip in from right
    tl.fromTo(
      panelsRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.inOut",
      }
    );

    // Text slides up
    tl.fromTo(
      contentRef.current?.children || [],
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      },
      "-=0.4"
    );

    return () => tl.kill();
  }, [current]);

  const goTo = (indexOrFn) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const nextIndex =
      typeof indexOrFn === "function" ? indexOrFn(current) : indexOrFn;

    // Exit animation
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(nextIndex);
        setIsAnimating(false);
      },
    });

    tl.to(contentRef.current?.children || [], {
      y: -30,
      opacity: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.in",
    });

    tl.to(
      panelsRef.current,
      {
        clipPath: "inset(0 0 0 100%)",
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.inOut",
      },
      "-=0.1"
    );
  };

  const handlePrev = () => {
    clearInterval(intervalRef.current);
    goTo((current - 1 + heroSets.length) % heroSets.length);
  };

  const handleNext = () => {
    clearInterval(intervalRef.current);
    goTo((current + 1) % heroSets.length);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* ═══ 3-Panel Image Grid ═══ */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr",
          height: "calc(100dvh - 64px)",
          minHeight: "500px",
        }}
      >
        {slide.images.map((src, i) => (
          <div
            key={`${current}-${i}`}
            ref={(el) => (panelsRef.current[i] = el)}
            className="relative overflow-hidden"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            <img
              src={src}
              alt={`${slide.headline} panel ${i + 1}`}
              className="w-full h-full object-cover"
              style={{
                transition: "transform 8s ease-out",
                transform: "scale(1.05)",
              }}
              onLoad={(e) => {
                setTimeout(() => {
                  e.target.style.transform = "scale(1)";
                }, 100);
              }}
            />

            {/* Dark gradient overlay on each panel */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  i === 0
                    ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* ═══ Bottom Content Overlay (Adidas-style) ═══ */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{ padding: "0 clamp(1.5rem, 4vw, 3rem) clamp(2rem, 5vw, 3.5rem)" }}
      >
        <div ref={contentRef} style={{ maxWidth: "700px" }}>
          {/* Headline with highlight background */}
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1.8rem, 4.5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                background: "#000",
                padding: "0.1em 0.3em",
                display: "inline",
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              {slide.headline}
            </span>
          </h2>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.5,
              marginBottom: "1.5rem",
              maxWidth: "480px",
            }}
          >
            <span
              style={{
                background: "#000",
                padding: "0.15em 0.3em",
                display: "inline",
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              {slide.tagline}
            </span>
          </p>

          {/* CTA Buttons — Adidas outline style with arrows */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {slide.ctas.map((cta, i) => (
              <Link
                key={i}
                to={cta.link}
                className="group"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.85rem 1.5rem",
                  background: i === 0 ? "#fff" : "transparent",
                  color: i === 0 ? "#000" : "#fff",
                  border: i === 0 ? "2px solid #fff" : "2px solid #fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (i === 0) {
                    e.currentTarget.style.background = "#000";
                    e.currentTarget.style.color = "#fff";
                  } else {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#000";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i === 0) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#000";
                  } else {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
              >
                {cta.label}
                <ArrowRight
                  size={16}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                  className="group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Navigation Arrows ═══ */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center"
        style={{
          width: "48px",
          height: "48px",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "#fff";
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center"
        style={{
          width: "48px",
          height: "48px",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "#fff";
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* ═══ Progress Indicators (bottom-right) ═══ */}
      <div
        className="absolute bottom-8 right-8 z-30 hidden md:flex items-center gap-3"
      >
        {heroSets.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              clearInterval(intervalRef.current);
              goTo(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === current ? "32px" : "12px",
              height: "3px",
              background: idx === current ? "#fff" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.4s ease",
            }}
          />
        ))}

        {/* Slide counter */}
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.6)",
            marginLeft: "0.5rem",
          }}
        >
          {String(current + 1).padStart(2, "0")} / {String(heroSets.length).padStart(2, "0")}
        </span>
      </div>

      {/* ═══ Mobile dots ═══ */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden z-30">
        {heroSets.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              clearInterval(intervalRef.current);
              goTo(idx);
            }}
            style={{
              width: idx === current ? "24px" : "8px",
              height: "3px",
              background: idx === current ? "#fff" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* ═══ Mobile: stack panels vertically ═══ */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .grid[style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
                grid-template-rows: 1fr 0.5fr !important;
                height: calc(100dvh - 64px) !important;
              }
              .grid[style*="grid-template-columns"] > div:nth-child(3) {
                display: none;
              }
            }
          `,
        }}
      />
    </section>
  );
};

export default HeroSlider;