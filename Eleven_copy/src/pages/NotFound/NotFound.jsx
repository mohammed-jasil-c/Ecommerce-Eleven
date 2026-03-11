import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

function NotFound() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ delay: 0.3 });
    const els = containerRef.current.querySelectorAll(".reveal");

    tl.fromTo(
      els,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );

    return () => tl.kill();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative orb */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div ref={containerRef} style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: "600px" }}>
        {/* 404 Number */}
        <div
          className="reveal"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(7rem, 20vw, 12rem)",
            fontWeight: 400,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(201,169,110,0.35)",
            marginBottom: "-0.5rem",
            letterSpacing: "0.1em",
          }}
        >
          404
        </div>

        <div className="divider-gold reveal" style={{ margin: "1.5rem auto" }} />

        <h1
          className="reveal"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 400,
            color: "#fff",
            marginBottom: "1rem",
            letterSpacing: "0.05em",
          }}
        >
          Page Not Found
        </h1>

        <p
          className="reveal"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            maxWidth: "440px",
            margin: "0 auto 2.5rem",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to exploring our collection.
        </p>

        {/* Buttons */}
        <div
          className="reveal"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginBottom: "3rem",
          }}
        >
          <Link
            to="/"
            className="btn-premium btn-primary"
            style={{ textDecoration: "none", borderRadius: "var(--radius-sm)" }}
          >
            <span>Back to Home</span>
          </Link>
          <Link
            to="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.85rem 2rem",
              fontSize: "0.6rem",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#fff",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.3s ease",
            }}
          >
            Continue Shopping
          </Link>
        </div>

        {/* Quick Links */}
        <div className="reveal" style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p
            style={{
              fontSize: "0.55rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "1rem",
            }}
          >
            Quick Links
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem" }}>
            {[
              { to: "/shop?category=women", label: "Women's Collection" },
              { to: "/shop?category=men", label: "Men's Collection" },
              { to: "/shop?category=new", label: "New Arrivals" },
              { to: "/contact", label: "Contact Support" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-body)",
                  transition: "color 0.2s ease",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
