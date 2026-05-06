import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoLettersRef = useRef([]);
  const lineLeftRef = useRef(null);
  const lineRightRef = useRef(null);
  const taglineRef = useRef(null);
  const counterRef = useRef(null);
  const progressBarRef = useRef(null);
  const curtainTopRef = useRef(null);
  const curtainBottomRef = useRef(null);
  const [show, setShow] = useState(true);

  const brandName = "ELEVEN";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent body scroll during preloader
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setShow(false);
        if (onComplete) onComplete();
      },
    });

    // Phase 1: Counter ticks up from 0 → 100
    const counterObj = { val: 0 };
    tl.to(counterObj, {
      val: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = Math.floor(counterObj.val);
        }
      },
    });

    // Progress bar fills in sync
    tl.to(
      progressBarRef.current,
      {
        scaleX: 1,
        duration: 1.6,
        ease: "power2.inOut",
      },
      "<"
    );

    // Phase 2: Counter fades out, progress bar fades out
    tl.to([counterRef.current, progressBarRef.current?.parentElement], {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: "power2.in",
    });

    // Phase 3: Letters stagger in — each letter clips up into view
    tl.fromTo(
      logoLettersRef.current,
      {
        y: 80,
        opacity: 0,
        rotateX: 90,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
      },
      "-=0.1"
    );

    // Phase 4: Lines expand from center
    tl.fromTo(
      [lineLeftRef.current, lineRightRef.current],
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3"
    );

    // Phase 5: Tagline fades in
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.2"
    );

    // Hold for a beat
    tl.to({}, { duration: 0.4 });

    // Phase 6: Everything fades, curtains split open
    tl.to(
      [
        ...logoLettersRef.current,
        lineLeftRef.current,
        lineRightRef.current,
        taglineRef.current,
      ],
      {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.02,
      }
    );

    // Curtain reveal — top goes up, bottom goes down
    tl.to(
      curtainTopRef.current,
      {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
      },
      "-=0.2"
    );

    tl.to(
      curtainBottomRef.current,
      {
        yPercent: 100,
        duration: 0.8,
        ease: "power4.inOut",
      },
      "<"
    );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      {/* Top curtain */}
      <div
        ref={curtainTopRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000",
          zIndex: 2,
        }}
      />

      {/* Bottom curtain */}
      <div
        ref={curtainBottomRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000",
          zIndex: 2,
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        {/* Progress counter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <span
            ref={counterRef}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)",
              fontWeight: 300,
              letterSpacing: "0.3em",
              color: "#666",
            }}
          >
            0
          </span>

          {/* Progress bar container */}
          <div
            style={{
              width: "60px",
              height: "1px",
              background: "#333",
              overflow: "hidden",
            }}
          >
            <div
              ref={progressBarRef}
              style={{
                width: "100%",
                height: "100%",
                background: "#fff",
                transformOrigin: "left",
                transform: "scaleX(0)",
              }}
            />
          </div>
        </div>

        {/* Logo letters with lines */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            perspective: "600px",
          }}
        >
          {/* Left decorative line */}
          <div
            ref={lineLeftRef}
            style={{
              width: "clamp(30px, 8vw, 80px)",
              height: "1px",
              background: "#fff",
              marginRight: "clamp(12px, 3vw, 24px)",
              transformOrigin: "right",
              transform: "scaleX(0)",
            }}
          />

          {/* Brand letters */}
          {brandName.split("").map((letter, i) => (
            <span
              key={i}
              ref={(el) => (logoLettersRef.current[i] = el)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                fontWeight: 200,
                letterSpacing: "0.25em",
                color: "#ffffff",
                display: "inline-block",
                opacity: 0,
                transformStyle: "preserve-3d",
              }}
            >
              {letter}
            </span>
          ))}

          {/* Right decorative line */}
          <div
            ref={lineRightRef}
            style={{
              width: "clamp(30px, 8vw, 80px)",
              height: "1px",
              background: "#fff",
              marginLeft: "clamp(4px, 1vw, 8px)",
              transformOrigin: "left",
              transform: "scaleX(0)",
            }}
          />
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.55rem, 1.2vw, 0.7rem)",
            fontWeight: 400,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#777",
            opacity: 0,
            marginTop: "0.25rem",
          }}
        >
          Redefine Your Style
        </p>
      </div>
    </div>
  );
};

export default Preloader;
